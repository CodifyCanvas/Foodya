"use server";

import { schema } from "@/lib/drizzle-schema";
import { db } from "../db";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { EmployeePayrollInterface, PayrollDialogSalaryRow, PayrollSummary } from "../definations";
import { insertData } from "./general-actions";
import { formatMonth } from "../utils";



// === Drizzle table schemas ===
const payrollsTable = schema.payrollsTable;
const employeesTable = schema.employeesTable;
const employmentRecordsTable = schema.employmentRecordsTable;



/**
 * === Fetches payroll summaries for all employees with their latest designation. ===
 * 
 * - Reads from `employeesTable`, `employmentRecordsTable`, and `payrollsTable`.
 * - Uses a subquery to get the latest employment record per employee.
 * - Fetches all payrolls in one query and groups them by employee.
 * - Calculates unpaid months, previous balance, current salary, and payroll status.
 * 
 * @returns An array of payroll summaries for each employee.
 */
export const getAllPayrollsWithEmployeeDetails = async () => {
  // === Subquery: Get latest designation record for each employee ===
  const latestRecordSubquery = db
    .select({
      employeeId: employmentRecordsTable.employeeId,
      latestRecordId: sql<number>`MAX(${employmentRecordsTable.id})`.as("latestRecordId"),
    })
    .from(employmentRecordsTable)
    .groupBy(employmentRecordsTable.employeeId)
    .as("latestRecords");

  // === Join employees with their latest designation ===
  const employeesWithDesignation = await db
    .select({
      id: employeesTable.id,
      name: employeesTable.name,
      salary: employeesTable.salary,
      designation: employmentRecordsTable.designation,
    })
    .from(employeesTable)
    .leftJoin(
      latestRecordSubquery,
      eq(latestRecordSubquery.employeeId, employeesTable.id)
    )
    .leftJoin(
      employmentRecordsTable,
      eq(employmentRecordsTable.id, latestRecordSubquery.latestRecordId)
    );

  // === Fetch all payrolls for all employees in one query ===
  const allPayrolls = await db
    .select()
    .from(payrollsTable);

  // === Group payrolls by employeeId for faster access ===
  const payrollsByEmployee = allPayrolls.reduce((acc, payroll) => {
    if (payroll.employeeId === null) return acc;

    const empId = payroll.employeeId;
    if (!acc[empId]) acc[empId] = [];
    acc[empId].push(payroll);
    return acc;
  }, {} as Record<number, typeof allPayrolls>);

  // === Build the final result for each employee ===
  const results = employeesWithDesignation.map((emp, index) => {
    const payrolls = payrollsByEmployee[emp.id] || [];

    const unpaidPayrolls = payrolls.filter(p => p.status === "pending");

    const unpaidMonths = unpaidPayrolls.map(p => p.month);

    const prevBalance = unpaidPayrolls.reduce(
      (sum, p) => sum + Number(p.totalPay),
      0
    );

    const latestPayroll = payrolls.reduce((latest, current) => {
      return new Date(current.month) > new Date(latest?.month || 0)
        ? current
        : latest;
    }, null as typeof payrolls[0] | null);

    const thisMonth =
      Number(emp.salary) +
      Number(latestPayroll?.bonus || 0) -
      Number(latestPayroll?.penalty || 0);

    return {
      id: index + 1,
      employeeId: emp.id,
      employee: emp.name,
      designation: emp.designation,
      unpaidMonths,
      currentSalary: emp.salary,
      prevBalance,
      thisMonth,
      status: latestPayroll?.status || "pending",
    };
  });

  return results;
};



/**
 * === Helper Function ===
 * 
 * Generates a list of months between two dates (inclusive) in 'YYYY-MM' format.
 * Example: '2025-01' to '2025-03' => ['2025-01', '2025-02', '2025-03']
 * 
 * @param start - The start date in 'YYYY-MM' format.
 * @param end - The end date in 'YYYY-MM' format.
 * @returns An array of strings, each in 'YYYY-MM' format.
 */
function generateMonthsBetween(start: string, end: string): string[] {
  const months: string[] = [];
  const current = new Date(start + "-01");
  const last = new Date(end + "-01");

  while (current <= last) {
    months.push(formatMonth(current));
    current.setMonth(current.getMonth() + 1);
  }
  return months;
}



/**
 * === Refreshes payroll records for all employees by ensuring payroll entries exist ===
 * 
 * for every month from their joined date to resigned date or last month if still active.
 * 
 * This function:
 * - Fetches all employees.
 * - Retrieves each employee's latest employment record.
 * - Calculates the months range for payroll generation.
 * - Finds missing payroll months.
 * - Inserts missing payroll rows with the employee's salary.
 * 
 * @returns {Promise<{ success: boolean }>} An object indicating success of the operation.
 */
export async function refreshPayrolls(): Promise<{ success: boolean }> {

  // === Step 1: Fetch all employees ===
  const employees = await db.query.employeesTable.findMany();

  for (const emp of employees) {

    // === Step 2: Process each employee sequentially ===
    const [latestRecord] = await db.query.employmentRecordsTable.findMany({
      where: eq(employmentRecordsTable.employeeId, emp.id),
      orderBy: (records, { desc }) => [desc(records.id)],
      limit: 1,
    });

    if (!latestRecord) continue;

    // === Step 3: define date range (joined → resigned OR joined → last month if still active) ===
    const startMonth = formatMonth(new Date(latestRecord.joinedAt));
    let endDate: Date;

    if (latestRecord.resignedAt) {
      endDate = new Date(latestRecord.resignedAt);
    } else {
      // active employee → use last month instead of current month
      endDate = new Date();
      endDate.setMonth(endDate.getMonth() - 1); // <- use last month for active employees
    }

    // === Generate all months between start and end month ===
    const endMonth = formatMonth(endDate);
    const allMonths = generateMonthsBetween(startMonth, endMonth);

    // === Step 4: Fetch existing payroll months for this employee ===
    const existingPayrolls = await db.query.payrollsTable.findMany({
      where: eq(payrollsTable.employeeId, emp.id),
      columns: { month: true },
    });
    const existingMonths = new Set(existingPayrolls.map((p) => p.month));

    // === Step 5: Identify missing payroll months ===
    const unpaidMonths = allMonths.filter((m) => !existingMonths.has(m));

    // === Step 6: Insert missing payroll entries ===
    const salary = Number(emp.salary ?? 0);
    if (salary > 0) {
      for (const month of unpaidMonths) {
        await db.insert(payrollsTable).values({
          employeeId: emp.id,
          image: emp.image,
          name: emp.name,
          CNIC: emp.CNIC,
          email: emp.email,

          month,
          basicPay: salary.toString(),
          totalPay: salary.toString(),
          createdAt: new Date(),
        });
      }
    }
  }

  return { success: true };
}



/**
 * === Fetches payroll records for a specific employee filtered by status and optional month range. ===
 * 
 * @param {number} employeeId - The ID of the employee whose payrolls to fetch.
 * @param {'pending' | 'paid' | 'all'} [status='all'] - Filter by payroll status. Defaults to 'all'.
 * @param {string} [from] - Optional start month (inclusive) in "YYYY-MM" format.
 * @param {string} [to] - Optional end month (inclusive) in "YYYY-MM" format.
 * 
 * @returns {Promise<PayrollDialogSalaryRow[]>} A promise that resolves to an array of payroll records matching the criteria.
 * Each record includes a `paidAt` field as an ISO string or `null` if not available.
 */
export async function fetchEmployeeUnpaidPayrolls(employeeId: number, status: 'pending' | 'paid' | 'all' = 'all', from?: string, to?: string): Promise<PayrollDialogSalaryRow[]> {

  // === Base condition: filter by employee ID ===
  const baseConditions = [eq(payrollsTable.employeeId, employeeId)];

  // === Add status filter unless 'all' is specified ===
  if (status !== 'all') {
    baseConditions.push(eq(payrollsTable.status, status));
  }

  // === Add month range filters if provided ===
  if (from) {
    baseConditions.push(gte(payrollsTable.month, from));
  }
  if (to) {
    baseConditions.push(lte(payrollsTable.month, to));
  }

  // === Execute Query ===
  const payrolls = await db
    .select({
      id: payrollsTable.id,
      description: payrollsTable.description,
      basicPay: payrollsTable.basicPay,
      bonus: payrollsTable.bonus,
      penalty: payrollsTable.penalty,
      totalPay: payrollsTable.totalPay,
      month: payrollsTable.month,
      paidAt: payrollsTable.paidAt,
      status: payrollsTable.status,
    })
    .from(payrollsTable)
    .where(and(...baseConditions))
    .orderBy(desc(payrollsTable.id));

  // === Convert 'paidAt' dates to ISO string or null if missing ===
  return payrolls.map((p) => ({
    ...p,
    bonus: p.bonus ?? '0.00',
    penalty: p.penalty ?? '0.00',
    paidAt: p.paidAt ? p.paidAt.toISOString() : null,
  }));
}



/**
 * Retrieves a payroll summary for a given employee, including total paid and pending amounts,
 * as well as counts of paid and unpaid months.
 * 
 * @param {number} employeeId - The ID of the employee to fetch the payroll summary for.
 * @returns {Promise<PayrollSummary>} An object containing formatted totals and counts of payroll statuses.
 */
export async function getEmployeePayrollSummary(employeeId: number): Promise<PayrollSummary> {

  // === Fetch Payroll Records for the Employee ===
  const payrollRecords = await db
    .select({
      totalPay: payrollsTable.totalPay,
      status: payrollsTable.status,
    })
    .from(payrollsTable)
    .where(eq(payrollsTable.employeeId, employeeId))
    .orderBy(desc(payrollsTable.id));

  // === Initialize Summary Totals ===
  let paidAmountTotal = 0;
  let pendingAmountTotal = 0;
  let paidMonthCount = 0;
  let unpaidMonthCount = 0;

  // === Process Each Payroll Record ===
  for (const record of payrollRecords) {
    const totalPay = parseFloat(record.totalPay.toString());

    if (record.status === 'paid') {
      paidAmountTotal += totalPay;
      paidMonthCount++;
    } else if (record.status === 'pending') {
      pendingAmountTotal += totalPay;
      unpaidMonthCount++;
    }
  }

  // === Return Formatted Payroll Summary ===
  return {
    totalAmountPaid: paidAmountTotal.toFixed(2),         // <- e.g. "12000.00"
    totalAmountPending: pendingAmountTotal.toFixed(2),
    totalPaidMonths: paidMonthCount.toString(),          // <- e.g. "6"
    totalUnpaidMonths: unpaidMonthCount.toString(),
  };
}



/**
 * === Marks specified unpaid payroll records as paid and logs corresponding transaction entries. ===
 * 
 * @param {PayrollDialogSalaryRow[]} salaries - Array of salary payroll rows to mark as paid.
 * @param {number} employeeId - The ID of the employee to mark the payroll of the months.
 * 
 * @returns {Promise<boolean>} Returns true if operation completes successfully, false if no salaries provided.
 */
export async function markUnpaidPayrollsAsPaid(salaries: PayrollDialogSalaryRow[], employeeId: number): Promise<boolean> {
  if (!salaries || salaries.length === 0) return false;

  // === Perform all updates within a transaction for atomicity ===
  await db.transaction(async (tx) => {
    for (const salary of salaries) {
      // === Update payroll record to mark as paid with details ===
      await tx.update(payrollsTable)
        .set({
          basicPay: salary.basicPay,
          bonus: salary.bonus,
          penalty: salary.penalty,
          totalPay: salary.totalPay,
          description: salary.description,

          paidAt: sql`CURRENT_TIMESTAMP`,
          status: "paid",
        })
        .where(
          and(
            eq(payrollsTable.id, Number(salary.id)),
            eq(payrollsTable.employeeId, employeeId),
            eq(payrollsTable.month, salary.month)
          )
        );

      // === Insert transaction record logging the salary payment ===
      await insertData("transactionsTable", {
        categoryId: 1,
        title: 'Salary Payment to Employee',
        amount: salary.totalPay,
        type: 'debit',
        sourceType: 'payroll',
        sourceId: Number(salary.id),
      }, tx);
    }
  });

  return true;
}



/**
 * === Fetches detailed payroll information by payroll ID, including employee details. ===
 * 
 * @param {number} payrollId - The ID of the payroll record to fetch.
 * @returns {Promise<Object>} A promise that resolves to the payroll record with employee details,
 * or an empty object if no record is found.
 */
export async function fetchPayrollWithDetail(payrollId: number): Promise<EmployeePayrollInterface> {
  // === Fetch payroll with left join ===
  const [payroll] = await db
    .select({
      id: payrollsTable.id,

      employeeId: payrollsTable.employeeId,
      employeeImage: employeesTable.image,
      employeeName: employeesTable.name,
      employeeCNIC: employeesTable.CNIC,
      employeeEmail: employeesTable.email,

      // Preset embedded fields from payrolls table
      presetImage: payrollsTable.image,
      presetName: payrollsTable.name,
      presetCNIC: payrollsTable.CNIC,
      presetEmail: payrollsTable.email,

      basicPay: payrollsTable.basicPay,
      bonus: payrollsTable.bonus,
      penalty: payrollsTable.penalty,
      totalPay: payrollsTable.totalPay,
      description: payrollsTable.description,
      month: payrollsTable.month,
      status: payrollsTable.status,
      paidAt: payrollsTable.paidAt,
    })
    .from(payrollsTable)
    .leftJoin(employeesTable, eq(employeesTable.id, payrollsTable.employeeId))
    .where(eq(payrollsTable.id, payrollId))
    .orderBy(desc(payrollsTable.id));

  if (!payroll) {
    throw new Error("Payroll not found");
  }

  const isLinkedEmployee = payroll.employeeId !== null;

  // === Normalize + return ===
  const formattedPayroll = {
    id: payroll.id,
    employeeId: payroll.employeeId,

    employeeImage: isLinkedEmployee ? payroll.employeeImage ?? null : payroll.presetImage ?? null,
    employeeName: isLinkedEmployee ? payroll.employeeName ?? '' : payroll.presetName ?? '',
    employeeCNIC: isLinkedEmployee ? payroll.employeeCNIC ?? '' : payroll.presetCNIC ?? '',
    employeeEmail: isLinkedEmployee ? payroll.employeeEmail ?? '' : payroll.presetEmail ?? '',

    basicPay: payroll.basicPay,
    bonus: payroll.bonus ?? '0.00',
    penalty: payroll.penalty ?? '0.00',
    totalPay: payroll.totalPay,

    description: payroll.description ?? '',
    month: payroll.month,
    status: payroll.status,
    paidAt: payroll.paidAt ? payroll.paidAt.toISOString() : '',
  };

  return formattedPayroll;
}
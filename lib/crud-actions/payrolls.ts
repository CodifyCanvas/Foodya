"use server";

import { schema } from "@/lib/drizzle-schema";
import { db } from "../db";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { format } from "date-fns";
import { PayrollDialogSalaryRow } from "../definations";
import { insertData } from "./general-actions";

const payrollsTable = schema.payrollsTable;
const employeesTable = schema.employeesTable;
const employmentRecordsTable = schema.employmentRecordsTable;

export const getAllPayrollsWithEmployeeDetails = async () => {
  // Subquery: Get latest designation record for each employee
  const latestRecordSubquery = db
    .select({
      employeeId: employmentRecordsTable.employeeId,
      latestRecordId: sql<number>`MAX(${employmentRecordsTable.id})`.as("latestRecordId"),
    })
    .from(employmentRecordsTable)
    .groupBy(employmentRecordsTable.employeeId)
    .as("latestRecords");

  // Get employees with their latest designation
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

  // For each employee, calculate payroll details
  const results = await Promise.all(
    employeesWithDesignation.map(async (emp, index) => {
      // Get all payrolls for this employee
      const payrolls = await db
        .select()
        .from(payrollsTable)
        .where(eq(payrollsTable.employeeId, emp.id));

      // Unpaid months
      const unpaidMonths = payrolls
        .filter((p) => p.status === "pending")
        .map((p) => p.month);

      // Prev balance (sum of pending before current month)
      const prevBalance = payrolls
        .filter((p) => p.status === "pending")
        .reduce((sum, p) => sum + Number(p.totalPay), 0);

      // Latest payroll (this month)
      const latestPayroll = payrolls.sort(
        (a, b) => new Date(b.month).getTime() - new Date(a.month).getTime()
      )[0];

      const thisMonth = latestPayroll
        ? Number(emp.salary) +
        Number(latestPayroll.bonus || 0) -
        Number(latestPayroll.penalty || 0)
        : Number(emp.salary);

      return {
        id: index + 1,
        employeeId: emp.id,
        employee: emp.name,
        designation: emp.designation,
        unpaidMonths: unpaidMonths,
        currentSalary: emp.salary,
        prevBalance,
        thisMonth,
        status: latestPayroll?.status || "pending",
      };
    })
  );

  return results;
};

// Helpers
function formatMonth(date: Date): string {
  return format(date, "yyyy-MM"); // e.g., 2025-09
}

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

export async function refreshPayrolls() {
  // Step 1: fetch all employees
  const employees = await db.query.employeesTable.findMany();

  for (const emp of employees) {
    // Step 2: fetch latest employment record for each employee (order by ID DESC)
    const [latestRecord] = await db.query.employmentRecordsTable.findMany({
      where: eq(employmentRecordsTable.employeeId, emp.id),
      orderBy: (records, { desc }) => [desc(records.id)],
      limit: 1,
    });
    if (!latestRecord) continue;

    // Step 3: define date range (joined → resigned OR joined → last month if still active)
    const startMonth = formatMonth(new Date(latestRecord.joinedAt));

    let endDate: Date;
    if (latestRecord.resignedAt) {
      endDate = new Date(latestRecord.resignedAt);
    } else {
      // active employee → use last month instead of current month
      endDate = new Date();
      endDate.setMonth(endDate.getMonth() - 1);
    }

    const endMonth = formatMonth(endDate);
    const allMonths = generateMonthsBetween(startMonth, endMonth);

    // Step 4: fetch all existing payrolls of this employee
    const existingPayrolls = await db.query.payrollsTable.findMany({
      where: eq(payrollsTable.employeeId, emp.id),
      columns: { month: true },
    });
    const existingMonths = new Set(existingPayrolls.map((p) => p.month));

    // Step 5: filter missing months
    const unpaidMonths = allMonths.filter((m) => !existingMonths.has(m));

    // Step 6: insert missing payroll rows
    const salary = Number(emp.salary ?? 0);
    if (salary > 0) {
      for (const month of unpaidMonths) {
        await db.insert(payrollsTable).values({
          employeeId: emp.id,
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

export async function fetchEmployeeUnpaidPayrolls( employeeId: number, status: 'pending' | 'paid' | 'all' = 'all', from?: string, to?: string) {
  
  // Base condition: filter by employee ID
  const baseConditions = [eq(payrollsTable.employeeId, employeeId)];

  console.warn("⚠️ call fetchEmployeeUnpaidPayrolls funtion ")

  // Add status filter unless 'all' is specified
  if (status !== 'all') {
    baseConditions.push(eq(payrollsTable.status, status));
  }

  // Add month range filters if provided
  if (from) {
    baseConditions.push(gte(payrollsTable.month, from));
  }
  if (to) {
    baseConditions.push(lte(payrollsTable.month, to));
  }

  // [=== Execute Query ===]
  const payrolls = await db
    .select({
      id: payrollsTable.id,
      employeeId: payrollsTable.employeeId,
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

  // Convert 'paidAt' dates to ISO string or null if missing
  return payrolls.map((p) => ({
    ...p,
    paidAt: p.paidAt ? p.paidAt.toISOString() : null,
  }));
}

export async function getEmployeePayrollSummary(employeeId: number) {
  console.warn("⚠️ getEmployeePayrollSummary function called");

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
    totalAmountPaid: paidAmountTotal.toFixed(2),         // e.g. "12000.00"
    totalAmountPending: pendingAmountTotal.toFixed(2),
    totalPaidMonths: paidMonthCount.toString(),          // e.g. "6"
    totalUnpaidMonths: unpaidMonthCount.toString(), 
  };
}

export async function markUnpaidPayrollsAsPaid(salaries: PayrollDialogSalaryRow[]) {
  if (!salaries || salaries.length === 0) return false;

  await db.transaction(async (tx) => {
    for (const salary of salaries) {
      // === Update payroll record ===
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
            eq(payrollsTable.employeeId, Number(salary.employeeId)),
            eq(payrollsTable.month, salary.month)
          )
        );

      // === Insert transaction record for payroll payment ===
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

export async function fetchPayrollWithDetail(payrollId: number) {

  const [payroll] = await db
    .select({
      id: payrollsTable.id,

      employeeImage: employeesTable.image,
      employeeId: payrollsTable.employeeId,
      employeeName: employeesTable.name,
      employeeCNIC: employeesTable.CNIC,
      employeeEmail: employeesTable.email,

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
    .where(
      and(
        eq(payrollsTable.id, payrollId),
      )
    ).orderBy(desc(payrollsTable.id));

  return payroll ?? {};
}



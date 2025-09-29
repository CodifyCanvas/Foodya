"use server";

import { schema } from "@/lib/drizzle-schema";
import { db } from "../db";
import { and, desc, eq, sql } from "drizzle-orm";
import { format } from "date-fns";
import { PayrollDialogSalaryRow } from "../definations";

// DataTable Interface [id, employee, Designation, unpaid months, Current Salary, Prev. Balance,  This Month, Status, action [edit, view]]

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

export async function fetchEmployeeUnpaidPayrolls(employeeId: number) {
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
    })
    .from(payrollsTable)
    .where(
      and(
        eq(payrollsTable.employeeId, employeeId),
        eq(payrollsTable.status, 'pending')
      )
    ).orderBy(desc(payrollsTable.id));

  return payrolls;
}

export async function markUnpaidPayrollsAsPaid(salaries: PayrollDialogSalaryRow[]) {
  if (!salaries || salaries.length === 0) return false;

  await db.transaction(async (tx) => {
    await Promise.all(
      salaries.map((salary) =>
        tx
          .update(payrollsTable)
          .set({
            basicPay: salary.basicPay,
            bonus: salary.bonus,
            penalty: salary.penalty,
            totalPay: salary.totalPay,
            description: salary.description,
            
            paidAt: sql`CURRENT_TIMESTAMP`,   // Use MySQL current timestamp
            status: "paid",
          })
          .where(
            and(
              eq(payrollsTable.id, Number(salary.id)),
              eq(payrollsTable.employeeId, Number(salary.employeeId)),
              eq(payrollsTable.month, salary.month)
            )
          )
      )
    );
  });

  return true;
}


"use server";

import { schema } from "@/lib/drizzle-schema";
import { db } from "../db";
import { and, desc, eq } from "drizzle-orm";
import { EmployeeCompleteDetailsInterface, EmployeeWithLatestRecord } from "../definations";
import { deleteData } from "./general-actions";



// === Drizzle table schemas ===
const employees = schema.employeesTable;
const employmentRecords = schema.employmentRecordsTable;
const employeeSalaryChangesRecord = schema.salaryChangesTable;
const employeePayrolls = schema.payrollsTable;



/**
 * === Get All Employees with Their Latest Employment Record ===
 *
 * - Fetches basic employee information from the `employeesTable`.
 * - For each employee, it queries the most recent employment record (based on `id` DESC).
 * - Combines the two into a single enriched object per employee.
 * - Uses `Promise.all` for parallel fetching of records to improve performance.
 *
 * @returns {Promise<EmployeeWithLatestRecord[]>}
 *          A list of employees, each with their latest designation, shift, status, and join date.
 */
export const getAllEmployeesWithLatestRecord = async (): Promise<EmployeeWithLatestRecord[]> => {

  // === Step 1: Fetch base employee data ===
  const employeesList = await db
    .select({
      id: employees.id,
      image: employees.image,
      name: employees.name,
      CNIC: employees.CNIC,
      fatherName: employees.fatherName,
      email: employees.email,
      phone: employees.phone,
    })
    .from(employees);

  // === Step 2: For each employee, fetch their latest employment record ===
  const employeesWithRecords = await Promise.all(
    employeesList.map(async (emp) => {
      const latestRecord = await db.select({
        designation: employmentRecords.designation,
        shift: employmentRecords.shift,
        status: employmentRecords.status,
        joinedAt: employmentRecords.joinedAt,
      })
        .from(employmentRecords)
        .where(eq(employmentRecords.employeeId, emp.id))
        .orderBy(desc(employmentRecords.id)) // <- Most recent record first
        .limit(1)
        .then(results => results[0] || null);

      // === Merge base info with latest record ===
      return {
        ...emp,
        designation: latestRecord?.designation ?? null,
        shift: latestRecord?.shift ?? null,
        status: latestRecord?.status ?? null,
        joinedAt: latestRecord?.joinedAt.toISOString() ?? null,
      };
    })
  );

  // === Step 3: Return final enriched list ===
  return employeesWithRecords;
};



/**
 * === Fetch Complete Employee Details by ID ===
 *
 * - Retrieves core employee data from `employeesTable`.
 * - Fetches all employment records, ordered by latest first.
 * - Fetches all salary changes, ordered by latest first.
 * - Normalizes fields like dates and salary numbers for UI consumption.
 *
 * @param {number} employeeId - ID of the employee to fetch.
 * @returns {Promise<EmployeeCompleteDetailsInterface | null>}
 *          A complete employee object with employment history & salary changes, or null if not found.
 */
export const fetchEmployee = async (employeeId: number): Promise<EmployeeCompleteDetailsInterface | null> => {

  // === Step 1: Fetch main employee record ===
  const [employee] = await db
    .select({
      id: employees.id,
      image: employees.image,
      name: employees.name,
      CNIC: employees.CNIC,
      fatherName: employees.fatherName,
      email: employees.email,
      phone: employees.phone,
      salary: employees.salary,
      createdAt: employees.createdAt,
    })
    .from(employees)
    .where(eq(employees.id, employeeId));

  // === Return null if employee doesn't exist ===
  if (!employee) return null;

  // === Step 2: Fetch all employment records (latest first) ===
  const employmeeRecords = await db
    .select({
      id: employmentRecords.id,
      designation: employmentRecords.designation,
      shift: employmentRecords.shift,
      status: employmentRecords.status,
      joinedAt: employmentRecords.joinedAt,
      resignedAt: employmentRecords.resignedAt,
      changeType: employmentRecords.changeType,
      createdAt: employmentRecords.createdAt,
    })
    .from(employmentRecords)
    .where(eq(employmentRecords.employeeId, employeeId))
    .orderBy(desc(employmentRecords.id));

  // === Step 3: Fetch all salary change history (latest first) ===
  const salaryChanges = await db
    .select({
      id: employeeSalaryChangesRecord.id,
      previousSalary: employeeSalaryChangesRecord.previousSalary,
      newSalary: employeeSalaryChangesRecord.newSalary,
      reason: employeeSalaryChangesRecord.reason,
      changeType: employeeSalaryChangesRecord.changeType,
      createdAt: employeeSalaryChangesRecord.createdAt,
    })
    .from(employeeSalaryChangesRecord)
    .where(eq(employeeSalaryChangesRecord.employeeId, employeeId))
    .orderBy(desc(employeeSalaryChangesRecord.id));

  // === Step 4: Normalize employment records ===
  const normalizedEmploymentRecords = employmeeRecords.map((record) => ({
    id: record.id,
    designation: record.designation,
    shift: record.shift,
    status: record.status,
    joinedAt: record.joinedAt.toISOString(),
    resignedAt: record.resignedAt ? record.resignedAt.toISOString() : null,
    changeType: record.changeType,
    createdAt: record.createdAt,
  }));

  // === Step 5: Normalize salary change history ===
  const normalizedSalaryChanges = salaryChanges.map((change) => ({
    id: change.id,
    previousSalary: change.previousSalary ? parseFloat(change.previousSalary) : null,
    newSalary: parseFloat(change.newSalary),
    reason: change.reason ?? null,
    changeType: change.changeType,
    createdAt: change.createdAt,
  }));

  // === Step 6: Combine and return normalized object ===
  const normalizedEmployee: EmployeeCompleteDetailsInterface = {
    id: employee.id ?? null,
    image: employee.image ?? null,
    name: employee.name,
    CNIC: employee.CNIC,
    fatherName: employee.fatherName,
    email: employee.email,
    phone: employee.phone,
    salary: String(employee.salary),
    createdAt: employee.createdAt.toISOString(),
    employmentRecord: normalizedEmploymentRecords,
    salaryChanges: normalizedSalaryChanges,
  };

  return normalizedEmployee;
};



export const deleteEmployeeWithRecord = async (employeeId: number) => {

  await db.transaction(async (tx) => {
    // === Delete employment records ===
    await deleteData("employmentRecordsTable", "employeeId", employeeId, tx);

    // === Delete salary change history ===
    await deleteData("salaryChangesTable", "employeeId", employeeId, tx);

    // === Delete pending payroll entries for the employee ===
    await tx
      .delete(employeePayrolls)
      .where(
        and(
          eq(employeePayrolls.employeeId, employeeId),
          eq(employeePayrolls.status, 'pending')
        )
      );

    // === Finally, delete the employee record ===
    await deleteData("employeesTable", "id", employeeId, tx);
  });
};

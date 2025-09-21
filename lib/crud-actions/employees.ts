"use server";

import { schema } from "@/lib/drizzle-schema";
import { db } from "../db";
import { desc, eq } from "drizzle-orm";
import { EmployeeCompleteDetailsInterface } from "../definations";

const employees = schema.employeesTable;
const employmentRecords = schema.employmentRecordsTable;
const employeeSalaryChangesRecord = schema.salaryChangesTable;

export const getAllEmployeesWithLatestRecord = async () => {
  // Fetch all employees
  const employeesList = await db.select({
    id: employees.id,
    image: employees.image,
    name: employees.name,
    CNIC: employees.CNIC,
    fatherName: employees.fatherName,
    email: employees.email,
    phone: employees.phone,
  }).from(employees);

  // Fetch latest employment records for all employees in parallel
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
      .orderBy(desc(employmentRecords.id))
      .limit(1)
      .then(results => results[0] || null);

      return {
        ...emp,
        designation: latestRecord?.designation ?? null,
        shift: latestRecord?.shift ?? null,
        status: latestRecord?.status ?? null,
        joinedAt: latestRecord?.joinedAt ?? null,
      };
    })
  );

  return employeesWithRecords;
};


// 🧠 Temporary dev cache
const devCache: Record<number, EmployeeCompleteDetailsInterface> = {}; // temporary

export const fetchEmployee = async (employeeId: number) => {

  // temp begin
  // ✅ Return from cache in dev
  if (process.env.NODE_ENV === 'development' && devCache[employeeId]) {
    return devCache[employeeId];
  }
  // temp end

  // Fetch employee
  const [employee] = await db.select({
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

  if (!employee) return null;

  // Fetch employment records
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

  // Fetch salary changes
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

  // Normalize employment records
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

  // Normalize salary changes
  const normalizedSalaryChanges = salaryChanges.map((change) => ({
    id: change.id,
    previousSalary: change.previousSalary ? parseFloat(change.previousSalary) : null,
    newSalary: parseFloat(change.newSalary),
    reason: change.reason ?? null,
    changeType: change.changeType,
    createdAt: change.createdAt,
  }));

  // Final normalized employee object
  const normalized = {
    id: employee.id ?? null,
    image: employee.image ?? null, // Assume file upload elsewhere
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

  // temp begin
  // 🧠 Cache result in dev
  if (process.env.NODE_ENV === 'development') {
    devCache[employeeId] = normalized;
  }
  // temp end

  return normalized;
};






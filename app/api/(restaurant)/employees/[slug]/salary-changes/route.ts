import { auth } from "@/auth";
import { insertData, updateData } from "@/lib/crud-actions/general-actions";
import { db } from "@/lib/db";
import { SalaryChangeFormSchema } from "@/lib/zod-schema/restaurant.zod";
import { NextRequest, NextResponse } from "next/server";

const path = '/api/employees/[slug]/salary-changes';

/* ============================================================= 
   === [POST] Add a New Salary Change Record for an Employee ===
============================================================= */
export async function POST(req: NextRequest, { params }: { params: { slug: number } }) {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { slug: EmployeeId } = await params;
    const body = await req.json()

    // === Validate request body using Zod schema ===
    const parsed = SalaryChangeFormSchema.parse(body)
    const { previousSalary, newSalary, reason, changeType, } = parsed

    // === Execute DB Transaction: Insert Salary Record + Update Employee Salary ===
    const result = await db.transaction(async (tx) => {

      // Insert into salaryChangesTable
      const insert = await insertData("salaryChangesTable", {
        employeeId: EmployeeId,
        previousSalary: previousSalary?.trim() ?? null,
        newSalary: newSalary.trim(),
        reason: reason?.trim() ?? null,
        changeType: changeType,
      }, tx)

      // Update current salary in employeesTable
      const update = await updateData("employeesTable", 'id', EmployeeId, {
        salary: newSalary
      }, tx)

      return {
        insertedId: insert.insertId,
        updatedId: update?.affectedRows,
      };

    })

    // === Success Response ===
    return NextResponse.json(
      { message: "Employee Salary Record Updated successfully.", insertedId: result?.insertedId },
      { status: 201 }
    )
  } catch (error) {
    console.error(`[POST ${path}] salary change failed:`, error)

    return NextResponse.json(
      { error: "An unexpected error occurred while updating the salary. Please try again later." },
      { status: 500 }
    )
  }
}
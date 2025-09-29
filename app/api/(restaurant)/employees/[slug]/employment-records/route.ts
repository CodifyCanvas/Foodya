import { auth } from "@/auth";
import { insertData, updateData } from "@/lib/crud-actions/general-actions";
import { db } from "@/lib/db";
import { schema } from "@/lib/drizzle-schema";
import { EmploymentRecordFormSchema } from "@/lib/zod-schema/restaurant.zod";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const path = '/api/employees/[slug]/employment-records';
const salaryChangesTable = schema.salaryChangesTable;

/* ================================================= 
  === [POST] Create a New Restaurant Table Entry ===
================================================= */
export async function POST(req: NextRequest, { params }: { params: { slug: number } }) {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { slug: employeeId } = await params;
    const body = await req.json()

    // === Validate request body using Zod schema ===
    const parsed = EmploymentRecordFormSchema.parse(body)
    const { designation, shift, joinedAt, resignedAt, changeType, status } = parsed

    // === Execute DB Transaction: Insert Employment Record + Update Employee Info ===
    const result = await db.transaction(async (tx) => {
      // Insert new employment record
      const insert = await insertData(
        "employmentRecordsTable",
        {
          employeeId,
          designation: designation.trim(),
          shift: shift.trim(),
          status,
          joinedAt: new Date(joinedAt),
          changeType,
          resignedAt: resignedAt ? new Date(resignedAt) : null,
        },
        tx
      );


      // If employee is no longer active, clear their current salary
      if (status === "terminated" || status === "resigned") {
        await updateData("employeesTable", "id", employeeId, {
          salary: null
        }, tx);
      }

      /// If employee is active or rejoined, update salary from latest salary record
      if (status === "active" || status === "rejoined") {
        const latestSalaryRecord = await tx.select({
          newSalary: salaryChangesTable.newSalary
        })
          .from(salaryChangesTable)
          .where(eq(salaryChangesTable.employeeId, employeeId))
          .orderBy(desc(salaryChangesTable.id))
          .limit(1);

        await updateData("employeesTable", "id", employeeId, {
          salary: latestSalaryRecord?.[0]?.newSalary ?? null,
        }, tx);
      }

      return { insertedId: insert.insertId }
    });

    return NextResponse.json(
      { message: "Employee Record Updated successfully.", insertedId: result?.insertedId },
      { status: 201 }
    )
  } catch (error) {
    console.error(`[POST ${path}] employee record creation failed:`, error)

    return NextResponse.json(
      { error: "An unexpected error occurred while creating the employee record. Please try again later." },
      { status: 500 }
    )
  }
}
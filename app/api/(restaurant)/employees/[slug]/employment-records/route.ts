import { auth } from "@/auth";
import { insertData, updateData } from "@/lib/crud-actions/general-actions";
import { db } from "@/lib/db";
import { schema } from "@/lib/drizzle-schema";
import { EmploymentRecordFormSchema } from "@/lib/zod-schema/restaurant.zod";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";



const path = '/api/employees/[slug]/employment-records';
const salaryChangesTable = schema.salaryChangesTable;



/* ============================================================================ 
=== [POST] Create a New Employment Record for a Specific Employee (by ID) ===
============================================================================ */
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth();
    const userId = session?.user.id

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Extract Employee ID from Params ===
    const { slug } = await params;
    const employeeId = Number(slug);

    // === Parse & Validate Request Body ===
    const body = await req.json();
    const parsed = EmploymentRecordFormSchema.parse(body);
    const { designation, shift, joinedAt, resignedAt, changeType, status } = parsed;

    // === Execute DB Transaction: Insert Employment Record + Update Employee Info ===
    const result = await db.transaction(async (tx) => {

      // Insert new employment record
      const insert = await insertData(
        "employmentRecordsTable", {
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

      // --- Handle Salary Update Logic Based on Status ---
      if (["terminated", "resigned"].includes(status)) {

        // If employee has left, clear salary
        await updateData("employeesTable", "id", employeeId, {
          salary: null
        }, tx);

      } else if (["active", "rejoined"].includes(status)) {

        // If employee is active or rejoining, fetch their latest salary
        const latestSalaryRecord = await tx
          .select({ newSalary: salaryChangesTable.newSalary })
          .from(salaryChangesTable)
          .where(eq(salaryChangesTable.employeeId, employeeId))
          .orderBy(desc(salaryChangesTable.id))
          .limit(1);

        await updateData("employeesTable", "id", employeeId, {
          salary: latestSalaryRecord?.[0]?.newSalary ?? null,
        }, tx);

      }

      return { insertedId: insert.insertId };
    });

    return NextResponse.json(
      { message: "Employment record saved successfully.", insertedId: result?.insertedId },
      { status: 201 }
    );

  } catch (error) {
    console.error(`[POST ${path}] Failed to create employment record:`, error);

    return NextResponse.json(
      { error: "Something went wrong while saving the employment record. Please try again shortly." },
      { status: 500 }
    );
  }
}
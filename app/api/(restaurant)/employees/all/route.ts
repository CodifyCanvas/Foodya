import { auth } from "@/auth";
import { getAllEmployeesWithLatestRecord } from "@/lib/crud-actions/employees";
import { NextResponse } from "next/server";



const path = '/api/employees/all';



/* ==================================================================
=== [GET] Fetch All Employees with Their Latest Employment Record ===
================================================================== */
export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user.id

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Fetch Employees from DB ===
    const data = await getAllEmployeesWithLatestRecord();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch all employees:`, error);

    return NextResponse.json(
      { error: "Something went wrong while fetching employee records. Please try again later." },
      { status: 500 }
    );
  }
}
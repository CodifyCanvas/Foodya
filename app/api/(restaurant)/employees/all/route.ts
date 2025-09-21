import { auth } from "@/auth"
import { getAllEmployeesWithLatestRecord } from "@/lib/crud-actions/employees"
import { NextResponse } from "next/server"

const path = '/api/employees/all'

/* ====================================================
  === [GET] Fetch All Employees with Latest Records ===
==================================================== */
export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Fetch Employees from DB ===
    const data = await getAllEmployeesWithLatestRecord()

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch employees:`, error)

    return NextResponse.json(
      { error: "Failed to fetch employees. Please try again later." },
      { status: 500 }
    )
  }
}
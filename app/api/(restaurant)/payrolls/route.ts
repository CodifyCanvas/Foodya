import { auth } from "@/auth"
import { getAllPayrollsWithEmployeeDetails } from "@/lib/crud-actions/payrolls"
import {  NextResponse } from "next/server"

const path = '/api/payrolls'

/* ================================================
  === [GET] Fetch All Payrolls History from DB ===
================================================ */
export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Fetch all Payrolls tables ===
    const data = await getAllPayrollsWithEmployeeDetails()

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch payrolls:`, error)

    return NextResponse.json(
      { error: "Failed to fetch payrolls. Please try again later." },
      { status: 500 }
    )
  }
}

import { auth } from "@/auth"
import { refreshPayrolls } from "@/lib/crud-actions/payrolls"
import { NextResponse } from "next/server"

const path = '/api/payrolls/refresh'

/* ============================================ 
  === [POST] Refresh The Employees Payrolls ===
============================================ */
export async function POST() {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const result = await refreshPayrolls();

    return NextResponse.json(
      { message: "Payrolls refreshed successfully.", success: result.success },
      { status: 201 }
    )
  } catch (error) {
    console.error(`[POST ${path}] refreshing payrolls failed:`, error)

    return NextResponse.json(
      { error: "An unexpected error occurred while refreshing the payrolls. Please try again later." },
      { status: 500 }
    )
  }
}

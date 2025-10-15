import { auth } from "@/auth";
import { refreshPayrolls } from "@/lib/crud-actions/payrolls";
import { NextResponse } from "next/server";



const path = '/api/payrolls/refresh';



/* ===================================================== 
=== [POST] Refresh Payrolls for All Active Employees ===
===================================================== */
export async function POST() {
  try {
    const session = await auth();
    const userId = session?.user.id;

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Trigger Payroll Refresh Process ===
    const result = await refreshPayrolls();

    // === Return Success Response ===
    return NextResponse.json(
      { message: "Payrolls have been refreshed successfully.", success: result.success },
      { status: 201 }
    );
  } catch (error) {
    console.error(`[POST ${path}] Error refreshing payrolls:`, error);

    return NextResponse.json(
      { error: "Something went wrong while refreshing payrolls. Please try again shortly." },
      { status: 500 }
    );
  }
}

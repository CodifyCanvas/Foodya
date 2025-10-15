import { auth } from "@/auth";
import { getAllPayrollsWithEmployeeDetails } from "@/lib/crud-actions/payrolls";
import { NextResponse } from "next/server";



const path = '/api/payrolls';



/* ======================================================
=== [GET] Fetch Complete Payroll History with Details ===
====================================================== */
export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user.id;

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Fetch Payroll Records with Employee Details ===
    const payrolls = await getAllPayrollsWithEmployeeDetails();

    return NextResponse.json(payrolls, { status: 200 });
  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch payrolls:`, error);

    return NextResponse.json(
      { error: "We couldn’t fetch the payroll data at this time. Please try again later." },
      { status: 500 }
    );
  }
}

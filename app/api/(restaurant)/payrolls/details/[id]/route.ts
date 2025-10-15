import { auth } from "@/auth";
import { fetchPayrollWithDetail } from "@/lib/crud-actions/payrolls";
import { NextRequest, NextResponse } from "next/server";



const path = '/api/payrolls/detail/[id]';



/* =======================================================
=== [GET] Fetch Specific Payroll with Detailed Records ===
======================================================= */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: number }> }) {
  try {
    const session = await auth();
    const userId = session?.user.id;

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Extract and Validate ID from Route Parameters ===
    const { id } = await params;

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid payroll ID provided. Please check and try again." },
        { status: 400 }
      );
    }

    // === Fetch Payroll Detail from Database ===
    const payrollDetail = await fetchPayrollWithDetail(id);

    if (!payrollDetail) {
      return NextResponse.json(
        { error: "No payroll found with the provided ID." },
        { status: 404 }
      );
    }

    return NextResponse.json(payrollDetail, { status: 200 });
  } catch (error) {
    console.error(`[GET ${path}]  Failed fetching payroll detail:`, error);

    return NextResponse.json(
      { error: "Something went wrong while retrieving payroll details. Please try again later." },
      { status: 500 }
    );
  }
}
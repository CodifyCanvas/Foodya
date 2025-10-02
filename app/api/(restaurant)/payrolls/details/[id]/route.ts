"use server";

import { auth } from "@/auth";
import { fetchPayrollWithDetail } from "@/lib/crud-actions/payrolls";
import { NextRequest, NextResponse } from "next/server";

const path = '/api/payrolls/detail/[id]';

/* ========================================================
  === [GET] Fetch Specific Payroll with Details from DB ===
======================================================== */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: number }>}) {
  try {
    const session = await auth();
    const userId = session?.user.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Validate slug parameter === 
    const { id } = await params;

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid payroll ID. Please verify the ID and try again." },
        { status: 400 }
      );
    }

    const invoice = await fetchPayrollWithDetail(id);

    return NextResponse.json(invoice, { status: 200 });
  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch payroll detail:`, error);

    return NextResponse.json(
      { error: "Failed to fetch payroll detail. Please try again later." },
      { status: 500 }
    );
  }
}
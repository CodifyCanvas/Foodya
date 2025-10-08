"use server";

import { auth } from "@/auth";
import { fetchEmployeeUnpaidPayrolls, markUnpaidPayrollsAsPaid } from "@/lib/crud-actions/payrolls";
import { EmployeeSalaryPostingFormSchema } from "@/lib/zod-schema/restaurant.zod";
import { NextRequest, NextResponse } from "next/server";

/* =================================================================
  === [GET] Fetch Specific Employee All pending Payrolls from DB ===
================================================================= */
const path = '/api/payrolls/employee/[slug]'
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: number }>}) {
  try {
    const session = await auth();
    const userId = session?.user.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Validate slug parameter === 
    const { slug } = await params;

    if (isNaN(slug)) {
      return NextResponse.json(
        { error: "Invalid employee ID. Please verify the ID and try again." },
        { status: 400 }
      );
    }

    const invoice = await fetchEmployeeUnpaidPayrolls(slug, 'pending');

    return NextResponse.json(invoice, { status: 200 });
  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch Employee Unpaid Payrolls:`, error);

    return NextResponse.json(
      { error: "Failed to fetch Employee Unpaid Payrolls. Please try again later." },
      { status: 500 }
    );
  }
}

/* ========================================
=== [POST] Mark Unpaid Payrolls as Paid ===
========================================= */
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: number }>}) {
  try {
    const session = await auth();
    const userId = Number(session?.user.id);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Validate slug parameter === 
    const { slug } = await params;

    if (isNaN(slug)) {
      return NextResponse.json(
        { error: "Invalid employee payroll ID. Please verify the ID and try again." },
        { status: 400 }
      );
    }

    // === Parse and validate request body === 
    const body = await req.json();
    const { salaries } = EmployeeSalaryPostingFormSchema.parse(body);
    
   // === Execute payroll update inside a single transaction ===
    const update = await markUnpaidPayrollsAsPaid(salaries);

    // === Return success response ===
    return NextResponse.json(
      { message: "Salaries created successfully." , posted: update},
      { status: 201 }
    );

  } catch (error) {
    // === Catch and log any unexpected errors === 
    console.error(`[POST [${path}] Employee salary creation failed:`, error);
    return NextResponse.json(
      { error: "An unexpected error occurred while creating the order & invoice. Please try again later.", },
      { status: 500 }
    );
  }
}
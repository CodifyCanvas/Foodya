import { auth } from "@/auth";
import { fetchEmployeeUnpaidPayrolls, markUnpaidPayrollsAsPaid } from "@/lib/crud-actions/payrolls";
import { EmployeeSalaryPostingFormSchema } from "@/lib/zod-schema/restaurant.zod";
import { NextRequest, NextResponse } from "next/server";



const path = '/api/payrolls/employee/[slug]';



/* ==================================================================
=== [GET] Fetch All Unpaid Payrolls for a Specific Employee by ID ===
================================================================== */
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth();
    const userId = session?.user.id;

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Extract and Validate Employee ID ===
    const { slug } = await params;
    const empleeyId = Number(slug);

    if (!empleeyId || isNaN(empleeyId)) {
      return NextResponse.json(
        { error: "Invalid employee ID provided. Please check and try again." },
        { status: 400 }
      );
    }

    // === Fetch Unpaid Payrolls for the Given Employee ===
    const unpaidPayrolls = await fetchEmployeeUnpaidPayrolls(empleeyId, 'pending');

    return NextResponse.json(unpaidPayrolls, { status: 200 });
  } catch (error) {
    console.error(`[GET ${path}] Failed to fetching unpaid payrolls:`, error);

    return NextResponse.json(
      { error: "Something went wrong while fetching payrolls. Please try again later." },
      { status: 500 }
    );
  }
}



/* =========================================================
=== [POST] Mark All Unpaid Payrolls as Paid for Employee ===
========================================================= */
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth();
    const userId = Number(session?.user.id);

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Extract and Validate Employee ID ===
    const { slug } = await params;
    const empleeyId = Number(slug);

    if (!empleeyId || isNaN(empleeyId)) {
      return NextResponse.json(
        { error: "Invalid employee ID. Please verify and try again." },
        { status: 400 }
      );
    }

    // === Parse and Validate Request Body using Zod ===
    const body = await req.json();
    const { salaries } = EmployeeSalaryPostingFormSchema.parse(body);

    // === Mark Payrolls as Paid ===
    const update = await markUnpaidPayrollsAsPaid(salaries, empleeyId);

    // === Return success response ===
    return NextResponse.json(
      { message: "Salaries recorded successfully.", posted: update },
      { status: 201 }
    );

  } catch (error) {
    console.error(`[POST [${path}] Payroll update failed:`, error);

    return NextResponse.json(
      { error: "We couldn't process the salary update. Please try again or contact support.", },
      { status: 500 }
    );
  }
}
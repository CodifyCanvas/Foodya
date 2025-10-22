import { auth } from "@/auth";
import { loadFinancialChartData } from "@/lib/crud-actions/reports";
import { NextRequest, NextResponse } from "next/server";



const path = '/api/reports';



/* ==================================================================== 
=== [POST] Generate Financial Chart Data Based on View and Duration ===
==================================================================== */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user.id;

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Parse & Validate Body ===
    const body = await req.json();
    const { view, duration } = body;

    if (!view || !duration) {
      return NextResponse.json(
        { error: "Both 'view' and 'duration' are required to generate the report chart. Please provide them." },
        { status: 400 }
      );
    }

    // === Load Chart Data ===
    const chartData = await loadFinancialChartData(view, duration);

    // === Return Success Response ===
    return NextResponse.json(chartData, { status: 201 });

  } catch (error) {
    console.error(`[POST ${path}] Failed to generate report chart:`, error);

    return NextResponse.json(
      { error: "Something went wrong while generating the report chart. Please try again in a moment." },
      { status: 500 }
    );
  }
}
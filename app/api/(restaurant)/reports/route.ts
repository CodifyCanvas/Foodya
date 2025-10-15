import { auth } from "@/auth";
import { getAllData } from "@/lib/crud-actions/general-actions";
import { getHeaderCardMetrics, loadFinancialChartData } from "@/lib/crud-actions/reports";
import { NextRequest, NextResponse } from "next/server";



const path = '/api/reports';



/* ===============================================================
=== [GET] Fetch Dashboard Reports Based on 'fetch' Query Param ===
=============================================================== */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Validate Query Parameter ===
    const fetchParam = req.nextUrl.searchParams.get("fetch");

    if (!fetchParam) {
      return NextResponse.json(
        { error: "Missing 'fetch' query parameter" },
        { status: 400 }
      );
    }

    // === Dynamically Fetch Data Based on 'fetch' Param ===
    let data;
    switch (fetchParam) {
      case "header-cards":
        data = await getHeaderCardMetrics();
        break;

      case "transactions-data":
        data = await getAllData("transactionsTable");
        break;

      default:
        return NextResponse.json(
          { error: "Invalid 'fetch' value. Use one of: 'header-cards', 'transactions-data'." },
          { status: 400 }
        );
    }

    // === Return Success Response ===
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error(`[GET ${path}] Error fetching report data:`, error);

    return NextResponse.json(
      { error: "Something went wrong while retrieving report data. Please try again shortly." },
      { status: 500 }
    );
  }
}



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
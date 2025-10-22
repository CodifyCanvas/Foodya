import { auth } from "@/auth";
import { getTransactionsForReports } from "@/lib/crud-actions/reports";
import { NextRequest, NextResponse } from "next/server";



const path = '/api/reports/transactions';



/* =============================================
=== [GET] Fetch All Transactions for Reports ===
============================================= */
export async function GET(req: NextRequest) {
    try {
        // === Authenticate the user session === 
        const session = await auth();
        const userId = Number(session?.user.id);

        // === Authenticate User ===
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        // === Extract query parameters with defaults ===
        const { searchParams } = new URL(req.url);
        const page = Number(searchParams.get("page") || 1);
        const limit = Number(searchParams.get("limit") || 10);
        const search = searchParams.get("search")?.trim() || "";

        // === Fetch transactions report data with search, pagination ===
        const data = await getTransactionsForReports(search, page, limit)

        // === Return success response === 
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error(`[GET ${path}] Error fetching report transactions:`, error);

        return NextResponse.json(
            { error: "Failed to retrieve transactions report. Please try again later." },
            { status: 500 }
        );
    }
}
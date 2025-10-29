import { auth } from "@/auth";
import { getHeaderCardMetrics } from "@/lib/crud-actions/reports";
import { NextResponse } from "next/server";



const path = '/api/reports/header-cards';



/* ===============================================
=== [GET] Fetch Dashboard header cards Reports ===
=============================================== */
export async function GET() {
    try {
        // === Authenticate the user session === 
        const session = await auth();
        const userId = Number(session?.user.id);

        // === Authenticate User ===
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const data = await getHeaderCardMetrics();

        // === Return success response === 
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error(`[GET ${path}] Error fetching report header cards data:`, error);

        return NextResponse.json(
            { error: "Something went wrong while retrieving report header cards data. Please try again shortly." },
            { status: 500 }
        );
    }
}
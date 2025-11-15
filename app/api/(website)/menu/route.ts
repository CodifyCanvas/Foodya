import { auth } from "@/auth";
import { getAllMenuItemsForWebsite } from "@/lib/crud-actions/website/menu";
import { deslugify } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server"



const path = '/api/menu';



/*==================================================
=== [GET] Fetch Menu Items (Optionally Filtered) ===
================================================= */
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        const userId = session?.user.id;

        // === Authenticate User ===
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        // === Extract query parameters with defaults ===
        const { searchParams } = new URL(req.url);
        const page = Number(searchParams.get("page") || 1);
        const limit = Number(searchParams.get("limit") || 16);
        const searchParam = searchParams.get("search")?.trim() || "";
        const availabilityParam = searchParams.get("availability");
        const categoryParam = searchParams.get("category")?.trim();

        const search = deslugify(searchParam);
        const category = categoryParam ? deslugify(categoryParam) : undefined;
        const availability = availabilityParam === null ? undefined : availabilityParam === "true";

        // === Fetch Menu Items ===
        const menuItems = await getAllMenuItemsForWebsite(search, page, limit, category, availability);

        return NextResponse.json(menuItems, { status: 200 });
    } catch (error) {
        console.error(`[GET ${path}] Failed to fetch Menu Items:`, error);

        return NextResponse.json(
            { error: "Something went wrong while fetching menu items. Please try again." },
            { status: 500 }
        );
    }
}
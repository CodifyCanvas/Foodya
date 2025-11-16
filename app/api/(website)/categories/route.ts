import { getMenuCategoryWithItemCount } from "@/lib/crud-actions/website/menu-categories";
import { NextResponse } from "next/server"



const path = '/api/categories';



/*===========================================================
=== [GET] Fetch all menu categories with total item count ===
========================================================== */
export async function GET() {
    try {
        const categories = await getMenuCategoryWithItemCount();

        return NextResponse.json(categories, { status: 200 });
    } catch (error) {
        console.error(`[GET ${path}] Failed to fetch Menu categories:`, error);

        return NextResponse.json(
            { error: "Failed to fetch menu categories." },
            { status: 500 }
        );
    }
}
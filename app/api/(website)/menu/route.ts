import { auth } from "@/auth";
import { getAllData } from "@/lib/crud-actions/general-actions"
import { getAllMenuItems, getAllMenuItemsForWebsite } from "@/lib/crud-actions/menu-items";
import { deslugify, mapToLabelValue } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server"



const path = '/api/menu-items';



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
        const limit = Number(searchParams.get("limit") || 10);
        const search = searchParams.get("search")?.trim() || "";

        // === Extract Query Parameters ===
        const categoryParam = req.nextUrl.searchParams.get("category");
        const fetchCategoriesParam = req.nextUrl.searchParams.get("fetch_categories");
        const onlyAvailableParam = req.nextUrl.searchParams.get("only_available");

        const onlyAvailable = onlyAvailableParam === "true";
        const fetchCategories = fetchCategoriesParam !== "false";
        const categoryName = categoryParam ? deslugify(categoryParam) : undefined;

        // === Fetch Menu Items ===
        const menuItems = await getAllMenuItemsForWebsite(search, page, limit, categoryName, onlyAvailable);

        if (!fetchCategories) {
            return NextResponse.json(menuItems, { status: 200 });
        }

        // === Fetch Categories if Required ===
        const rawCategories = await getAllData("menuCategories");
        const categories = mapToLabelValue(rawCategories, {
            value: "id",
            label: "name",
        });

        console.log('Categories:', categories);

        return NextResponse.json({ menuItems, categories }, { status: 200 });

    } catch (error) {
        console.error(`[GET ${path}] Failed to fetch Menu Items:`, error);

        return NextResponse.json(
            { error: "Something went wrong while fetching menu items. Please try again." },
            { status: 500 }
        );
    }
}
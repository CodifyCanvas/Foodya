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
        // const menuItems = await getAllMenuItemsForWebsite(search, page, limit, category, availability);

        const menuItems = {
            "query": null,
            "totalRecords": 20,
            "page": 1,
            "totalPages": 2,
            "pageSize": 10,
            "menuItems": [
                {
                    "id": 1,
                    "image": "/images/landing_page_hero.png",
                    "item": "Bruschetta",
                    "description": "Grilled bread topped with fresh tomatoes",
                    "price": 60,
                    "is_available": true,
                    "category": "Starters",
                    "category_id": "1",
                    "options": [
                        { "option_id": 1, "option_name": "garlic", "price": "65.00" },
                        { "option_id": 2, "option_name": "basil", "price": "70.00" }
                    ]
                },
                {
                    "id": 2,
                    "image": null,
                    "item": "Spicy Chicken Wings",
                    "description": "Crispy wings tossed in a tangy buffalo sauce",
                    "price": 85,
                    "is_available": true,
                    "category": "Starters",
                    "category_id": "1",
                    "options": [
                        { "option_id": 3, "option_name": "Served with blue cheese dip", "price": "100.00" }
                    ]
                },
                {
                    "id": 3,
                    "image": null,
                    "item": "Grilled Salmon",
                    "description": "Fresh Atlantic salmon",
                    "price": 950,
                    "is_available": true,
                    "category": "Main Courses",
                    "category_id": "2",
                    "options": []
                },
                {
                    "id": 4,
                    "image": null,
                    "item": "Chocolate Lava Cake",
                    "description": "Warm cake with molten chocolate center",
                    "price": 1450,
                    "is_available": true,
                    "category": "Desserts",
                    "category_id": "4",
                    "options": []
                },
                {
                    "id": 5,
                    "image": null,
                    "item": "Caesar Salad",
                    "description": "Crisp romaine with Caesar dressing",
                    "price": 120,
                    "is_available": true,
                    "category": "Starters",
                    "category_id": "1",
                    "options": [
                        { "option_id": 4, "option_name": "Add chicken", "price": "200.00" }
                    ]
                },
                {
                    "id": 6,
                    "image": null,
                    "item": "Margherita Pizza",
                    "description": "Classic pizza with tomato, mozzarella, basil",
                    "price": 500,
                    "is_available": true,
                    "category": "Main Courses",
                    "category_id": "2",
                    "options": [
                        { "option_id": 5, "option_name": "Extra cheese", "price": "50.00" }
                    ]
                },
                {
                    "id": 7,
                    "image": null,
                    "item": "Penne Arrabbiata",
                    "description": "Pasta in spicy tomato sauce",
                    "price": 350,
                    "is_available": true,
                    "category": "Main Courses",
                    "category_id": "2",
                    "options": []
                },
                {
                    "id": 8,
                    "image": null,
                    "item": "Chocolate Brownie",
                    "description": "Rich chocolate brownie",
                    "price": 250,
                    "is_available": false,
                    "category": "Desserts",
                    "category_id": "4",
                    "options": [
                        { "option_id": 10, "option_name": "Add ice cream", "price": "50.00" },
                        { "option_id": 11, "option_name": "Add ice cream", "price": "50.00" },
                        { "option_id": 12, "option_name": "Add ice cream", "price": "50.00" },
                        { "option_id": 13, "option_name": "Add ice cream", "price": "50.00" },
                        { "option_id": 14, "option_name": "Add ice cream", "price": "50.00" },
                        { "option_id": 15, "option_name": "Add ice cream", "price": "50.00" },
                        { "option_id": 16, "option_name": "Add ice cream", "price": "50.00" },
                        { "option_id": 17, "option_name": "Add ice cream", "price": "50.00" },
                        { "option_id": 18, "option_name": "Add ice cream", "price": "50.00" },
                        { "option_id": 19, "option_name": "Add ice cream", "price": "50.00" },
                        { "option_id": 20, "option_name": "Add ice cream", "price": "50.00" },
                        { "option_id": 21, "option_name": "Add ice cream", "price": "50.00" },
                    ]
                },
                {
                    "id": 9,
                    "image": null,
                    "item": "Mushroom Soup",
                    "description": "Creamy mushroom soup",
                    "price": 180,
                    "is_available": true,
                    "category": "Starters",
                    "category_id": "1",
                    "options": []
                },
                {
                    "id": 10,
                    "image": null,
                    "item": "Tiramisu",
                    "description": "Classic Italian dessert",
                    "price": 300,
                    "is_available": true,
                    "category": "Desserts",
                    "category_id": "4",
                    "options": []
                },
                {
                    "id": 11,
                    "image": null,
                    "item": "BBQ Ribs",
                    "description": "Slow-cooked pork ribs with BBQ sauce",
                    "price": 1200,
                    "is_available": true,
                    "category": "Main Courses",
                    "category_id": "2",
                    "options": [
                        { "option_id": 7, "option_name": "Extra BBQ sauce", "price": "100.00" }
                    ]
                },
                {
                    "id": 12,
                    "image": null,
                    "item": "Greek Salad",
                    "description": "Salad with feta cheese, olives, and cucumber",
                    "price": 200,
                    "is_available": true,
                    "category": "Starters",
                    "category_id": "1",
                    "options": []
                },
                {
                    "id": 13,
                    "image": null,
                    "item": "Linguine Alfredo",
                    "description": "Pasta in creamy Alfredo sauce",
                    "price": 400,
                    "is_available": true,
                    "category": "Main Courses",
                    "category_id": "2",
                    "options": []
                },
                {
                    "id": 14,
                    "image": null,
                    "item": "Vanilla Ice Cream",
                    "description": "Creamy vanilla ice cream",
                    "price": 120,
                    "is_available": true,
                    "category": "Desserts",
                    "category_id": "4",
                    "options": [
                        { "option_id": 8, "option_name": "Add chocolate syrup", "price": "20.00" }
                    ]
                },
                {
                    "id": 15,
                    "image": null,
                    "item": "Garlic Bread",
                    "description": "Toasted bread with garlic butter",
                    "price": 90,
                    "is_available": true,
                    "category": "Starters",
                    "category_id": "1",
                    "options": []
                },
                {
                    "id": 16,
                    "image": null,
                    "item": "Veggie Burger",
                    "description": "Grilled veggie patty with fresh veggies",
                    "price": 350,
                    "is_available": false,
                    "category": "Main Courses",
                    "category_id": "2",
                    "options": [
                        { "option_id": 9, "option_name": "Add cheese", "price": "50.00" }
                    ]
                },
                {
                    "id": 17,
                    "image": null,
                    "item": "Chicken Caesar Wrap",
                    "description": "Wrap filled with chicken and Caesar salad",
                    "price": 300,
                    "is_available": true,
                    "category": "Main Courses",
                    "category_id": "2",
                    "options": []
                },
                {
                    "id": 18,
                    "image": null,
                    "item": "Strawberry Cheesecake",
                    "description": "Cheesecake topped with fresh strawberries",
                    "price": 450,
                    "is_available": true,
                    "category": "Desserts",
                    "category_id": "4",
                    "options": []
                },
                {
                    "id": 19,
                    "image": null,
                    "item": "French Fries",
                    "description": "Crispy golden fries",
                    "price": 100,
                    "is_available": true,
                    "category": "Starters",
                    "category_id": "1",
                    "options": [
                        { "option_id": 10, "option_name": "Add cheese", "price": "30.00" }
                    ]
                },
                {
                    "id": 20,
                    "image": null,
                    "item": "Panna Cotta",
                    "description": "Creamy Italian dessert with berry sauce",
                    "price": 280,
                    "is_available": true,
                    "category": "Desserts",
                    "category_id": "4",
                    "options": []
                }
            ]
        }


        return NextResponse.json(menuItems, { status: 200 });
    } catch (error) {
        console.error(`[GET ${path}] Failed to fetch Menu Items:`, error);

        return NextResponse.json(
            { error: "Something went wrong while fetching menu items. Please try again." },
            { status: 500 }
        );
    }
}
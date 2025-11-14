import { db } from "@/lib/db";
import { MenuCategoryWithItemCount } from "@/lib/definations";
import { schema } from "@/lib/drizzle-schema";
import { and, asc, count, eq } from "drizzle-orm";



// === Drizzle table schemas ===
const menuItems = schema.menuItems
const menuCategories = schema.menuCategories;



/**
 * === Fetch Menu Categories with Item Counts ===
 *
 * Retrieves all menu categories with the total number of active (non-deleted)
 * items in each category.
 * 
 * @returns {Promise<MenuCategoryWithItemCount[]>} A list of menu categories with item count.
 */
export const getMenuCategoryWithItemCount = async (): Promise<MenuCategoryWithItemCount[]> => {
    const result = await db
        .select({
            id: menuCategories.id,
            category: menuCategories.name,
            description: menuCategories.description,
            total_items: count(menuItems.id), // <- using count menu-items that belongs to this category
        })
        .from(menuCategories)
        .leftJoin(
            menuItems,
            and(
                eq(menuItems.category_id, menuCategories.id),
                eq(menuItems.isDeleted, false) // <- only active items
            )
        )
        .groupBy(menuCategories.id)
        .orderBy(asc(menuCategories.id));

    return result;
};


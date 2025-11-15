"use server";
import { db } from "@/lib/db";
import { ItemWithOptions, MenuResponse } from "@/lib/definations";
import { schema } from "@/lib/drizzle-schema";
import { and, eq, count, like } from "drizzle-orm";



// === Drizzle table schemas ===
const menuItems = schema.menuItems;
const menuItemOptions = schema.menuItemOptions;
const menuCategories = schema.menuCategories;



export const getAllMenuItemsForWebsite = async (
    searchTerm: string = "",
    pageNumber: number = 1,
    pageSize: number = 16,
    category?: string,
    availability?: boolean
): Promise<MenuResponse> => {
    const offset = (pageNumber - 1) * pageSize;

    // === Conditions for menuItems query ===
    const conditions = [eq(menuItems.isDeleted, false)];

    if (category) conditions.push(eq(menuCategories.name, category));
    if (availability === true) conditions.push(eq(menuItems.is_available, true));
    else if (availability === false) conditions.push(eq(menuItems.is_available, false));
    if (searchTerm) conditions.push(like(menuItems.name, `%${searchTerm}%`));

    // === Count total records ===
    const totalRecordsResult = await db
        .select({ count: count(menuItems.id) })
        .from(menuItems)
        .leftJoin(menuCategories, eq(menuItems.category_id, menuCategories.id))
        .where(and(...conditions));

    const totalRecords = totalRecordsResult[0]?.count ?? 0;
    const totalPages = Math.ceil(totalRecords / pageSize);

    // === Fetch menuItems with LIMIT and OFFSET ===
    const menuItemsRows = await db
        .select({
            menu_items: menuItems,
            menu_categories: menuCategories,
        })
        .from(menuItems)
        .leftJoin(menuCategories, eq(menuItems.category_id, menuCategories.id))
        .where(and(...conditions))
        .limit(pageSize)
        .offset(offset);

    // Extract IDs of menu items
    const menuItemIds = menuItemsRows.map(row => row.menu_items.id);

    // === Fetch all options for these menuItems (filter in-memory) ===
    const allOptions = await db.select().from(menuItemOptions);

    // Filter options for the current page
    const optionsForItems = allOptions.filter(opt => menuItemIds.includes(opt.menu_item_id));

    // === Map menuItems + options ===
    const itemMap = new Map<number, ItemWithOptions>();

    menuItemsRows.forEach(row => {
        const item = row.menu_items;
        const category = row.menu_categories;

        itemMap.set(item.id, {
            id: item.id,
            image: item.image ?? null,
            item: item.name,
            description: item.description ?? "",
            price: Number(item.price),
            is_available: item.is_available ?? false,
            category: category?.name ?? "Others",
            category_id: item.category_id ? item.category_id.toString() : "others",
            options: [],
        });
    });

    optionsForItems.forEach(option => {
        const mappedItem = itemMap.get(option.menu_item_id);
        if (mappedItem) {
            mappedItem.options.push({
                option_id: option.id,
                option_name: option.option_name ?? "",
                price: option.price,
            });
        }
    });

    return {
        query: searchTerm || null,
        totalRecords,
        page: pageNumber,
        totalPages,
        pageSize,
        menuItems: Array.from(itemMap.values()),
    };
};

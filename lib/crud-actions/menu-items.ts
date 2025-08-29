'use server';
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { schema } from "../drizzle-schema";
import { ItemWithOptions } from "../definations";

const menuItems = schema.menuItems
const menuItemOptions = schema.menuItemOptions
const menuCategories = schema.menuCategories;

export const getAllMenuItems = async (
  categoryName?: string,
  onlyAvailable: boolean = false
): Promise<ItemWithOptions[]> => {

  const conditions = [];
  
  if (categoryName) {
    conditions.push(eq(menuCategories.name, categoryName));
  }

  if (onlyAvailable) {
    conditions.push(eq(menuItems.is_available, true));
  }

  // Start base query
  const baseQuery = db
    .select()
    .from(menuItems)
    .leftJoin(menuItemOptions, eq(menuItems.id, menuItemOptions.menu_item_id))
    .leftJoin(menuCategories, eq(menuItems.category_id, menuCategories.id));

  // Apply conditions only if there are any
  const query = conditions.length > 0
    ? baseQuery.where(and(...conditions))
    : baseQuery;

  const items = await query;

  const itemMap = new Map<number, ItemWithOptions>();

  for (const row of items) {
    const item = row.menu_items;
    const option = row.menu_item_options;
    const category = row.menu_categories;

    if (!itemMap.has(item.id)) {
      itemMap.set(item.id, {
        id: item.id,
        image: item.image ?? null,
        item: item.name,
        description: item.description ?? "",
        price: Number(item.price),
        is_available: item.is_available ?? false,
        category: category?.name ?? "",
        category_id: item.category_id.toString(),
        options: [],
      });
    }

    if (option) {
      itemMap.get(item.id)!.options.push({
        option_id: option.id,
        option_name: option.option_name ?? "",
        price: option.price,
      });
    }
  }

  return Array.from(itemMap.values());
};




'use server';
import { eq } from "drizzle-orm";
import { db } from "../db";
import { schema } from "../drizzle-schema";
import { ItemWithOptions } from "../definations";

const menuItems = schema.menuItems
const menuItemOptions = schema.menuItemOptions
const menuCategories = schema.menuCategories

export const getAllMenuItems = async (): Promise<ItemWithOptions[]> => {
  const items = await db.select()
    .from(menuItems)
    .leftJoin(menuItemOptions, eq(menuItems.id, menuItemOptions.menu_item_id))
    .leftJoin(menuCategories, eq(menuItems.category_id, menuCategories.id));

  const itemMap = new Map<number, ItemWithOptions>();

  for (const row of items) {
    const item = row.menu_items;
    const option = row.menu_item_options;
    const category = row.menu_categories;

    if (!itemMap.has(item.id)) {
      itemMap.set(item.id, {
        id: item.id,
        item: item.name,
        description: item.description ?? '',
        price: Number(item.price),
        is_available: item.is_available ?? false,
        category: category?.name ?? '',
        category_id: item.category_id.toString(),
        options: []
      });
    }

    if (option) {
      itemMap.get(item.id)!.options.push({
        option_name: option.option_name ?? "",
        price: option.price
      });
    }
  }

  return Array.from(itemMap.values());
};

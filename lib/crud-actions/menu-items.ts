'use server';

import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { schema } from "../drizzle-schema";
import { ItemWithOptions } from "../definations";



// === Drizzle table schemas ===
const menuItems = schema.menuItems
const menuItemOptions = schema.menuItemOptions
const menuCategories = schema.menuCategories;



/**
 * Fetch all menu items with their options and categories.
 *
 * @param categoryName - Optional category name to filter menu items.
 * @param onlyAvailable - Whether to return only available items.
 * @returns {Promise<ItemWithOptions[]>} List of structured menu items with options.
 */
export const getAllMenuItems = async (categoryName?: string, onlyAvailable: boolean = false): Promise<ItemWithOptions[]> => {

  // === Build dynamic conditions ===
  const conditions = [eq(menuItems.isDeleted, false)];

  if (categoryName) {
    conditions.push(eq(menuCategories.name, categoryName));
  }

  if (onlyAvailable) {
    conditions.push(eq(menuItems.is_available, true));
  }

  const items = await db
    .select({
      menu_items: menuItems,
      menu_item_options: menuItemOptions,
      menu_categories: menuCategories,
    })
    .from(menuItems)
    .leftJoin(menuItemOptions, eq(menuItems.id, menuItemOptions.menu_item_id))
    .leftJoin(menuCategories, eq(menuItems.category_id, menuCategories.id))
    .where(and(...conditions));

  // === Map to hold and group items with their options ===
  const itemMap = new Map<number, ItemWithOptions>();

  for (const row of items) {
    const item = row.menu_items;
    const option = row.menu_item_options;
    const category = row.menu_categories;

    // === If item not already in map, add base structure ===
    if (!itemMap.has(item.id)) {
      itemMap.set(item.id, {
        id: item.id,
        image: item.image ?? null,
        item: item.name,
        description: item.description ?? "",
        price: Number(item.price),
        is_available: item.is_available ?? false,
        category: category?.name ?? "Others",
        category_id: item.category_id ? item.category_id.toString() : 'others',
        options: [],
      });
    }

    // === Add option if available ===
    if (option) {
      itemMap.get(item.id)!.options.push({
        option_id: option.id,
        option_name: option.option_name ?? "",
        price: option.price,
      });
    }
  }

  // === Return all items grouped and structured ===
  return Array.from(itemMap.values());
};



/**
 * Fetch all menu items with their options and categories.
 *
 * @param categoryName - Optional category name to filter menu items.
 * @param onlyAvailable - Whether to return only available items.
 * @returns {Promise<ItemWithOptions[]>} List of structured menu items with options.
 */
export const getAllMenuItemsForWebsite = async (searchTerm: string = "",
  pageNumber: number,
  pageSize: number, categoryName?: string, onlyAvailable: boolean = false): Promise<ItemWithOptions[]> => {

  // === Calculate offset for pagination ===
  const offset = (pageNumber - 1) * pageSize;

  // === Build dynamic conditions ===
  const conditions = [eq(menuItems.isDeleted, false)];

  if (categoryName) {
    conditions.push(eq(menuCategories.name, categoryName));
  }

  if (onlyAvailable) {
    conditions.push(eq(menuItems.is_available, true));
  }

  const items = await db
    .select({
      menu_items: menuItems,
      menu_item_options: menuItemOptions,
      menu_categories: menuCategories,
    })
    .from(menuItems)
    .leftJoin(menuItemOptions, eq(menuItems.id, menuItemOptions.menu_item_id))
    .leftJoin(menuCategories, eq(menuItems.category_id, menuCategories.id))
    .where(and(...conditions));

  // === Map to hold and group items with their options ===
  const itemMap = new Map<number, ItemWithOptions>();

  for (const row of items) {
    const item = row.menu_items;
    const option = row.menu_item_options;
    const category = row.menu_categories;

    // === If item not already in map, add base structure ===
    if (!itemMap.has(item.id)) {
      itemMap.set(item.id, {
        id: item.id,
        image: item.image ?? null,
        item: item.name,
        description: item.description ?? "",
        price: Number(item.price),
        is_available: item.is_available ?? false,
        category: category?.name ?? "Others",
        category_id: item.category_id ? item.category_id.toString() : 'others',
        options: [],
      });
    }

    // === Add option if available ===
    if (option) {
      itemMap.get(item.id)!.options.push({
        option_id: option.id,
        option_name: option.option_name ?? "",
        price: option.price,
      });
    }
  }

  // === Return all items grouped and structured ===
  return Array.from(itemMap.values());
};
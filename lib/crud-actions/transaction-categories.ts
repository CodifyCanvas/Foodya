"use server";

import { schema } from "@/lib/drizzle-schema";
import { db } from "../db";
import { eq } from "drizzle-orm";



// === Drizzle table schemas ===
const transactionsTable = schema.transactionsTable;
const transactionCategoryTable = schema.transactionCategoriesTable;



/**
 * === Delete a transaction category and reassign its transactions to "Others". ===
 * 
 * Steps:
 * - Fetch the ID of the default "Others" category.
 * - Prevent deletion if the category to delete *is* "Others".
 * - Reassign all transactions using the category to "Others".
 * - Delete the specified transaction category.
 *
 * @param categoryId - The ID of the transaction category to delete.
 * @returns A promise that resolves to `true` if the deletion and reassignment succeeded.
 * @throws If the category ID is missing, the "Others" category is not found, 
 *         or if an attempt is made to delete the "Others" category.
 */
export const deleteTheTransactionCategory = async (categoryId: number): Promise<boolean> => {
  if (!categoryId) throw new Error("Category ID is required");

  return await db.transaction(async (tx) => {

    // === Fetch the "Others" category ID ===
    const [othersCategory] = await tx
      .select({ id: transactionCategoryTable.id })
      .from(transactionCategoryTable)
      .where(eq(transactionCategoryTable.category, "Others"));

    if (!othersCategory) {
      throw new Error("Default 'Others' category not found. Please seed it first.");
    }

    // === Prevent deletion of the "Others" category itself ===
    if (categoryId === othersCategory.id) {
      throw new Error("The default 'Others' category cannot be deleted.");
    }

    // === Reassign all transactions to the "Others" category ===
    await tx
      .update(transactionsTable)
      .set({ categoryId: othersCategory.id })
      .where(eq(transactionsTable.categoryId, categoryId));

    // === Delete the category itself ===
    await tx
      .delete(transactionCategoryTable)
      .where(eq(transactionCategoryTable.id, categoryId));

    // === Commit success ===
    return true;
  });
};
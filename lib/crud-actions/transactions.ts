"use server";

import { schema } from "@/lib/drizzle-schema";
import { db } from "../db";
import { TransactionsTablesInterface } from '@/lib/definations'
import { desc, eq } from "drizzle-orm";



// === Drizzle table schemas ===
const transactionsTable = schema.transactionsTable;
const transactionCategoryTable = schema.transactionCategoriesTable;



/**
 * === Fetch all transactions with optional filtering by type ("debit", "credit", or "all"). ===
 * 
 * Includes joined category details for each transaction.
 * 
 * @param type - Transaction type to filter by ("debit", "credit", or "all").
 * @returns A promise resolving to a formatted list of transactions with category info.
 */
export const getAllTransactionsWithDetails = async (type: 'debit' | 'credit' | 'all'): Promise<TransactionsTablesInterface[]> => {

  // === Base Query: Join transactions with categories ===
  const baseQuery = db
    .select()
    .from(transactionsTable)
    .leftJoin(
      transactionCategoryTable,
      eq(transactionsTable.categoryId, transactionCategoryTable.id)
    );

  // === Apply Type Filter if needed ===
  const query = type !== 'all'
    ? baseQuery.where(eq(transactionsTable.type, type))
    : baseQuery;

  // === Execute Query with Descending Order ===
  const result = await query.orderBy(desc(transactionsTable.id));

  // === Format & normalize Result ===
  const formatted: TransactionsTablesInterface[] = result.map((item) => ({
    id: item.transactions.id,
    title: item.transactions.title,
    description: item.transactions.description ?? null,
    amount: item.transactions.amount,
    categoryId: item.transactions.categoryId,
    category: item.transaction_categories?.category ?? null,
    categoryDescription: item.transaction_categories?.description ?? null,
    type: item.transactions.type,
    sourceType: item.transactions.sourceType,
    sourceId: item.transactions.sourceId ?? null,
    createdAt: item.transactions.createdAt.toISOString(),
  }));

  return formatted;
};
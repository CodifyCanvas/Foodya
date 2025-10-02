"use server";

import { schema } from "@/lib/drizzle-schema";
import { db } from "../db";
import { TransactionsTablesInterface } from '@/lib/definations'
import { desc, eq } from "drizzle-orm";

const transactionsTable = schema.transactionsTable;
const transactionCategoryTable = schema.transactionCategoriesTable;

export const getAllIncomesWithDetails = async (): Promise<TransactionsTablesInterface[]> => {
    const result = await db
        .select()
        .from(transactionsTable)
        .where(eq(transactionsTable.type, 'credit'))
        .leftJoin(
            transactionCategoryTable,
            eq(transactionsTable.categoryId, transactionCategoryTable.id)
        ).orderBy(desc(transactionsTable.id));

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
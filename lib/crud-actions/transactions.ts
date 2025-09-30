"use server";

import { schema } from "@/lib/drizzle-schema";
import { db } from "../db";
import { and, eq } from "drizzle-orm";
import { User } from '@/lib/definations'

const transactionsTable = schema.transactionsTable;

export const getAllIncomesWithDetails = async () => {
    const result = await db
        .select()
        .from(transactionsTable)
        .where(eq(transactionsTable.type, 'credit'))

    return result ?? [];
}
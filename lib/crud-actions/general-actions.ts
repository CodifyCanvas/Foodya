"use server";

import { db } from '@/lib/db'
import { schema } from '@/lib/drizzle-schema';
import { asc, desc, eq, TablesRelationalConfig } from 'drizzle-orm'
import type { MySqlColumn, MySqlUpdateSetSource } from 'drizzle-orm/mysql-core'
import { MySql2Database, MySql2Transaction } from 'drizzle-orm/mysql2';


// === Types ===
type Schema = typeof schema
type TableName = keyof Schema
type TableType<T extends TableName> = Schema[T]
type ColumnName<T extends TableName> = keyof TableType<T> & string
type ColumnValue = string | number | boolean;



/**
 * === Database executor type for queries and transactions. ===
 */
type DBExecutor = MySql2Database<typeof schema> | MySql2Transaction<typeof schema, TablesRelationalConfig>;



/**
 * === Fetches all rows from a given table, ordered by the 'id' column ascending. ===
 *
 * @template T - Table name from schema
 * @param {T} tableName - The table to fetch data from.
 * @param {'asc' | 'desc'} [orderBy='asc'] - The sort order for the `id` column.
 * @returns {Promise<Schema[T]["$inferSelect"][]>} - Array of selected rows.
 */
export async function getAllData<T extends TableName>(
  tableName: T,
  orderBy: 'asc' | 'desc' = 'asc',
): Promise<Schema[T]["$inferSelect"][]> {

  const table = schema[tableName];

  const result = await db
    .select()
    .from(schema[tableName])
    .orderBy(orderBy === 'desc' ? desc(table.id) : asc(table.id));

  return result as Schema[T]["$inferSelect"][];
}




/**
 * === Inserts data into the specified table, optionally within a transaction. ===
 *
 * @template T - Table name from schema
 * 
 * @param {T} tableName - The target table for insert.
 * @param {Schema[T]['$inferInsert']} data - Data object(s) to insert.
 * @param {DBExecutor} [tx] - Optional transaction or db executor.
 * 
 * @returns {Promise<{ insertId: number }>} - The insert ID of the inserted row.
 */
export async function insertData<T extends TableName>(
  tableName: T,
  data: Schema[T]['$inferInsert'],
  tx?: DBExecutor,
): Promise<{ insertId: number }> {

  const executor = tx ?? db;  // <- Use tx (executer) if provided, else default db
  const result = await executor.insert(schema[tableName]).values(data);

  // Drizzle returns an array of results, use first for insertId
  const insertResult = result[0];

  return {
    insertId: insertResult.insertId
  };
}



/**
 * === Updates rows matching a condition in the specified table. ===
 *
 * @template T - Table name from schema
 * @template K - Column name for the WHERE clause
 * 
 * @param {T} tableName - Table to update.
 * @param {K} columnName - Column to match.
 * @param {ColumnValue} columnValue - Value to match for update condition.
 * @param {MySqlUpdateSetSource<Schema[T]>} values - Object of columns and new values.
 * @param {DBExecutor} [tx] - Optional transaction or db executor.
 * 
 * @returns {Promise<{ affectedRows: number }>} - Number of rows affected.
 */
export async function updateData<T extends TableName, K extends ColumnName<T>>(
  tableName: T,                                       // table Name
  columnName: K,                                      // column Name where you check the condition
  columnValue: ColumnValue,                           // value of column for condition
  values: MySqlUpdateSetSource<Schema[T]>,            // data in object form
  tx?: DBExecutor,
): Promise<{ affectedRows: number }> {

  const table = schema[tableName];
  const column = table[columnName] as MySqlColumn;
  const executor = tx ?? db; // <- Use tx (executer) if provided, else default db

  const result = await executor.update(table)
    .set(values)
    .where(eq(column, columnValue))

  const affectedRows = result[0].affectedRows;

  return {
    affectedRows: affectedRows
  }
}



/**
 * === Deletes rows matching a condition from the specified table. ===
 *
 * @template T - Table name from schema
 * @template K - Column name for the WHERE clause
 * 
 * @param {T} tableName - Table to delete from.
 * @param {K} columnName - Column to match.
 * @param {ColumnValue} columnValue - Value to match for delete condition.
 * @param {DBExecutor} [tx] - Optional transaction or db executor.
 * 
 * @returns {Promise<void>}
 */
export async function deleteData<T extends TableName, K extends ColumnName<T>>(
  tableName: T,
  columnName: K,
  columnValue: ColumnValue,
  tx?: DBExecutor,
): Promise<void> {

  const table = schema[tableName];
  const column = table[columnName] as MySqlColumn;
  const executor = tx ?? db;  // <- Use tx (executer) if provided, else default db

  await executor.delete(table).where(eq(column, columnValue));
}



/**
 * === Checks if a duplicate value exists in a given column of a table. ===
 *
 * @template T - Table name from schema
 * @template K - Column name to check for duplicates
 * 
 * @param {T} tableName - Table to check.
 * @param {K} columnName - Column to check.
 * @param {any} value - Value to check for duplicates.
 * @param {DBExecutor} [tx] - Optional transaction or db executor.
 * 
 * @returns {Promise<boolean>} - True if a duplicate exists, else false.
 */
export async function checkDuplicate<T extends TableName, K extends ColumnName<T>>(
  tableName: T,
  columnName: K,
  value: TableType<T>["$inferSelect"][K & keyof TableType<T>["$inferSelect"]],
  tx?: DBExecutor,
): Promise<boolean> {

  const table = schema[tableName];
  const column = table[columnName] as MySqlColumn;
  const executor = tx ?? db;  // <- Use tx (executer) if provided, else default db

  const result = await executor.select()
    .from(table)
    .where(eq(column, value))
    .limit(1);

  return result.length > 0;
}
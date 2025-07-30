"use server";
import { db } from '@/lib/db'
import { schema } from '@/lib/drizzle-schema';
import { asc, eq } from 'drizzle-orm'
import type { MySqlUpdateSetSource } from 'drizzle-orm/mysql-core'

type Schema = typeof schema
type TableName = keyof Schema
type TableType<T extends TableName> = Schema[T]
type ColumnName<T extends TableName> = keyof TableType<T> & string

type ColumnValue = string | number | boolean;

// ✅ Fetch
export async function getAllData<T extends TableName>(
  tableName: T
): Promise<Schema[T]["$inferSelect"][]> {
  const result = await db.select().from(schema[tableName]).orderBy(asc(schema[tableName].id));

  // ✅ Explicitly assert the result type
  return result as Schema[T]["$inferSelect"][];
}

// ✅ INSERT
export async function insertData<T extends TableName>(
  tableName: T,                                       // table name 
  data: Schema[T]['$inferInsert']                     // data in object form 
): Promise<{ insertId: number }> {
  const result = await db.insert(schema[tableName]).values(data).execute();
  const insertResult = result[0];
  
  return {
    insertId: insertResult.insertId
  };
}

// ✅ UPDATE with column, value, and new data
export async function updateData<T extends TableName, K extends ColumnName<T>>(
  tableName: T,                                       // table Name
  columnName: K,                                      // column Name where you check the condition
  columnValue: ColumnValue,                           // value of column for condition
  values: MySqlUpdateSetSource<Schema[T]>             // data in object form
): Promise<void> {

  const table = schema[tableName]
  const column = table[columnName] as any
  const result = await db.update(table).set(values).where(eq(column, columnValue))

  console.log(result)
}

// ✅ DELETE with column and value
export async function deleteData<T extends TableName, K extends ColumnName<T>>(
  tableName: T,                                       // table name
  columnName: K,                                      // column Name where you check the condition
  columnValue: ColumnValue                            // value of column for condition
): Promise<void> {
  const table = schema[tableName]
  const column = table[columnName] as any
  await db.delete(table).where(eq(column, columnValue))
}

export async function checkDuplicate<T extends TableName, K extends ColumnName<T>>(
  tableName: T,
  columnName: K,
  value: any
): Promise<boolean> {
  try {
    const table = schema[tableName]
  const column = table[columnName] as any

    const result = await db.select().from(table).where(eq(column, value)).limit(1);

    return result.length > 0;
  } catch (error) {
    console.error("Error checking duplicate:", error);
    return false;
  }
}

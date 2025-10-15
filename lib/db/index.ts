import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { schema } from '@/lib/drizzle-schema/index'



/**
 * === Database Pool & ORM Setup ===
 *
 * Initializes a MySQL connection pool using `mysql2/promise`, and wraps it
 * with Drizzle ORM using the defined schema.
 *
 * Environment Variables Required:
 * - DATABASE_HOST
 * - DATABASE_USER
 * - DATABASE_NAME
 * - DATABASE_PASSWORD
 * - DATABASE_PORT (optional, defaults to 3306)
 * - DATABASE_MAX_CONNECTION (optional, defaults to 30)
 */



// === MySQL Connection Pool ===
export const poolConnection = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 3306,
  connectionLimit: process.env.DATABASE_MAX_CONNECTION ? Number(process.env.DATABASE_MAX_CONNECTION) : 30,
  waitForConnections: true,
});



// === Drizzle ORM Client ===
export const db = drizzle(poolConnection, { schema, mode: 'default', });
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { schema } from '@/lib/drizzle-schema/index'

export const poolConnection = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 3306,
  connectionLimit: process.env.DATABASE_MAX_CONNECTION ? Number(process.env.DATABASE_MAX_CONNECTION) : 30,
  waitForConnections: true,
});

export const db = drizzle(poolConnection, { schema, mode: 'default', });

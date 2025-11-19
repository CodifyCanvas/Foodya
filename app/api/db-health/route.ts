import { NextResponse } from "next/server";
import { poolConnection } from "@/lib/db";



const path = '/api/db-health';



/**
* === [GET] Database Health Check Endpoint ===
* This API checks if the database connection is alive and responsive.
*/
export async function GET() {
  try {
    // Get a connection from the pool
    const conn = await poolConnection.getConnection();

    // Ping the database to check connectivity
    await conn.ping();

    // Release the connection back to the pool
    conn.release();
    return NextResponse.json({ message: "Database Connection status is ok" }, { status: 200 });
  } catch (e) {
    console.error(`[GET ${path}] Failed to fetch Database Health: `, e)
    return NextResponse.json({ error: "Database connection failed" }, { status: 503 });
  }
}

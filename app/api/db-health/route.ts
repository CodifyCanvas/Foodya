import { NextResponse } from "next/server";
import { poolConnection } from "@/lib/db"; // path to your pool

export async function GET() {
  try {
    const conn = await poolConnection.getConnection();
    await conn.ping();
    conn.release();
    return NextResponse.json({ message: "Database Connection status is ok" } , {status : 200});
  } catch (error) {
    return NextResponse.json({ message: "Database connection failed" }, { status: 500 });
  }
}

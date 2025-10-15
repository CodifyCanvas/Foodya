import { auth } from "@/auth";
import { getUserWithRole } from "@/lib/crud-actions/users";
import { NextResponse } from "next/server";



const path = '/api/user';



/* ===================================================
=== [GET] Fetch Authenticated User with Their Role ===
=================================================== */
export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Fetch User with Associated Role Info ===
    const userData = await getUserWithRole(Number(userId));

    if (!userData) {
      return NextResponse.json(
        { error: "User not found or no associated role." },
        { status: 404 }
      );
    }

    return NextResponse.json(userData, { status: 200 });

  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch user data:`, error);

    return NextResponse.json(
      { error: "We ran into an issue while retrieving your profile. Please try again shortly." },
      { status: 500 }
    );
  }
}
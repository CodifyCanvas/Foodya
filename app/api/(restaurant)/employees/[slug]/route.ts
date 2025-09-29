"use server";

import { auth } from "@/auth";
import { fetchEmployee } from "@/lib/crud-actions/employees";
import { updateData } from "@/lib/crud-actions/general-actions";
import { uploadImage } from "@/lib/server/helpers/imageUpload";
import { EmployeePersonalInfoFormSchema } from "@/lib/zod-schema/restaurant.zod";
import { NextRequest, NextResponse } from "next/server";

const path = '/api/employees/[slug]';

/* =========================================================
  === [GET] Fetch Specific Employee (by ID) with Details ===
========================================================= */
export async function GET(req: NextRequest, { params }: { params: { slug: number } }) {
  try {
    const session = await auth();
    const userId = session?.user.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { slug: employeeId } = await params;

    // === Fetch employee by ID ===
    const employee = await fetchEmployee(employeeId);
    
    if (!employee) {
      return NextResponse.json(
        { error: `Employee with ID ${employeeId} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json(employee, { status: 200 });
  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch order and its items:`, error);

    return NextResponse.json(
      { error: "Failed to fetch employee details. Please try again later." },
      { status: 500 }
    );
  }
}

/* =====================================================
  === [PUT] Update a The Employee Personal Info Only ===
===================================================== */
export async function PUT(req: NextRequest, { params }: { params: { slug: number } }) {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { slug: Employeeid } = await params;

    // Parse multipart form
    const formData = await req.formData();
    const jsonData = formData.get("data");
    const image = formData.get("image") as File | null;

    if (typeof jsonData !== "string") {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    // Parse and validate Zod data
    let parsed;
    try {
      parsed = EmployeePersonalInfoFormSchema.parse(JSON.parse(jsonData));
    } catch (err) {
      console.log('Zod Validation Failed in Api Route')
      return NextResponse.json({ error: "Validation failed", details: err }, { status: 400 });
    }

    const { name, fatherName, CNIC, email, phone } = parsed

    // Upload image using helper
    let imagePath: string | null = null;
    if (image && image instanceof File) {
      imagePath = await uploadImage(image, "employees_profile_image"); // Use helper
    }

    // === Update Employee Personal Info ===
    const result = await updateData('employeesTable', 'id', Employeeid, {
      name: name.trim(),
      CNIC: CNIC.trim(),
      fatherName: fatherName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      ...(imagePath && { image: imagePath }),
    })

    const updatedRow = result?.affectedRows

    return NextResponse.json(
      { message: "Employee updated successfully.", UpdatedId: updatedRow },
      { status: 202 }
    )
  } catch (error) {
    console.error(`[POST ${path}] Employee creation failed:`, error)

    return NextResponse.json(
      { error: "An unexpected error occurred while creating the Employee. Please try again later." },
      { status: 500 }
    )
  }
}
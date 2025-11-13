import { auth } from "@/auth";
import { deleteEmployeeWithRecord, fetchEmployee } from "@/lib/crud-actions/employees";
import { updateData } from "@/lib/crud-actions/general-actions";
import { uploadImage } from "@/lib/server/helpers/imageUpload";
import { EmployeePersonalInfoFormSchema } from "@/lib/zod-schema/restaurant.zod";
import { NextRequest, NextResponse } from "next/server";



const path = '/api/employees/[slug]';



/* ===========================================================
=== [GET] Fetch a Specific Employee by ID with Full Details===
=========================================================== */
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: number }> }) {
  try {
    const session = await auth();
    const userId = session?.user.id;

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Extract Employee ID from Params ===
    const { slug: employeeId } = await params;

    // === Fetch Employee Record ===
    const employee = await fetchEmployee(employeeId);

    if (!employee) {
      return NextResponse.json(
        { error: `No employee found with ID ${employeeId}.` },
        { status: 404 }
      );
    }

    return NextResponse.json(employee, { status: 200 });
  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch employee:`, error);

    return NextResponse.json(
      { error: "We couldn't retrieve the employee details. Please try again later." },
      { status: 500 }
    );
  }
}



/* ==========================================================
=== [PUT] Update an Employee's Personal Info (with image) ===
========================================================== */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: number }> }) {
  try {
    const session = await auth();
    const userId = session?.user.id

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Extract Employee ID from Params ===
    const { slug: Employeeid } = await params;

    // === Parse Multipart Form ===
    const formData = await req.formData();
    const jsonData = formData.get("data");
    const image = formData.get("image") as File | null;

    if (typeof jsonData !== "string") {
      return NextResponse.json({ error: "Invalid form submission. Please try again." }, { status: 400 });
    }

    // === Parse and Validate Form Data Using Zod ===
    let parsed;
    try {
      parsed = EmployeePersonalInfoFormSchema.parse(JSON.parse(jsonData));
    } catch (err) {
      console.error(`[PUT ${path}] Validation failed:`);
      return NextResponse.json({ error: "Invalid input data. Please review the fields and try again.", details: err }, { status: 400 });
    }

    const { name, fatherName, CNIC, email, phone } = parsed;

    if (!Employeeid) {
      return NextResponse.json(
        { error: "Employee ID is missing. Cannot perform update." },
        { status: 400 }
      );
    }

    /* ====================================================
    === Handle Image Cases ===
    - Case 01: No image in formData → keep existing
    - Case 02: Image removed → file is string ''
    - Case 03: New image uploaded → file is File instance
    ===================================================== */

    // === Case 02 ===
    if (typeof image === "string" && image !== null) {
      await updateData("employeesTable", "id", Employeeid, { image: null })
    }

    // === Upload Profile Image (If Any) ===
    let imagePath: string | undefined = undefined;
    if (image && image instanceof File) {
      try {
        imagePath = await uploadImage(image, "employees_profile_image"); // <- use helper
      } catch (err) {
        console.error(`[PUT ${path}] Image upload failed:`, err);
        return NextResponse.json({ error: "We couldn't upload the image. Please try again." }, { status: 500 });
      }
    }

    // === Update Employee Record in DB ===
    const result = await updateData('employeesTable', 'id', Employeeid, {
      name: name.trim(),
      CNIC: CNIC.trim(),
      fatherName: fatherName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      ...(imagePath && { image: imagePath }), // Only update if new image uploaded
    });

    const updatedRow = result?.affectedRows ?? 0;

    return NextResponse.json(
      { message: "Employee information updated successfully.", UpdatedId: updatedRow },
      { status: 202 }
    );
  } catch (error) {
    console.error(`[POST ${path}] Failed to update employee:`, error);

    return NextResponse.json(
      { error: "Something went wrong while updating the employee's profile. Please try again shortly." },
      { status: 500 }
    );
  }
}



/* ==========================================================================================
=== [DELETE] Employee with Related Records (Employment, Salary Changes, Pending Payrolls) ===
========================================================================================== */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user.id;

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Parse Request Body ===
    const body = await req.json();

    // === Validate ===
    const { id } = body;
    if (!id || isNaN(id)) {
      return NextResponse.json({ error: "Invalid or missing employee ID." }, { status: 400 });
    }

    // === Perform Delete Action ===
    await deleteEmployeeWithRecord(id)

    // === Return Success Response ===
    return NextResponse.json({ message: "Employee deleted along with employment records, salary changes, and payrolls." }, { status: 200 });
  } catch (error) {
    console.error(`[DELETE ${path}] Failed to delete employee: `, error);

    return NextResponse.json(
      { error: "Failed to delete employee. Please try again." },
      { status: 500 }
    );
  }
}
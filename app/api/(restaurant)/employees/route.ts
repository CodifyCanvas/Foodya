import { auth } from "@/auth"
import { checkDuplicate, insertData } from "@/lib/crud-actions/general-actions"
import { db } from "@/lib/db"
import { uploadImage } from "@/lib/server/helpers/imageUpload"
import { FullEmployeeFormSchema } from "@/lib/zod-schema/restaurant.zod"
import { NextRequest, NextResponse } from "next/server"

const path = '/api/employees'

/* ===================================================== 
  === [POST] Create a New Employee with Full Details ===
===================================================== */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Parse multipart form data ===
    const formData = await req.formData();
    const jsonData = formData.get("data");
    const image = formData.get("image") as File | null;

    if (typeof jsonData !== "string") {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    // === Parse and Validate Zod Data ===
    let parsed;
    try {
      parsed = FullEmployeeFormSchema.parse(JSON.parse(jsonData));
    } catch (err) {
      console.error("Validation Failed")
      return NextResponse.json({ error: "Validation failed", details: err }, { status: 400 });
    }

    const { personalInfo, employmentRecord, salaryChanges } = parsed

    // === Check for duplicate table number ===
    const duplicate = await checkDuplicate("employeesTable", "CNIC", personalInfo.CNIC)
    if (duplicate) {
      return NextResponse.json(
        { message: "This CNIC Number is already in use." },
        { status: 409 }
      )
    }

    // === Upload Image If Provided ===
    let imagePath: string | null = null;
    if (image instanceof File) {
      imagePath = await uploadImage(image, "employees_profile_image");
    }

    // === Execute DB Transaction to Insert Employee Data ===
    const employeeId = await db.transaction(async (tx) => {

      // 1. Insert into employees table
      const { insertId: newEmployeeId } = await insertData("employeesTable", {
        image: imagePath,
        name: personalInfo.name.trim(),
        CNIC: personalInfo.CNIC.trim(),
        fatherName: personalInfo.fatherName.trim(),
        email: personalInfo.email.trim(),
        phone: personalInfo.phone.trim(),
        salary: salaryChanges.newSalary.trim(),
      }, tx);

      // 2. Insert into employmentRecords table
      await insertData("employmentRecordsTable", {
        employeeId: newEmployeeId,
        designation: employmentRecord.designation.trim(),
        shift: employmentRecord.shift.trim(),
        status: employmentRecord.status,
        joinedAt: new Date(employmentRecord.joinedAt),
        changeType: employmentRecord.changeType,
        resignedAt: employmentRecord.resignedAt ? new Date(employmentRecord.resignedAt) : null,
      }, tx);

      // 3. Insert into salaryChanges table
      await insertData("salaryChangesTable", {
        employeeId: newEmployeeId,
        previousSalary: salaryChanges.previousSalary?.trim() ?? null,
        newSalary: salaryChanges.newSalary.trim(),
        reason: salaryChanges.reason?.trim() ?? null,
        changeType: salaryChanges.changeType,
      }, tx);

      return newEmployeeId;
    });

    // === Success Response ===
    return NextResponse.json(
      { message: "Employee created successfully.", insertedId: employeeId },
      { status: 201 }
    )
  } catch (error) {
    console.error(`[POST ${path}] Employee creation failed:`, error)

    return NextResponse.json(
      { error: "An unexpected error occurred while creating the Employee. Please try again later." },
      { status: 500 }
    )
  }
}

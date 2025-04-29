import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import connectDB from "@/lib/db/connect";
import BufferedResult from "@/lib/db/models/BufferedResult";
import Student from "@/lib/db/models/Student";
import { verifyAuth } from "@/lib/auth";

function validateResult(data: any) {
  const requiredFields = ["roll_number", "ut1", "ut2", "terminal", "annual_theory", "annual_practical"];
  const missingFields = requiredFields.filter((field) => !data[field]);

  if (missingFields.length > 0) {
    return {
      valid: false,
      error: `Missing required fields: ${missingFields.join(", ")}`,
    };
  }

  if (data.ut1 < 0 || data.ut1 > 25)
    return { valid: false, error: "UT1 marks must be between 0 and 25" };
  if (data.ut2 < 0 || data.ut2 > 25)
    return { valid: false, error: "UT2 marks must be between 0 and 25" };
  if (data.terminal < 0 || data.terminal > 50)
    return { valid: false, error: "terminal marks must be between 0 and 50" };
  if (data.annual_practical + data.annual_theory < 0 || data.annual_practical + data.annual_theory > 100)
    return { valid: false, error: "Annual marks must be between 0 and 100" };

  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.success || auth?.user?.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet) as any[];

    const results = [];
    const errors = [];

    for (const row of data) {
      const validation = validateResult(row);
      if (!validation.valid) {
        errors.push(`Row ${data.indexOf(row) + 2}: ${validation.error}`);
        continue;
      }

      const student = await Student.findOne({
        roll_number: row.roll_number,
      });

      if (!student) {
        errors.push(
          `Row ${data.indexOf(row) + 2}: Student not found with roll number ${
            row.roll_number
          }`
        );
        continue;
      }

      const total =
        (Number(row.ut1) +
          Number(row.ut2) +
          Number(row.terminal) +
          Number(row.annual_practical) +
          Number(row.annual_theory)) /
        2;
      const remark = total >= 35 ? "Pass" : "Fail";

      const result = await BufferedResult.create({
        teacher_id: auth.user.id,
        student_id: student._id,
        ut1: row.ut1,
        ut2: row.ut2,
        terminal: row.terminal,
        annual_theory: row.annual_theory,
        annual_practical: row.annual_practical,
        total,
        remark,
        status: "draft",
      });

      results.push(result);
    }

    return NextResponse.json({
      message: "Results uploaded successfully",
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error uploading results:", error);
    return NextResponse.json(
      { error: "Failed to upload results" },
      { status: 500 }
    );
  }
}
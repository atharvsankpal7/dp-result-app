import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import connectDB from "@/lib/db/connect";
import Result from "@/lib/db/models/Result";
import Student from "@/lib/db/models/Student";
import { verifyAuth } from "@/lib/auth";

// Validate result data
function validateResult(data: any) {
  const requiredFields = ["roll_number", "ut1", "ut2", "terminal", "annual_theory", "annual_practical"];
  const missingFields = requiredFields.filter((field) => !data[field]);

  if (missingFields.length > 0) {
    return {
      valid: false,
      error: `Missing required fields: ${missingFields.join(", ")}`,
    };
  }

  // Validate marks ranges
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

    // Verify teacher authentication
    const auth = await verifyAuth(request);
    if (!auth.success || auth?.user?.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const divisionId = formData.get("divisionId") as string;
    const subjectId = formData.get("subjectId") as string;

    if (!file || !divisionId || !subjectId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Read and parse Excel file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const results = [];
    const errors = [];

    // Process each row
    for (const row of data) {
      // Validate row data
      const validation = validateResult(row);
      if (!validation.valid) {
        errors.push(`Row ${data.indexOf(row) + 2}: ${validation.error}`);
        continue;
      }

      // Find student by roll number in the division
      const student = await Student.findOne({
        roll_number: row.roll_number,
        division_id: divisionId,
      });

      if (!student) {
        errors.push(
          `Row ${data.indexOf(row) + 2}: Student not found with roll number ${
            row.roll_number
          }`
        );
        continue;
      }

      // Calculate total and determine remark
      const total =
        (Number(row.ut1) +
          Number(row.ut2) +
          Number(row.terminal) +
          Number(row.annual_practical) +
          Number(row.annual_theory)) /
        2;
      const remark = total >= 35 ? "Pass" : "Fail";

      // Create or update result
      const result = await Result.findOneAndUpdate(
        {
          student_id: student._id,
          subject_id: subjectId,
        },
        {
          ut1: row.ut1,
          ut2: row.ut2,
          terminal: row.terminal,
          annual_theory: row.annual_theory,
          annual_practical: row.annual_practical,
          total,
          remark,
        },
        { new: true, upsert: true }
      );

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

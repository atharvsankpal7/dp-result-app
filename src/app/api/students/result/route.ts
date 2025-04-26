import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Student from "@/lib/db/models/Student";
import Result from "@/lib/db/models/Result";

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const { roll_number, mother_name, class_id } = await request.json();

    // Find student by roll number and mother's name only
    const student = await Student.findOne({
      roll_number,
      mother_name: { $regex: new RegExp(`^${mother_name}$`, "i") }, // Case-insensitive match
    }).populate({
      path: "division_id",
      populate: {
        path: "class_id",
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found. Please check your details." },
        { status: 401 }
      );
    }

    // Verify if student belongs to the specified class
    if (student.division_id.class_id._id.toString() !== class_id) {
      return NextResponse.json(
        { error: "Invalid class selected for this student." },
        { status: 401 }
      );
    }

    // Get all results for the student
    const results = await Result.find({
      student_id: student._id,
    }).populate("subject_id");

    return NextResponse.json({
      student_name: student.name,
      class_name: student.division_id.class_id.name,
      division_name: student.division_id.name,
      results: results.map((result) => ({
        subject_id: {
          name: result.subject_id.name,
          course_code: result.subject_id.course_code,
        },
        ut1: result.ut1,
        ut2: result.ut2,
        terminal: result.terminal,
        annual_practical: result.annual_practical,
        annual_theory: result.annual_theory,
        total: result.total,
        remark: result.remark,
      })),
    });
  } catch (error) {
    console.error("Error fetching student results:", error);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}
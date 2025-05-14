import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Result from "@/lib/db/models/Result";
import Student from "@/lib/db/models/Student";
import { verifyAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get("subject");

    if (!subject) {
      return NextResponse.json(
        { error: "Subject ID is required" },
        { status: 400 }
      );
    }

    const results = await Result.find({ subject_id: subject })
      .populate("student_id")
      .populate("subject_id");

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Find student
    const student = await Student.findById(body.student_id);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Find or create result
    const result = await Result.findOneAndUpdate(
      {
        student_id: body.student_id,
        subject_id: body.subject_id,
      },
      {
        $set: {
          ...(body.ut1 && { ut1: Number(body.ut1) }),
          ...(body.ut2 && { ut2: Number(body.ut2) }),
          ...(body.terminal && { terminal: Number(body.terminal) }),
          ...(body.annual_theory && {
            annual_theory: Number(body.annual_theory),
          }),
          ...(body.annual_practical && {
            annual_practical: Number(body.annual_practical),
          }),
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating result:", error);
    return NextResponse.json(
      { error: "Failed to create/update result" },
      { status: 500 }
    );
  }
}

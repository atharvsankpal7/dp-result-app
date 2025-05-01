import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import BufferedResult from "@/lib/db/models/BufferedResult";
import { verifyAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.success || auth?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = await BufferedResult.find({ status: "submitted" })
      .populate("student_id")
      .populate("subject_id")
      .populate("teacher_id")
      .sort({ "student_id.roll_number": 1 });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching submitted results:", error);
    return NextResponse.json(
      { error: "Failed to fetch submitted results" },
      { status: 500 }
    );
  }
}
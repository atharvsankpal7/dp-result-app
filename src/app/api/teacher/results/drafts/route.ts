import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import BufferedResult from "@/lib/db/models/BufferedResult";
import { verifyAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.success || auth?.user?.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "30");
    const skip = (page - 1) * limit;

    const results = await BufferedResult.find({
      teacher_id: auth.user.id,
      status: "draft",
    })
      .populate("student_id")
      .populate("subject_id")
      .sort({ "student_id.roll_number": 1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching draft results:", error);
    return NextResponse.json(
      { error: "Failed to fetch draft results" },
      { status: 500 }
    );
  }
}

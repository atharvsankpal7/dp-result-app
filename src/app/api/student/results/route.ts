import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/db/connect";
import Result from "@/lib/db/models/Result";
import Subject from "@/lib/db/models/Subject";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    
    // Ensure Subject model is loaded
    // This is a side-effect import to ensure the model is registered in Mongoose
    const _ = Subject;

    const results = await Result.find({ student_id: payload.id })
      .populate("subject_id", "name course_code")
      .sort({ createdAt: -1 });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching student results:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

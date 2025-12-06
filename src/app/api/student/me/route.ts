import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/db/connect";
import Student from "@/lib/db/models/Student";
import Division from "@/lib/db/models/Division";
import Class from "@/lib/db/models/Class";

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
    const student = await Student.findById(payload.id).populate({
      path: "division_id",
      populate: { path: "class_id" }
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error fetching student profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Staff from "@/lib/db/models/Staff";
import { verifyAuth } from "@/lib/auth";
import "@/lib/db/models/Subject";
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.success || auth?.user?.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacher = await Staff.findById(auth.user.id).populate("assigned_subject");
    
    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    return NextResponse.json(teacher.assigned_subject);
  } catch (error) {
    console.error("Error fetching teacher subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}
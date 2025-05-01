import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import BufferedResult from "@/lib/db/models/BufferedResult";
import Result from "@/lib/db/models/Result";
import { verifyAuth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.success || auth?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resultId } = await request.json();

    // Find the buffered result
    const bufferedResult = await BufferedResult.findById(resultId);
    if (!bufferedResult) {
      return NextResponse.json(
        { error: "Result not found" },
        { status: 404 }
      );
    }

    // Create a new result in the Result model
    await Result.create({
      student_id: bufferedResult.student_id,
      subject_id: bufferedResult.subject_id,
      ut1: bufferedResult.ut1,
      ut2: bufferedResult.ut2,
      terminal: bufferedResult.terminal,
      annual_theory: bufferedResult.annual_theory,
      annual_practical: bufferedResult.annual_practical,
      total: bufferedResult.total,
      remark: bufferedResult.remark,
    });

    // Update the buffered result status
    bufferedResult.status = "approved";
    await bufferedResult.save();

    return NextResponse.json({ message: "Result approved successfully" });
  } catch (error) {
    console.error("Error approving result:", error);
    return NextResponse.json(
      { error: "Failed to approve result" },
      { status: 500 }
    );
  }
}
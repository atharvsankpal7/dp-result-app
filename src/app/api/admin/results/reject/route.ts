import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import BufferedResult from "@/lib/db/models/BufferedResult";
import { verifyAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.success || auth?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resultId } = await request.json();

    // Find and update the buffered result
    const bufferedResult = await BufferedResult.findById(resultId);
    if (!bufferedResult) {
      return NextResponse.json(
        { error: "Result not found" },
        { status: 404 }
      );
    }

    bufferedResult.status = "draft";
    await bufferedResult.save();

    return NextResponse.json({ message: "Result rejected successfully" });
  } catch (error) {
    console.error("Error rejecting result:", error);
    return NextResponse.json(
      { error: "Failed to reject result" },
      { status: 500 }
    );
  }
}
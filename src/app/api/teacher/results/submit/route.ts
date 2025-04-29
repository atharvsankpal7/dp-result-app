
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import BufferedResult from "@/lib/db/models/BufferedResult";
import { verifyAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.success || auth?.user?.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await BufferedResult.updateMany(
      {
        teacher_id: auth.user.id,
        status: "draft",
      },
      {
        $set: { status: "submitted" },
      }
    );

    return NextResponse.json({ message: "Results submitted successfully" });
  } catch (error) {
    console.error("Error submitting results:", error);
    return NextResponse.json(
      { error: "Failed to submit results" },
      { status: 500 }
    );
  }
}


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

    const { results } = await request.json();

    // Update each result
    await Promise.all(
      results.map((result: any) =>
        BufferedResult.findByIdAndUpdate(result._id, {
          ut1: result.ut1,
          ut2: result.ut2,
          terminal: result.terminal,
          annual_theory: result.annual_theory,
          annual_practical: result.annual_practical,
        })
      )
    );

    return NextResponse.json({ message: "Results saved successfully" });
  } catch (error) {
    console.error("Error saving results:", error);
    return NextResponse.json(
      { error: "Failed to save results" },
      { status: 500 }
    );
  }
}

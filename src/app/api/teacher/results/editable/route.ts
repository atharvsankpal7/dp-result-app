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

    const { subject_id, results } = await request.json();

    // Validate the results
    for (const result of results) {
      const {
        student_id,
        ut1,
        ut2,
        terminal,
        annual_theory,
        annual_practical,
      } = result;

      // Convert string values to numbers
      const marks = {
        ut1: Number(ut1),
        ut2: Number(ut2),
        terminal: Number(terminal),
        annual_theory: Number(annual_theory),
        annual_practical: Number(annual_practical),
      };

      // Validate marks ranges
      if (marks.ut1 < 0 || marks.ut1 > 25) {
        return NextResponse.json(
          { error: "UT1 marks must be between 0 and 25" },
          { status: 400 }
        );
      }
      if (marks.ut2 < 0 || marks.ut2 > 25) {
        return NextResponse.json(
          { error: "UT2 marks must be between 0 and 25" },
          { status: 400 }
        );
      }
      if (marks.terminal < 0 || marks.terminal > 50) {
        return NextResponse.json(
          { error: "Terminal marks must be between 0 and 50" },
          { status: 400 }
        );
      }
      if (marks.annual_theory + marks.annual_practical > 100) {
        return NextResponse.json(
          { error: "Total annual marks cannot exceed 100" },
          { status: 400 }
        );
      }

      // Calculate total and determine remark
      const total =
        (marks.ut1 +
          marks.ut2 +
          marks.terminal +
          marks.annual_theory +
          marks.annual_practical) /
        2;
      const remark = total >= 35 ? "Pass" : "Fail";

      // Create or update result
      await BufferedResult.findOneAndUpdate(
        {
          teacher_id: auth.user.id,
          student_id,
          subject_id,
        },
        {
          ut1: marks.ut1,
          ut2: marks.ut2,
          terminal: marks.terminal,
          annual_theory: marks.annual_theory,
          annual_practical: marks.annual_practical,
          total,
          remark,
          status: "draft",
        },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({ message: "Results saved successfully" });
  } catch (error) {
    console.error("Error saving results:", error);
    return NextResponse.json(
      { error: "Failed to save results" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Division from "@/lib/db/models/Division";
import Class from "@/lib/db/models/Class";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  try {
    const { id } = await params;
    const division = await Division.findById(id)
      .populate("class_id")
      .populate("subjects");

    if (!division) {
      return NextResponse.json(
        { error: "Division not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(division);
  } catch (error) {
    return NextResponse.json(
      { error },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  try {
    const body = await request.json();
    const { id } = await params;
    const division = await Division.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    })
      .populate("class_id")
      .populate("subjects");

    if (!division) {
      return NextResponse.json(
        { error: "Division not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(division);
  } catch (error) {
    return NextResponse.json(
      { error },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  try {
    // Remove division reference from class
    const { id } = await params;
    const division = await Division.findById(id);
    if (!division) {
      return NextResponse.json(
        { error: "Division not found" },
        { status: 404 }
      );
    }

    await Class.findByIdAndUpdate(division.class_id, {
      $pull: { divisions: division._id },
    });
    // Delete the division
    await Division.findByIdAndDelete(id);

    return NextResponse.json({ message: "Division deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error},
      { status: 500 }
    );
  }
}

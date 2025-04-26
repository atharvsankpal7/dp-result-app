import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Division from '@/lib/db/models/Division';
import Class from '@/lib/db/models/Class';

export async function GET() {
  await connectDB();
  try {
    const divisions = await Division.find({})
      .populate('class_id')
      .populate('subjects');
    return NextResponse.json(divisions);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const body = await request.json();

    // Check if division name already exists in the same class
    const existingDivision = await Division.findOne({
      name: body.name,
      class_id: body.class_id
    });

    if (existingDivision) {
      return NextResponse.json(
        { error: 'Division with this name already exists in this class' },
        { status: 409 }
      );
    }

    const division = await Division.create(body);
    await Class.findByIdAndUpdate(
      division.class_id,
      { $push: { divisions: division._id } }
    );
    return NextResponse.json(division, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create division' }, { status: 500 });
  }
}
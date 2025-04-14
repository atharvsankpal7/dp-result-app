import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Division from '@/lib/db/models/Division';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const { subjects } = await request.json();
    const division = await Division.findByIdAndUpdate(
      params.id,
      { $set: { subjects } },
      { new: true }
    )
    .populate('class_id')
    .populate('subjects');

    if (!division) {
      return NextResponse.json({ error: 'Division not found' }, { status: 404 });
    }

    return NextResponse.json(division);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to assign subjects' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const { subjectId } = await request.json();
    const division = await Division.findByIdAndUpdate(
      params.id,
      { $pull: { subjects: subjectId } },
      { new: true }
    )
    .populate('class_id')
    .populate('subjects');

    if (!division) {
      return NextResponse.json({ error: 'Division not found' }, { status: 404 });
    }

    return NextResponse.json(division);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove subject' }, { status: 500 });
  }
}
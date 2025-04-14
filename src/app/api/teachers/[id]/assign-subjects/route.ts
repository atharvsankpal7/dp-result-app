import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Teacher from '@/lib/db/models/Teacher';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const { assignments } = await request.json();
    const teacher = await Teacher.findByIdAndUpdate(
      params.id,
      { $set: { assigned_subjects: assignments } },
      { new: true }
    )
    .populate('assigned_subjects.subject_id')
    .populate('assigned_subjects.division_id');

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    return NextResponse.json(teacher);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to assign subjects' }, { status: 500 });
  }
}
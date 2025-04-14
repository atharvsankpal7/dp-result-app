import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Teacher from '@/lib/db/models/Teacher';

export async function GET() {
  await connectDB();
  try {
    const teachers = await Teacher.find({})
      .populate('assigned_subjects.subject_id')
      .populate('assigned_subjects.division_id');
    return NextResponse.json(teachers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const body = await request.json();
    const teacher = await Teacher.create(body);
    return NextResponse.json(teacher, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create teacher' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Student from '@/lib/db/models/Student';

export async function GET() {
  await connectDB();
  try {
    const students = await Student.find({}).populate('division_id');
    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const body = await request.json();
    const student = await Student.create(body);
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Student from '@/lib/db/models/Student';
import  '@/lib/db/models/Division';
export async function GET() {
  await connectDB();
  try {
    const students = await Student.find({}).populate({
      path: 'division_id',
      populate: { path: 'class_id' }
    });
    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const body = await request.json();
    
    // Check if roll number already exists (globally)
    const existingStudent = await Student.findOne({
      roll_number: body.roll_number
    });
    
    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student with this roll number already exists' },
        { status: 409 }
      );
    }

    const student = await Student.create({
      name: body.name,
      mother_name: body.mother_name,
      roll_number: body.roll_number,
      division_id: body.division_id
    });

    const populatedStudent = await student.populate({
      path: 'division_id',
      populate: { path: 'class_id' }
    });

    return NextResponse.json(populatedStudent, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}
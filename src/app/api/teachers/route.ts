import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Teacher from '@/lib/db/models/Staff';

export async function GET() {
  await connectDB();
  try {
    const teachers = await Teacher.find({})
      
    return NextResponse.json(teachers);
  } catch (error) {
    console.error('Failed to fetch teachers:', error);
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const body = await request.json();
    
    // Check if email already exists
    const existingTeacher = await Teacher.findOne({ email: body.email });
    if (existingTeacher) {
      return NextResponse.json(
        { error: 'Teacher with this email already exists' },
        { status: 400 }
      );
    }

    const teacher = await Teacher.create({
      name: body.name,
      email: body.email,
      password: body.password,
      role: 'teacher',
    });

    // Don't send password in response
    const teacherResponse = {
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
    };

    return NextResponse.json(teacherResponse, { status: 201 });
  } catch (error) {
    console.error('Error creating teacher:', error);
    return NextResponse.json({ error: 'Failed to create teacher' }, { status: 500 });
  }
}
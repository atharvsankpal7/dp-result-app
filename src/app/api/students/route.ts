import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Student from '@/lib/db/models/Student';
import Division from '@/lib/db/models/Division';
import '@/lib/db/models/Division';

export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject');

    if (subjectId) {
      // Find all divisions that have this subject
      const divisions = await Division.find({ subjects: subjectId });
      const divisionIds = divisions.map(div => div._id);

      // Find all students in these divisions
      const students = await Student.find({
        division_id: { $in: divisionIds },
        status: 'Active'
      }).sort({ roll_number: 1 });

      return NextResponse.json(students);
    }

    // If no subject ID provided, return all students
    const students = await Student.find({}).populate({
      path: 'division_id',
      populate: { path: 'class_id' }
    });
    return NextResponse.json(students);
  } catch (error) {
    console.error('Failed to fetch students:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const body = await request.json();
    
    // Check if roll number already exists (globally)
    // Check if roll number or mobile number already exists
    const existingStudent = await Student.findOne({
      $or: [
        { roll_number: body.roll_number },
        { mobile_number: body.mobile_number }
      ]
    });
    
    if (existingStudent) {
      const field = existingStudent.roll_number === body.roll_number ? 'roll number' : 'mobile number';
      return NextResponse.json(
        { error: `Student with this ${field} already exists` },
        { status: 409 }
      );
    }

    const student = await Student.create({
      name: body.name,
      mother_name: body.mother_name,
      roll_number: body.roll_number,
      mobile_number: body.mobile_number,
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
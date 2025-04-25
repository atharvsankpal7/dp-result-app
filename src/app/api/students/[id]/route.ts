import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Student from '@/lib/db/models/Student';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const student = await Student.findById(params.id)
      .populate({
        path: 'division_id',
        populate: { path: 'class_id' }
      });
    
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    return NextResponse.json(student);
  } catch (error) {
    return NextResponse.json({error}, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const body = await request.json();
    const student = await Student.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true
    }).populate({
      path: 'division_id',
      populate: { path: 'class_id' }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    return NextResponse.json(student);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const student = await Student.findByIdAndDelete(params.id);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Student from '@/lib/db/models/Student';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  try {
    const { id } = await params;
    const student = await Student.findById(id)
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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  try {
    const body = await request.json();
    const { id } = await params;

    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    } 

    const student = await Student.findByIdAndUpdate(id, body, {
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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  try {
    const { id } = await params;
    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}
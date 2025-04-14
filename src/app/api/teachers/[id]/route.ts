import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Teacher from '@/lib/db/models/Teacher';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const teacher = await Teacher.findById(params.id)
      .populate('assigned_subjects.subject_id')
      .populate({
        path: 'assigned_subjects.division_id',
        populate: { path: 'class_id' }
      });
    
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }
    return NextResponse.json(teacher);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch teacher' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const body = await request.json();
    const teacher = await Teacher.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true
    })
    .populate('assigned_subjects.subject_id')
    .populate({
      path: 'assigned_subjects.division_id',
      populate: { path: 'class_id' }
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }
    return NextResponse.json(teacher);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update teacher' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const teacher = await Teacher.findByIdAndDelete(params.id);
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete teacher' }, { status: 500 });
  }
}
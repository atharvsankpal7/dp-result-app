import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Teacher from '@/lib/db/models/staff';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const teacher = await Teacher.findById(params.id)
     
    
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Don't send password in response
    const teacherResponse = {
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      assigned_subjects: teacher.assigned_subjects
    };

    return NextResponse.json(teacherResponse);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch teacher' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const body = await request.json();
    const updateData = { ...body };

    // If password is provided, hash it
    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(body.password, salt);
    } else {
      delete updateData.password; // Don't update password if not provided
    }

    const teacher = await Teacher.findByIdAndUpdate(params.id, updateData, {
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

    // Don't send password in response
    const teacherResponse = {
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      assigned_subjects: teacher.assigned_subjects
    };

    return NextResponse.json(teacherResponse);
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
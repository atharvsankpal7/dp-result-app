import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import bcrypt from 'bcryptjs';
import Staff from '@/lib/db/models/Staff';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  try {
    const {id} = await params;
    const teacher = await Staff.findById(id)
     
    
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Don't send password in response
    const teacherResponse = {
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
    };

    return NextResponse.json(teacherResponse);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  try {
    const {id} = await params;
    const body = await request.json();
    const updateData = { ...body };

    // If password is provided, hash it
    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(body.password, salt);
    } else {
      delete updateData.password; // Don't update password if not provided
    }

    const teacher = await Staff.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    })
    .populate('assigned_subject.subject_id')
    .populate({
      path: 'assigned_subject.division_id',
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
    };

    return NextResponse.json(teacherResponse);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  try {
    const { id } = await params;
    const teacher = await Staff.findByIdAndDelete(id);
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
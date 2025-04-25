import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Class from '@/lib/db/models/Class';
import Division from '@/lib/db/models/Division';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const {id} = await params;
    const class_ = await Class.findById(id).populate('divisions');
    if (!class_) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }
    return NextResponse.json(class_);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const {id} = await params;
    const body = await request.json();
    const class_ = await Class.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true
    });
    if (!class_) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }
    return NextResponse.json(class_);
  } catch (error) {
    return NextResponse.json({ error}, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const {id} = await params
    await Division.deleteMany({ class_id: id });
    const class_ = await Class.findByIdAndDelete(id);
    if (!class_) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Class and associated divisions deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
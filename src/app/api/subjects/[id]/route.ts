import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Subject from '@/lib/db/models/Subject';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const subject = await Subject.findById(params.id);
    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }
    return NextResponse.json(subject);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const body = await request.json();
    const subject = await Subject.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true
    });
    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }
    return NextResponse.json(subject);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const subject = await Subject.findByIdAndDelete(params.id);
    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error}, { status: 500 });
  }
}
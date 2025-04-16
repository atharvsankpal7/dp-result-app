import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Subject from '@/lib/db/models/Subject';

export async function GET() {
  await connectDB();
  try {
    const subjects = await Subject.find({});
    return NextResponse.json(subjects);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const body = await request.json();
    
    // Check if course code already exists
    const existingSubject = await Subject.findOne({ course_code: body.course_code });
    if (existingSubject) {
      return NextResponse.json(
        { error: 'Subject with this course code already exists' },
        { status: 400 }
      );
    }

    const subject = await Subject.create(body);
    return NextResponse.json(subject, { status: 201 });
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
  }
}
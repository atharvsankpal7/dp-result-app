import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Result from '@/lib/db/models/Result';

export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('class');
    const divisionId = searchParams.get('division');
    const subjectId = searchParams.get('subject');

    const results = await Result.find({
      'student_id.division_id': divisionId,
      subject_id: subjectId
    }).populate('student_id').populate('subject_id');

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const body = await request.json();
    const result = await Result.create(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create result' }, { status: 500 });
  }
}
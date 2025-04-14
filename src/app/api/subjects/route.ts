import { NextResponse } from 'next/server';
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
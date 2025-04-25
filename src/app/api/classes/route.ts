import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Class from '@/lib/db/models/Class';
import '@/lib/db/models/Division';

export async function GET() {
  await connectDB();
  try {
      const classes = await Class.find({}).populate({
        path: 'divisions',
        populate: {
          path: 'subjects'
        }

      }).lean().exec() || [];
    return NextResponse.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const body = await request.json();
    const class_ = await Class.create(body);
    return NextResponse.json(class_, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
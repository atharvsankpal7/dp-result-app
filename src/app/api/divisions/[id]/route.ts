import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Division from '@/lib/db/models/Division';
import Class from '@/lib/db/models/Class';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const division = await Division.findById(params.id)
      .populate('class_id')
      .populate('subjects');
    
    if (!division) {
      return NextResponse.json({ error: 'Division not found' }, { status: 404 });
    }
    return NextResponse.json(division);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch division' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const body = await request.json();
    const division = await Division.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true
    })
    .populate('class_id')
    .populate('subjects');

    if (!division) {
      return NextResponse.json({ error: 'Division not found' }, { status: 404 });
    }
    return NextResponse.json(division);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update division' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    // Remove division reference from class
    const division = await Division.findById(params.id);
    if (!division) {
      return NextResponse.json({ error: 'Division not found' }, { status: 404 });
    }

    await Class.findByIdAndUpdate(division.class_id, {
      $pull: { divisions: division._id }
    });

    // Delete the division
    await Division.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Division deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete division' }, { status: 500 });
  }
}
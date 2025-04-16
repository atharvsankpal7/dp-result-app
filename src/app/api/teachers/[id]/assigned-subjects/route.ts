import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Staff from '@/lib/db/models/staff';
import { verifyAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Verify teacher authentication
    const auth = await verifyAuth(request);
    if (!auth.success || auth.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure teacher can only access their own subjects
    if (auth.user.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const teacher = await Staff.findById(params.id)
      .populate('assigned_subjects.subject_id')
      .populate({
        path: 'assigned_subjects.division_id',
        populate: { path: 'class_id' }
      });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    return NextResponse.json(teacher.assigned_subjects);
  } catch (error) {
    console.error('Error fetching assigned subjects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assigned subjects' },
      { status: 500 }
    );
  }
}
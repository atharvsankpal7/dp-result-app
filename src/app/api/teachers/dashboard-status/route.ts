import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Staff from '@/lib/db/models/staff';
import Result from '@/lib/db/models/Result';
import Student from '@/lib/db/models/Student';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.success || auth?.user?.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teacher = await Staff.findById(auth.user.id);
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Get all division IDs assigned to the teacher
    const divisionIds = teacher.assigned_subjects.map(assignment => assignment.division_id);
    const subjectIds = teacher.assigned_subjects.map(assignment => assignment.subject_id);

    // Count total students in assigned divisions
    const totalStudents = await Student.countDocuments({
      division_id: { $in: divisionIds }
    });

    // Count total results uploaded by the teacher
    const totalResults = await Result.countDocuments({
      subject_id: { $in: subjectIds }
    });

    return NextResponse.json({
      totalStudents,
      totalResults
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Result from '@/lib/db/models/Result';
import Student from '@/lib/db/models/Student';

export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const divisionId = searchParams.get('division');

    if (!divisionId) {
      return NextResponse.json({ error: 'Division ID is required' }, { status: 400 });
    }

    // Get all students in the division
    const students = await Student.find({ division_id: divisionId });

    // Get all results for these students
    const results = await Promise.all(
      students.map(async (student) => {
        const studentResults = await Result.find({ student_id: student._id })
          .populate('subject_id')
          .lean();

        return {
          student_id: {
            _id: student._id,
            name: student.name,
            roll_number: student.roll_number
          },
          subject_results: studentResults.map(result => ({
            subject_id: {
              name: result.subject_id.name,
              course_code: result.subject_id.course_code
            },
            ut1: result.ut1,
            ut2: result.ut2,
            terminal: result.terminal,
            annual_theory: result.annual_theory,
            annual_practical: result.annual_practical,
            total: result.total,
            remark: result.remark
          }))
        };
      })
    );

    // Sort results by roll number
    results.sort((a, b) => 
      a.student_id.roll_number.localeCompare(b.student_id.roll_number)
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching division results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch division results' },
      { status: 500 }
    );
  }
}
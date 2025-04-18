import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Student from '@/lib/db/models/Student';
import Result from '@/lib/db/models/Result';

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const { roll_number, mother_name } = await request.json();

    // Find student by roll number and mother's name
    const student = await Student.findOne({
      roll_number,
      mother_name: { $regex: new RegExp(`^${mother_name}$`, 'i') } // Case-insensitive match
    }).populate('division_id');

    if (!student) {
      return NextResponse.json(
        { error: 'Invalid roll number or mother\'s name' },
        { status: 401 }
      );
    }

    // Get all results for the student
    const results = await Result.find({
      student_id: student._id
    }).populate('subject_id');

    return NextResponse.json({
      student_name: student.name,
      results: results.map(result => ({
        subject_id: {
          name: result.subject_id.name,
          course_code: result.subject_id.course_code
        },
        ut1: result.ut1,
        ut2: result.ut2,
        mid_term: result.mid_term,
        annual: result.annual,
        total: result.total,
        remark: result.remark
      }))
    });
  } catch (error) {
    console.error('Error fetching student results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
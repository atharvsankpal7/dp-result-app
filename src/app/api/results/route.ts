import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Result from '@/lib/db/models/Result';
import Student from '@/lib/db/models/Student';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('class');
    const divisionId = searchParams.get('division');
    const subjectId = searchParams.get('subject');

    const results = await Result.find({
      subject_id: subjectId,
      student_id: {
        $in: await Student.find({ division_id: divisionId }).distinct('_id')
      }
    }).populate('student_id').populate('subject_id');

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const auth = await verifyAuth(request);
    if (!auth.success || auth?.user?.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Find student by roll number and division
    const student = await Student.findOne({
      roll_number: body.roll_number,
      division_id: body.division_id
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Calculate total and determine remark
    const total = (Number(body.ut1) + Number(body.ut2) + Number(body.terminal) + Number(body.annual)) / 2;
    const remark = total >= 35 ? 'Pass' : 'Fail';

    // Create or update result
    const result = await Result.findOneAndUpdate(
      {
        student_id: student._id,
        subject_id: body.subject_id
      },
      {
        ut1: body.ut1,
        ut2: body.ut2,
        terminal: body.terminal,
        annual: body.annual,
        total,
        remark
      },
      { new: true, upsert: true }
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating result:', error);
    return NextResponse.json({ error: 'Failed to create result' }, { status: 500 });
  }
}
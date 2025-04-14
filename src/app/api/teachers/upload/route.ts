import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Teacher from '@/lib/db/models/Teacher';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const teachers = await Promise.all(
      data.map(async (row: any) => {
        // Check if teacher already exists
        const existingTeacher = await Teacher.findOne({ email: row.email });
        if (existingTeacher) {
          throw new Error(`Teacher with email ${row.email} already exists`);
        }

        const teacher = await Teacher.create({
          name: row.name,
          email: row.email,
          assigned_subjects: []
        });

        return teacher.populate('assigned_subjects.subject_id')
          .populate({
            path: 'assigned_subjects.division_id',
            populate: { path: 'class_id' }
          });
      })
    );

    return NextResponse.json(teachers, { status: 201 });
  } catch (error) {
    console.error('Error uploading teachers:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to upload teachers' 
    }, { status: 500 });
  }
}
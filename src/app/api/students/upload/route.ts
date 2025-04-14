import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Student from '@/lib/db/models/Student';
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

    const students = await Promise.all(
      data.map(async (row: any) => {
        const student = await Student.create({
          name: row.name,
          mother_name: row.mother_name,
          roll_number: row.roll_number,
          division_id: row.division_id
        });
        return student;
      })
    );

    return NextResponse.json(students, { status: 201 });
  } catch (error) {
    console.error('Error uploading students:', error);
    return NextResponse.json({ error: 'Failed to upload students' }, { status: 500 });
  }
}
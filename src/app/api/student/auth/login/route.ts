import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Student from '@/lib/db/models/Student';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const { mobile_number, password } = await request.json();

    if (!mobile_number) {
      return NextResponse.json({ error: 'Mobile number is required' }, { status: 400 });
    }

    const student = await Student.findOne({ mobile_number }).select('+password');

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Check if password is not set (first time login)
    if (!student.password) {
      return NextResponse.json({ 
        message: 'First time login, password setup required',
        requiresSetup: true 
      }, { status: 200 });
    }

    // If password is provided in request, verify it
    if (password) {
      const isMatch = await bcrypt.compare(password, student.password);
      if (!isMatch) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      
      // Login successful
      // In a real app, you'd set a session cookie or return a token here
      // For this task, we'll just return success and the student info needed
      return NextResponse.json({ 
        message: 'Login successful',
        student: {
          _id: student._id,
          name: student.name,
          roll_number: student.roll_number,
          mobile_number: student.mobile_number
        }
      });
    } else {
        // Password required but not provided
        return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

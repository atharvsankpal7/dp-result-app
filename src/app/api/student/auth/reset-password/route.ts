import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Student from '@/lib/db/models/Student';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const { mobile_number, otp, new_password } = await request.json();

    if (!mobile_number || !otp || !new_password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const student = await Student.findOne({ mobile_number }).select('+otp');

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    if (!student.otp || !student.otp.code || !student.otp.expiresAt) {
      return NextResponse.json({ error: 'Invalid OTP request' }, { status: 400 });
    }

    if (student.otp.code !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    if (new Date() > student.otp.expiresAt) {
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    student.password = hashedPassword;
    student.otp = undefined; // Clear OTP
    await student.save();

    return NextResponse.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

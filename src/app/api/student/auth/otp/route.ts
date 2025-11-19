import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Student from '@/lib/db/models/Student';

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const { mobile_number } = await request.json();

    if (!mobile_number) {
      return NextResponse.json({ error: 'Mobile number is required' }, { status: 400 });
    }

    const student = await Student.findOne({ mobile_number });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Generate 6 digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Save OTP to student record
    student.otp = {
      code: otpCode,
      expiresAt: expiresAt
    };
    await student.save();

    // Mock Send SMS
    console.log(`[MOCK SMS] OTP for ${mobile_number}: ${otpCode}`);

    return NextResponse.json({ message: 'OTP sent successfully' });

  } catch (error) {
    console.error('OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

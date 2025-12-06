import Student from "@/lib/db/models/Student";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db/connect";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";


export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { mobile_number, password } = await req.json();

    if (!mobile_number || !password) {
      return NextResponse.json(
        { error: "Mobile number and password are required" },
        { status: 400 }
      );
    }

    const student = await Student.findOne({ mobile_number }).select("+password");
    
    if (!student) {
      return NextResponse.json(
        { error: "Invalid mobile number or password" },
        { status: 401 }
      );
    }

    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid mobile number or password" },
        { status: 401 }
      );
    }

    if (student.status !== "Active") {
      return NextResponse.json(
        { error: "Account is not active" },
        { status: 403 }
      );
    }

    const token = jwt.sign(
      { id: student._id, role: "student" },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    const response = NextResponse.json(
      { 
        message: "Login successful",
        student: {
          _id: student._id,
          name: student.name,
          role: "student"
        }
      },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Student login error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

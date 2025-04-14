import Staff from "@/lib/db/models/staff";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const { email, password, name, role } = await req.json();
  
  // Check if staff with this email already exists
  const existingStaff = await Staff.findOne({ email });
  if (existingStaff) {
    return new Response("Email already in use", { status: 409 });
  }
  
  
  // Create new staff member
  const newStaff = await Staff.create({
    email,
    password,
    name,
    role
  });
  
  // Generate JWT token
  const token = jwt.sign({ id: newStaff._id }, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });
  
  return new Response("Registration successful", {
    status: 201,
    headers: {
      "Set-Cookie": `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24}`,
    },
  });
}
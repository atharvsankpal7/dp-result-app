import Staff from "@/lib/db/model/staff";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db/connect";

export async function POST(req: Request) {
  await connectDB();
  const { email, password } = await req.json();
  console.log(email, password);
  const staff = await Staff.findOne({ email }).select("-password");
  if (!staff) {
    return new Response("Invalid email or password", { status: 401 });
  }
  console.log(password)
  const isMatch = await staff.comparePassword(password);
  if (!isMatch) {
    return new Response("Invalid email or password", { status: 401 });
  }

  const token = jwt.sign({ id: staff._id }, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });

  return new Response(JSON.stringify({ staff }), {
    status: 200,
    headers: {
      "Set-Cookie": `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24}`,
    },
  });
}
import Staff from "@/lib/db/models/staff";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db/connect";

export async function POST(req: Request) {
  try{await connectDB();
  const { email, password } = await req.json();
  const staff = await Staff.findOne({ email });
  if (!staff) {
    console.log("Invalid email or password");
    return new Response("Invalid email or password", { status: 401 });
  }
  const isMatch = await staff.comparePassword(password);
  if (!isMatch) {
    console.log("Invalid password");
    return new Response("Invalid email or password", { status: 401 });
  }

  const token = jwt.sign({ id: staff._id, role : staff.role }, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });

  return new Response(JSON.stringify({ staff }), {
    status: 200,
    headers: {
      "Set-Cookie": `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24}`,
    },
  });}catch(error){
    console.log(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
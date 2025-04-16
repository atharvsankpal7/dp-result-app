import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function verifyAuth(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return { success: false, error: 'No token provided' };
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return {
      success: true,
      user: {
        id: payload.id as string,
        role: payload.role as string
      }
    };
  } catch (error) {
    return { success: false, error: 'Invalid token' };
  }
}
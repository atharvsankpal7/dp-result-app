import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  // If there's no token and the user is trying to access a protected route
  if (!token && !request.nextUrl.pathname.endsWith('/login') ) {
    console.log('No token, redirecting to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If there's a token and the user is trying to access the login page
  if (token && request.nextUrl.pathname.endsWith('/login')) {
    console.log('Token found, redirecting to home')
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If there's a token, verify it
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      await jwtVerify(token, secret)
      return NextResponse.next()
    } catch (error) {
      // If token is invalid, redirect to login
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  console.log('hello there')
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 
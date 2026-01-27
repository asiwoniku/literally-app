import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // This refreshes the session if it's expired - essential for staying logged in
  const { data: { session } } = await supabase.auth.getSession()

  // 1. If user is NOT logged in and tries to go to Feed or Studio, send them to Login
  const isProtectedPage = req.nextUrl.pathname.startsWith('/feed') || 
                          req.nextUrl.pathname.startsWith('/studio') ||
                          req.nextUrl.pathname.startsWith('/profile');

  if (!session && isProtectedPage) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 2. If user IS logged in and tries to go to Login or Signup, send them to Feed
  if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/feed', req.url))
  }

  return res
}

// This tells Next.js exactly which pages the "security guard" should watch
export const config = {
  matcher: [
    '/feed/:path*', 
    '/studio/:path*', 
    '/profile/:path*',
    '/login',
    '/signup'
  ],
    }
                                         

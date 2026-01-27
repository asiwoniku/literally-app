import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    // Connect to your Supabase project
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Exchange the temporary code for a real user session
    await supabase.auth.exchangeCodeForSession(code)
  }

  // After they are logged in, send them to the home page (dashboard)
  return NextResponse.redirect(requestUrl.origin)
}
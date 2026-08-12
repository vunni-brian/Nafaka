import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/proxy'

export async function proxy(request: NextRequest) {
  const { supabase, response } = await createClient(request)

  // Keeps the session refreshed so auth cookies stay valid
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isPublic = pathname === '/' || pathname === '/login' || pathname.startsWith('/auth/')

  if (!user && !isPublic) {
    const url = new URL('/login', request.url)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/DailySnapshot', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
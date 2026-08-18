import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/proxy'

export async function proxy(request: NextRequest) {
  const { supabase, response } = await createClient(request)

  // Keeps the session refreshed so auth cookies stay valid
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isPublic =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/Onboarding' ||
    pathname === '/privacy' ||
    pathname === '/terms' ||
    pathname.startsWith('/auth/')

  const redirectWithCookies = (url: URL) => {
    const redirect = NextResponse.redirect(url)
    for (const cookie of response.cookies.getAll()) {
      redirect.cookies.set(cookie.name, cookie.value, { ...cookie })
    }
    return redirect
  }

  if (!user && !isPublic) {
    const url = new URL('/login', request.url)
    url.searchParams.set('next', pathname)
    return redirectWithCookies(url)
  }

  if (user && pathname === '/login') {
    return redirectWithCookies(new URL('/DailySnapshot', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|\\.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
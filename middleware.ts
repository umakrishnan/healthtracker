import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  // Skip auth in local dev (no password configured)
  const expected = process.env.BASIC_AUTH_PASSWORD
  if (!expected) return NextResponse.next()

  // Public paths — always allow
  const { pathname } = req.nextUrl
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/login') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Check session cookie
  const session = req.cookies.get('ht_session')?.value
  if (session === expected) {
    return NextResponse.next()
  }

  // Not authenticated — redirect to login page
  const loginUrl = req.nextUrl.clone()
  loginUrl.pathname = '/login'
  loginUrl.search = `?next=${encodeURIComponent(pathname)}`
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

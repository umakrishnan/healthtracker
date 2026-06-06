import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  // Skip auth in local dev (no password configured)
  if (!process.env.BASIC_AUTH_PASSWORD) return NextResponse.next()

  const authHeader = req.headers.get('authorization')

  if (authHeader) {
    const base64 = authHeader.split(' ')[1] ?? ''
    const [, password] = Buffer.from(base64, 'base64').toString().split(':')
    if (password === process.env.BASIC_AUTH_PASSWORD) {
      return NextResponse.next()
    }
  }

  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Health Tracker"',
    },
  })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

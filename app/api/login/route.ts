import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  const expected = process.env.BASIC_AUTH_PASSWORD

  // If no password is configured (local dev), let everything through
  if (!expected || password === expected) {
    const res = NextResponse.json({ ok: true })
    res.cookies.set('ht_session', expected ?? 'dev', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      // 30 days
      maxAge: 60 * 60 * 24 * 30,
    })
    return res
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

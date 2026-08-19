import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request): Promise<NextResponse> {
  let body: { email?: unknown; reason?: unknown; confirmation?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const reason = typeof body.reason === 'string' ? body.reason.trim().slice(0, 1000) : ''
  const confirmation = typeof body.confirmation === 'string' ? body.confirmation.trim() : ''

  if (!emailPattern.test(email) || confirmation !== 'DELETE MY ACCOUNT') {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Account deletion endpoint is missing Supabase server credentials')
    return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/account_deletion_requests`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ email, reason: reason || null }),
    cache: 'no-store',
  })

  if (!response.ok) {
    console.error('Failed to record account deletion request', await response.text())
    return NextResponse.json({ error: 'upstream' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}

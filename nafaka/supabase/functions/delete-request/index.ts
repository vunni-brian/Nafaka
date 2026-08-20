import { withSupabase } from 'npm:@supabase/server'

export default {
  fetch: withSupabase({ auth: 'none' }, async (req, ctx) => {
    if (req.method !== 'POST') {
      return Response.json({ error: 'method_not_allowed' }, { status: 405 })
    }

    const body = await req.json().catch(() => null)
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const website = typeof body?.website === 'string' ? body.website.trim() : ''

    if (website) {
      return Response.json({ ok: true })
    }

    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'invalid_email' }, { status: 400 })
    }

    const { error } = await ctx.supabaseAdmin.from('deletion_requests').insert({ email })
    if (error) {
      return Response.json({ error: 'insert_failed' }, { status: 500 })
    }

    return Response.json({ ok: true })
  }),
}
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 204 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const phone = String(body.phone ?? '').replace(/^\+/, '')
    const message = String(body.message ?? '')

    const username = Deno.env.get('AT_USERNAME')
    const apiKey = Deno.env.get('AT_API_KEY')

    if (!phone || !message) {
      return Response.json({ success: false, error: 'missing phone or message' }, { status: 200 })
    }
    if (!username || !apiKey) {
      return Response.json(
        { success: false, error: 'AT_USERNAME or AT_API_KEY secret not configured' },
        { status: 200 },
      )
    }

    const form = new URLSearchParams({ username, to: phone, message })
    const res = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        apiKey,
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    })
    const data = await res.json().catch(() => null)

    return Response.json({ success: res.ok, at: data }, { status: 200 })
  } catch (err) {
    return Response.json({ success: false, error: String(err) }, { status: 200 })
  }
})
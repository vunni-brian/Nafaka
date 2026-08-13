import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'

const AT_USERNAME = Deno.env.get('AT_USERNAME')
const AT_API_KEY = Deno.env.get('AT_API_KEY')

const sendSms = async (to: string, message: string): Promise<Response> => {
  if (!AT_USERNAME || !AT_API_KEY) {
    return Response.json(
      { error: { http_code: 500, message: 'AT_USERNAME or AT_API_KEY secret not configured' } },
      { status: 500 },
    )
  }
  const form = new URLSearchParams({ username: AT_USERNAME, to, message })
  const res = await fetch('https://api.africastalking.com/version1/messaging', {
    method: 'POST',
    headers: {
      apiKey: AT_API_KEY,
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    return Response.json({ error: { http_code: res.status, message: JSON.stringify(data) } }, { status: 502 })
  }
  return Response.json({}, { status: 200 })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 204 })
  }

  try {
    const payload = await req.text()
    const secret = Deno.env.get('SEND_SMS_HOOK_SECRET')
    const headers = Object.fromEntries(req.headers)
    const webhook = new Webhook((secret ?? '').replace('v1,whsec_', ''))
    const { user, sms } = webhook.verify(payload, headers)

    const to = String(user.phone ?? '').replace(/^\+/, '')
    const message = `Your code is ${sms.otp}`
    if (!to || !sms.otp) {
      return Response.json({ error: { http_code: 400, message: 'missing phone or otp' } }, { status: 400 })
    }
    return await sendSms(to, message)
  } catch (err) {
    return Response.json(
      { error: { http_code: 500, message: `Failed to send sms: ${JSON.stringify(err)}` } },
      { status: 500 },
    )
  }
})
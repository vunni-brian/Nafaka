import { describe, it, expect, vi, beforeEach } from 'vitest'

function request(question: string, context = { balance: 75000 }): Request {
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    body: JSON.stringify({ question, context }),
  })
}

describe('POST /api/chat', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('answers 503 when no Gemini key is configured', async () => {
    vi.stubEnv('GEMINI_API_KEY', '')
    const { POST } = await import('./route')
    const res = await POST(request('hi'))
    expect(res.status).toBe(503)
  })

  it('rejects a missing question', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key')
    const { POST } = await import('./route')
    const res = await POST(request('   '))
    expect(res.status).toBe(400)
  })

  it('calls the Interactions API and parses the model step', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key')
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          steps: [
            { type: 'thought' },
            { type: 'model_output', content: [{ type: 'text', text: '**You can afford lunch.**' }] },
          ],
        }),
        { status: 200 },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    const { POST } = await import('./route')
    const res = await POST(request('can I afford lunch?'))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ text: 'You can afford lunch.' })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://generativelanguage.googleapis.com/v1beta/interactions')
    const body = JSON.parse(init.body)
    expect(body.model).toBe('gemini-3.1-flash-lite')
    expect(body.store).toBe(false)
    expect(body.input).toContain('can I afford lunch?')
    expect(init.headers['x-goog-api-key']).toBe('test-key')
  })

  it('falls back to 502 when Gemini errors', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('boom', { status: 429 })))
    const { POST } = await import('./route')
    const res = await POST(request('hi'))
    expect(res.status).toBe(502)
  })

  it('falls back to 502 when the model returns no text step', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ steps: [{ type: 'thought' }] }), { status: 200 })),
    )
    const { POST } = await import('./route')
    const res = await POST(request('hi'))
    expect(res.status).toBe(502)
  })
})
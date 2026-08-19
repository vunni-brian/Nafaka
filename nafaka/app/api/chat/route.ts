import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-3.1-flash-lite'

const SYSTEM_PROMPT = [
  'You are Nafaka Coach, a warm, practical financial coach for a Ugandan user. Money is in UGX (Uganda shillings).',
  'You are an AI system. Never claim or imply that you are a human, licensed financial adviser, bank employee, or other professional.',
  'You receive a JSON snapshot of the user\'s real finances followed by their question.',
  'Rules:',
  '- Answer ONLY from the snapshot. Never invent balances, amounts, dates, or trends.',
  '- If the snapshot lacks the information to answer, say what you would need and move on.',
  '- Keep replies to 2-4 short sentences, plain text. No markdown headings, no numbered lists.',
  '- Write amounts as "UGX 10,000".',
  '- Give educational guidance only. Do not present your response as financial, investment, tax, legal, lending, or regulated professional advice.',
  '- Be honest and direct, never preachy. Protect their priorities.',
].join('\n')

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^#{1,4}\s*/gm, '')
    .replace(/`/g, '')
    .trim()
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!GEMINI_API_KEY) return NextResponse.json({ error: 'no_key' }, { status: 503 })

  let body: { question?: unknown; context?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }
  const question = typeof body.question === 'string' ? body.question.slice(0, 600).trim() : ''
  if (!question) return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  const context = body.context ?? {}

  const url = 'https://generativelanguage.googleapis.com/v1beta/interactions'
  const upstream = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
    body: JSON.stringify({
      model: GEMINI_MODEL,
      input: `FINANCIAL SNAPSHOT (JSON):\n${JSON.stringify(context)}\n\nUSER QUESTION: ${question}`,
      system_instruction: SYSTEM_PROMPT,
      generation_config: { temperature: 0.4, max_output_tokens: 700 },
      store: false,
    }),
    signal: AbortSignal.timeout(25000),
  })

  if (!upstream.ok) return NextResponse.json({ error: 'upstream' }, { status: 502 })

  const data = await upstream.json()
  const modelStep = (data?.steps ?? []).findLast((s: { type?: string }) => s.type === 'model_output')
  const text = modelStep?.content?.map((p: { text?: string }) => p.text ?? '').join('').trim()
  if (!text) return NextResponse.json({ error: 'upstream' }, { status: 502 })

  return NextResponse.json({ text: stripMarkdown(text) })
}

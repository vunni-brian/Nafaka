'use client'

import React, { useState, useRef, useMemo, useEffect } from 'react'
import BottomNav from '@/components/BottomNav'
import AppHeader from '@/components/AppHeader'
import { useGoogleFont } from '@/lib/fonts'
import { useFinance } from '@/lib/store'
import { Sparkles, Send, User } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { storeTransactionsToBrain } from '@/lib/brain/adapters'
import { answerQuestion, buildGreeting, type ChatContext, type ChatReply } from '@/lib/brain/chat'
import { buildLlmContext } from '@/lib/brain/llm'
import { stateLabel } from '@/lib/brain/describe'
import { ConfidenceBar } from '@/components/proto/ui'
import { track } from '@/lib/analytics'

interface Message {
  id: number
  role: 'user' | 'ai'
  text: string
  chart?: { day: string; amount: number }[]
}

const chartConfig = {
  amount: { label: 'Spent', color: '#19bd80' },
} satisfies ChartConfig

const suggestions = [
  'Can I afford this today?',
  'Why is my safe-to-spend this amount?',
  'What happens next?',
  'When will I likely get paid next?',
  'How is my Cell reliability doing?',
]

export default function AIChat() {
  const body = useGoogleFont('Manrope')
  const { profile, balance, safeToSpend, upcomingTotal, shortfall, behaviorModel, transactions, commitments, decisionLog, predictions, lastCoachingOutcome } = useFinance()

  const ctx = useMemo<ChatContext>(
    () => ({
      name: profile.name,
      balance,
      safeToSpend,
      upcomingTotal,
      shortfall,
      model: behaviorModel,
      transactions: storeTransactionsToBrain(transactions),
      decisionLog,
      predictions,
      latestOutcome: lastCoachingOutcome,
    }),
    [profile.name, balance, safeToSpend, upcomingTotal, shortfall, behaviorModel, transactions, decisionLog, predictions, lastCoachingOutcome],
  )

  const [messages, setMessages] = useState<Message[]>(() => [
    { id: 1, role: 'ai', text: buildGreeting(ctx) },
    { id: 2, role: 'user', text: 'Can I afford to buy data worth 10,000 today?' },
    { id: 3, role: 'ai', text: answerQuestion('Can I afford to buy data worth 10,000 today?', ctx).text },
  ])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const busy = useRef(false)
  const nextId = useRef(4)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pending])

  const send = (text: string, source: 'chip' | 'typed' = 'typed') => {
    const question = text.trim()
    if (!question || busy.current) return
    busy.current = true
    setPending(true)
    track('chat_message_sent', { source })
    const id = nextId.current++
    setMessages((prev) => [...prev, { id, role: 'user', text: question }])
    setInput('')

    const answer = async (reply: ChatReply, delay = 0) => {
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay))
      const aiId = nextId.current++
      setMessages((prev) => [
        ...prev,
        {
          id: aiId,
          role: 'ai',
          text: reply.text,
          ...(reply.chart ? { chart: reply.chart } : {}),
        },
      ])
      setPending(false)
      busy.current = false
    }

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, context: buildLlmContext(ctx, commitments) }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('upstream')
        const data = await res.json()
        if (!data.text) throw new Error('empty')
        track('chat_llm_reply')
        await answer({ text: data.text })
      })
      .catch(() => answer(answerQuestion(question, ctx), 600))
  }

  return (
    <div className="min-h-screen bg-background pb-28 flex flex-col" style={{ fontFamily: body }}>
      <AppHeader />
      <main className="mx-auto max-w-md w-full px-5 pt-4 flex-1 flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-ink-100">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Sparkles size={18} />
            </span>
            <div>
              <p className="font-display text-base font-semibold text-ink-900">Nafaka AI</p>
              <p className="text-[11px] text-ink-500">
                Behavioral coaching · {Math.round(behaviorModel.confidence * 100)}% confidence
              </p>
            </div>
          </div>
          <ConfidenceBar value={Math.round(behaviorModel.confidence * 100)} />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  m.role === 'user' ? 'bg-ink-900 text-white' : 'bg-brand-600 text-white'
                }`}
              >
                {m.role === 'user' ? <User size={15} /> : <Sparkles size={15} />}
              </span>
              <div
                className={`max-w-[78%] rounded-[1.25rem] px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user' ? 'bg-ink-900 text-white' : 'bg-white border border-ink-100 text-ink-800 shadow-card'
                }`}
              >
                <p>{m.text}</p>
                {m.chart && (
                  <div className="mt-3 -mx-1">
                    <ChartContainer config={chartConfig} className="h-32 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={m.chart} margin={{ left: -20 }}>
                          <CartesianGrid vertical={false} stroke="#eceef2" />
                          <XAxis
                            dataKey="day"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: '#65718a', fontSize: 10 }}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="amount" radius={[4, 4, 0, 0]} fill="var(--color-amount)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                )}
              </div>
            </div>
          ))}
          {pending && (
            <div className="flex gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Sparkles size={15} />
              </span>
              <div className="bg-white border border-ink-100 rounded-[1.25rem] px-4 py-3 shadow-card">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-ink-300 animate-pulse-soft" />
                  <span className="h-1.5 w-1.5 rounded-full bg-ink-300 animate-pulse-soft" style={{ animationDelay: '0.2s' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-ink-300 animate-pulse-soft" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 3 && (
          <div className="pb-3">
            <p className="text-xs font-medium text-ink-500 mb-2">Try asking</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s, 'chip')}
                  className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-brand-400 hover:text-brand-700 transition cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
          className="flex items-center gap-2 pt-2 border-t border-ink-100"
        >
          <input
            className="flex-1 rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            placeholder="Ask about your money behavior..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="Ask about your money behavior"
          />
          <button
            type="submit"
            disabled={!input.trim() || pending}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-40 active:scale-95 cursor-pointer"
            aria-label="Send message"
          >
            <Send size={17} />
          </button>
        </form>

        <p className="text-[11px] text-ink-400 mt-3 text-center">
          Currently {stateLabel(behaviorModel.state)} · {formatDistance(behaviorModel.stateDetail.runwayDays)} runway · {Math.round(behaviorModel.confidence * 100)}% confidence
        </p>
      </main>

      <BottomNav active="chat" />
    </div>
  )
}

function formatDistance(runwayDays: number): string {
  if (!Number.isFinite(runwayDays) || runwayDays >= 999) return 'long runway'
  return `${Math.round(runwayDays)}-day runway`
}
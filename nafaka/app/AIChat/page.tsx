'use client'

import React, { useState, useRef, useMemo } from 'react'
import BottomNav from '@/components/BottomNav'
import { useGoogleFont } from '@/lib/fonts'
import { useFinance } from '@/lib/store'
import { Sparkles, Send, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { storeTransactionsToBrain } from '@/lib/brain/adapters'
import { answerQuestion, buildGreeting, type ChatContext, type ChatReply } from '@/lib/brain/chat'
import { stateLabel } from '@/lib/brain/describe'
import { track } from '@/lib/analytics'

interface Message {
  id: number
  role: 'user' | 'ai'
  text: string
  chart?: { day: string; amount: number }[]
}

const chartConfig = {
  amount: { label: 'Spent', color: 'var(--color-primary)' },
} satisfies ChartConfig

const suggestions = [
  'Can I afford this today?',
  'Why did I overspend on Sunday?',
  'When will I likely get paid next?',
  'How is my Cell reliability doing?',
]

export default function AIChat() {
  const display = useGoogleFont('Fraunces')
  const body = useGoogleFont('Manrope')
  const { profile, balance, safeToSpend, upcomingTotal, shortfall, behaviorModel, transactions } = useFinance()

  const ctx = useMemo<ChatContext>(
    () => ({
      name: profile.name,
      balance,
      safeToSpend,
      upcomingTotal,
      shortfall,
      model: behaviorModel,
      transactions: storeTransactionsToBrain(transactions),
    }),
    [profile.name, balance, safeToSpend, upcomingTotal, shortfall, behaviorModel, transactions],
  )

  const [messages, setMessages] = useState<Message[]>(() => [
    { id: 1, role: 'ai', text: buildGreeting(ctx) },
    { id: 2, role: 'user', text: 'Can I afford to buy data worth 10,000 today?' },
    { id: 3, role: 'ai', text: answerQuestion('Can I afford to buy data worth 10,000 today?', ctx).text },
  ])
  const [input, setInput] = useState('')
  const nextId = useRef(4)

  const send = (text: string, source: 'chip' | 'typed' = 'typed') => {
    if (!text.trim()) return
    track('chat_message_sent', { source })
    const id = nextId.current++
    const userMsg: Message = { id, role: 'user', text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setTimeout(() => {
      const reply: ChatReply = answerQuestion(text, ctx)
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
    }, 600)
  }

  return (
    <div className="min-h-screen bg-background pb-32 flex flex-col" style={{ fontFamily: body }}>
      <div className="max-w-sm mx-auto w-full px-6 pt-10 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/DailySnapshot"
            className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors shrink-0"
            aria-label="Back to home"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-0.5">Layer 1 · Record</p>
            <h1 style={{ fontFamily: display }} className="text-xl text-foreground leading-tight">
              Ask your coach
            </h1>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4 mb-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'ai' && (
                <span className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-primary shrink-0 mr-2 mt-0.5">
                  <Sparkles size={13} />
                </span>
              )}
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-card border border-border text-foreground rounded-bl-sm'
                }`}
              >
                {m.text}
                {m.chart && (
                  <div className="mt-3 -mx-1">
                    <ChartContainer config={chartConfig} className="h-32 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={m.chart} margin={{ left: -20 }}>
                          <CartesianGrid vertical={false} stroke="var(--color-border)" />
                          <XAxis
                            dataKey="day"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }}
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
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-hide">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s, 'chip')}
              className="shrink-0 text-xs font-medium text-foreground bg-accent/50 border border-border rounded-full px-3.5 py-2 hover:bg-accent transition-colors cursor-pointer whitespace-nowrap"
            >
              {s}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
          className="flex items-center gap-2 bg-card border border-border rounded-2xl px-3 py-2 mt-1"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your money..."
            aria-label="Ask about your money"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none py-1.5"
          />
          <button
            type="submit"
            className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer shrink-0"
            aria-label="Send message"
          >
            <Send size={15} />
          </button>
        </form>

        <p className="text-[11px] text-muted-foreground mt-3 text-center">
          Currently {stateLabel(behaviorModel.state)} · {formatDistance(behaviorModel.stateDetail.runwayDays)} runway · {Math.round(behaviorModel.confidence * 100)}% confidence
        </p>
      </div>

      <BottomNav active="chat" />
    </div>
  )
}

function formatDistance(runwayDays: number): string {
  if (!Number.isFinite(runwayDays) || runwayDays >= 999) return 'long runway'
  return `${Math.round(runwayDays)}-day runway`
}
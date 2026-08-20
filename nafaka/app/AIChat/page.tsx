'use client'

import React, { useState, useRef, useMemo, useEffect } from 'react'
import BottomNav from '@/components/BottomNav'
import AppHeader from '@/components/AppHeader'
import { useGoogleFont } from '@/lib/fonts'
import { useFinance } from '@/lib/store'
import { createClient } from '@/utils/supabase/client'
import { Sparkles, Send, User, Flag, WifiOff } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { storeTransactionsToBrain } from '@/lib/brain/adapters'
import { answerQuestion, buildGreeting, type ChatContext, type ChatReply } from '@/lib/brain/chat'
import { buildLlmContext } from '@/lib/brain/llm'
import { ConfidenceBar } from '@/components/proto/ui'
import { useToast } from '@/components/Toast'
import { track } from '@/lib/analytics'

interface Message {
  id: number
  role: 'user' | 'ai'
  text: string
  ts: string
  chart?: { day: string; amount: number }[]
}

const reportReasons = ['Harmful or offensive', 'Misleading financial advice', 'Inaccurate or wrong', 'Spam', 'Other']

function now() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
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
  const toast = useToast()

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
    { id: 1, role: 'ai', text: buildGreeting(ctx), ts: now() },
  ])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [offlineMode, setOfflineMode] = useState(false)
  const [reporting, setReporting] = useState<Message | null>(null)
  const [reported, setReported] = useState<Set<number>>(new Set())
  const busy = useRef(false)
  const nextId = useRef(4)
  const endRef = useRef<HTMLDivElement>(null)
  const reportRef = useRef<HTMLDivElement>(null)

  const submitReport = async (reason: string) => {
    if (!reporting) return
    const message = reporting
    setReporting(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('ai_reports').insert({ user_id: user.id, message: message.text, reason })
        toast.show('success', 'Report submitted — thanks for the feedback.')
      }
      track('ai_response_reported', { reason })
    } catch {
      track('ai_response_reported', { reason })
    }
    setReported((prev) => new Set(prev).add(message.id))
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pending])

  useEffect(() => {
    if (!reporting) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    reportRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setReporting(null)
        return
      }
      if (e.key === 'Tab' && reportRef.current) {
        const focusables = reportRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        )
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      previouslyFocused?.focus?.()
    }
  }, [reporting])

  const send = (text: string, source: 'chip' | 'typed' = 'typed') => {
    const question = text.trim()
    if (!question || busy.current) return
    busy.current = true
    setPending(true)
    track('chat_message_sent', { source })
    const id = nextId.current++
    setMessages((prev) => [...prev, { id, role: 'user', text: question, ts: now() }])
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
          ts: now(),
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
        setOfflineMode(false)
        await answer({ text: data.text })
      })
      .catch(() => {
        setOfflineMode(true)
        answer(answerQuestion(question, ctx), 600)
      })
  }

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-10 md:pl-64 flex flex-col" style={{ fontFamily: body }}>
      <AppHeader />
      <main id="main" className="mx-auto w-full max-w-md px-5 pt-4 md:max-w-4xl md:px-10 flex-1 flex flex-col animate-fade-in">
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
        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-3 md:flex md:gap-8 md:items-start">
            <div className="md:flex-1 md:min-w-0 space-y-3">
          {offlineMode && (
            <div
              role="status"
              className="flex items-start gap-2 rounded-xl border border-accent-200 bg-accent-50 px-3.5 py-2.5 text-xs text-accent-700"
            >
              <WifiOff size={14} className="shrink-0 mt-0.5" />
              <span>
                Offline mode — answers come from your local data until the connection recovers.
              </span>
            </div>
          )}
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
                className={`max-w-[78%] rounded-xl2 px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user' ? 'bg-ink-900 text-white' : 'bg-white border border-ink-100 text-ink-800 shadow-card'
                }`}
              >
                <p>{m.text}</p>
                {m.chart && (
                  <div className="mt-3 -mx-1" role="img" aria-label={`Chart: ${m.chart.map((d) => `${d.day}: ${d.amount.toLocaleString()}`).join(', ')}`}>
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
                <p className={`text-[10px] mt-1.5 ${m.role === 'user' ? 'text-white/50' : 'text-ink-400'}`}>{m.ts}</p>
                {m.role === 'ai' && (
                  <div className="flex items-center justify-end mt-1">
                    {reported.has(m.id) ? (
                      <span className="text-[10px] text-ink-400">Reported</span>
                    ) : (
                      <button
                        onClick={() => setReporting(m)}
                        className="flex items-center gap-1 text-[10px] text-ink-400 hover:text-red-500 transition-colors cursor-pointer"
                        aria-label="Report this response"
                      >
                        <Flag size={11} />
                        Report
                      </button>
                    )}
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
              <div className="bg-white border border-ink-100 rounded-xl2 px-4 py-3 shadow-card">
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

            {/* Desktop suggestion rail */}
            <aside className="hidden md:block md:w-60 shrink-0" aria-label="Suggested questions">
              <div className="card p-4">
                <p className="text-xs font-medium text-ink-500 mb-2">Try asking</p>
                <div className="flex flex-col gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s, 'chip')}
                      className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-left text-xs font-medium text-ink-700 hover:border-brand-400 hover:text-brand-700 transition cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Suggestions */}
        {messages.length <= 2 && (
          <div className="pb-3 md:hidden">
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
            className="flex-1 rounded-xl border border-ink-200 bg-white px-4 py-3 text-base outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 sm:text-sm"
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
          Nafaka AI is experimental and educational — not financial advice.
        </p>
      </main>

      {reporting && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Report response">
          <div
            ref={reportRef}
            tabIndex={-1}
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl outline-none"
          >
            <h2 className="font-display text-base font-semibold text-ink-900 mb-1">Report this response</h2>
            <p className="text-xs text-ink-500 mb-4">
              Tell us why. Reports help us keep Nafaka AI safe and accurate.
            </p>
            <div className="space-y-2">
              {reportReasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => submitReport(reason)}
                  className="w-full cursor-pointer rounded-xl border border-ink-200 px-4 py-2.5 text-sm text-ink-800 text-left hover:border-brand-500 hover:bg-brand-50 transition-colors"
                >
                  {reason}
                </button>
              ))}
            </div>
            <button
              onClick={() => setReporting(null)}
              className="mt-3 w-full cursor-pointer text-center text-xs text-ink-500 hover:text-ink-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <BottomNav active="chat" />
    </div>
  )
}
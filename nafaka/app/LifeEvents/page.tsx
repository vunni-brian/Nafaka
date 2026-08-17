'use client'

import React, { useState } from 'react'
import BottomNav from '@/components/BottomNav'
import AppHeader from '@/components/AppHeader'
import { useGoogleFont } from '@/lib/fonts'
import { useFinance } from '@/lib/store'
import { CalendarClock, GraduationCap, PartyPopper, Coins, Briefcase, Plus, X, Check, CheckCheck, XCircle } from 'lucide-react'
import { SectionTitle, StatPill } from '@/components/proto/ui'
import { fmt } from '@/components/proto/format'

const typeIcon = {
  income: Coins,
  expense: CalendarClock,
  milestone: PartyPopper,
}

const toneStyles = {
  positive: { ring: 'bg-brand-100 text-brand-700', pill: 'positive' as const },
  watch: { ring: 'bg-accent-100 text-accent-700', pill: 'watch' as const },
  neutral: { ring: 'bg-ink-100 text-ink-600', pill: 'neutral' as const },
}

export default function LifeEvents() {
  const body = useGoogleFont('Manrope')
  const { commitments, addCommitment, setCommitmentStatus } = useFinance()

  const [showForm, setShowForm] = useState(false)
  const [label, setLabel] = useState('')
  const [when, setWhen] = useState('')
  const [amount, setAmount] = useState('')

  const canAdd = label.trim().length > 0 && when.trim().length > 0 && amount.trim().length > 0

  const handleAdd = () => {
    if (!canAdd) return
    addCommitment(label.trim(), when.trim(), Number(amount))
    setLabel('')
    setWhen('')
    setAmount('')
    setShowForm(false)
  }

  const next = commitments.find((c) => c.status === 'upcoming')

  const events = commitments.map((c) => {
    if (c.status === 'fulfilled') {
      return { ...c, type: 'expense' as const, tone: 'positive' as const, impact: 'Paid' }
    }
    if (c.status === 'missed') {
      return { ...c, type: 'expense' as const, tone: 'watch' as const, impact: 'Missed' }
    }
    return { ...c, type: 'expense' as const, tone: 'neutral' as const, impact: 'Upcoming' }
  })

  return (
    <div className="min-h-screen bg-ink-50 pb-28" style={{ fontFamily: body }}>
      <AppHeader />
      <main className="mx-auto max-w-md px-5 pt-4 space-y-6 animate-fade-up">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Life Events</h1>
          <p className="text-sm text-ink-500 mt-1">
            Nafaka factors real-life events into your behavior &mdash; so context is never mistaken for bad habits.
          </p>
        </div>

        {next && (
          <div className="card p-4 bg-gradient-to-br from-brand-50 to-white">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
                <GraduationCap size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-900">{next.label} coming up</p>
                <p className="text-xs text-ink-500">{next.when} &middot; {fmt(next.amount)}</p>
              </div>
            </div>
            <p className="text-xs text-ink-600 mt-3 leading-relaxed">
              Nafaka will mark that week&rsquo;s spending spike as expected, not as overspending. No guilt, just planning.
            </p>
          </div>
        )}

        <div>
          <SectionTitle title="Upcoming events" hint={`${commitments.length} tracked`} />
          <div className="space-y-3">
            {events.map((e) => {
              const Icon = typeIcon[e.type] ?? Briefcase
              const t = toneStyles[e.tone]
              return (
                <div key={e.id} className="card p-4">
                  <div className="flex items-start gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.ring}`}>
                      <Icon size={18} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-ink-900">{e.label}</p>
                        <StatPill tone={t.pill}>{e.impact}</StatPill>
                      </div>
                      <p className="text-xs text-ink-500 mt-1">{e.when} &middot; {fmt(e.amount)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-ink-100">
                    <button
                      onClick={() => setCommitmentStatus(e.id, e.status === 'fulfilled' ? 'upcoming' : 'fulfilled')}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition ${
                        e.status === 'fulfilled' ? 'bg-brand-600 text-white' : 'border border-brand-200 text-brand-700 hover:bg-brand-50'
                      }`}
                    >
                      <CheckCheck size={13} />
                      {e.status === 'fulfilled' ? 'Fulfilled' : 'Mark paid'}
                    </button>
                    <button
                      onClick={() => setCommitmentStatus(e.id, e.status === 'missed' ? 'upcoming' : 'missed')}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition ${
                        e.status === 'missed' ? 'bg-accent-600 text-white' : 'border border-accent-200 text-accent-700 hover:bg-accent-50'
                      }`}
                    >
                      <XCircle size={13} />
                      {e.status === 'missed' ? 'Missed' : 'Mark missed'}
                    </button>
                  </div>
                </div>
              )
            })}
            {commitments.length === 0 && (
              <div className="card p-8 text-center">
                <CalendarClock size={22} className="text-ink-400 mx-auto mb-3" />
                <p className="text-sm text-ink-500">No commitments yet</p>
                <p className="text-xs text-ink-400 mt-1">Add your first life event below</p>
              </div>
            )}
          </div>
        </div>

        {showForm ? (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-base font-semibold text-ink-900">Add a life event</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-ink-500 hover:text-ink-800 transition"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="What is it? e.g. School fees"
                className="input"
              />
              <input
                type="text"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                placeholder="When? e.g. In 5 days"
                className="input"
              />
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Amount (UGX)"
                className="input"
              />
              <button
                disabled={!canAdd}
                onClick={handleAdd}
                className={`btn-primary w-full ${!canAdd ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Check size={15} />
                Add commitment
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowForm(true)} className="btn-ghost w-full">
            <Plus size={16} /> Add a life event
          </button>
        )}
      </main>

      <BottomNav active="home" />
    </div>
  )
}
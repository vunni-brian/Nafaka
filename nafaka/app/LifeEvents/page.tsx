'use client'

import React, { useState } from 'react'
import BottomNav from '@/components/BottomNav'
import AppHeader from '@/components/AppHeader'
import { useGoogleFont } from '@/lib/fonts'
import { useFinance } from '@/lib/store'
import { Church, Users, Landmark, Home as HomeIcon, Plus, X, Check, CalendarClock, GraduationCap } from 'lucide-react'
import { SectionTitle, StatPill } from '@/components/proto/ui'

const iconMap: Record<string, typeof Church> = {
  cell: Users,
  church: Church,
  rent: HomeIcon,
  debt: Landmark,
}

function pickIcon(label: string) {
  const lower = label.toLowerCase()
  if (lower.includes('cell')) return iconMap.cell
  if (lower.includes('tithe') || lower.includes('offering') || lower.includes('church')) return iconMap.church
  if (lower.includes('rent')) return iconMap.rent
  if (lower.includes('debt') || lower.includes('repayment')) return iconMap.debt
  return Landmark
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

  return (
    <div className="min-h-screen bg-background pb-28" style={{ fontFamily: body }}>
      <AppHeader />
      <main className="mx-auto max-w-md px-5 pt-4 space-y-6 animate-fade-up">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Life Events</h1>
          <p className="text-sm text-ink-500 mt-1">
            Nafaka factors real-life events into your behavior — so context is never mistaken for bad habits.
          </p>
        </div>

        <div className="card p-4 bg-gradient-to-br from-brand-50 to-white">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
              <GraduationCap size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink-900">Commitments come first</p>
              <p className="text-xs text-ink-500">Protected before we calculate safe-to-spend</p>
            </div>
          </div>
          <p className="text-xs text-ink-600 mt-3 leading-relaxed">
            Mark what you&rsquo;ve followed through on — it&rsquo;s how Nafaka learns your commitment reliability.
          </p>
        </div>

        <div>
          <SectionTitle title="Upcoming events" hint={`${commitments.length} tracked`} />
          {commitments.length > 0 ? (
            <div className="space-y-3">
              {commitments.map(({ id, label: l, when: w, amount: a, status }) => {
                const Icon = pickIcon(l)
                const done = status === 'fulfilled'
                const missed = status === 'missed'
                return (
                  <div key={id} className="card p-4">
                    <div className="flex items-start gap-3">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          done ? 'bg-brand-100 text-brand-700' : missed ? 'bg-accent-100 text-accent-700' : 'bg-ink-100 text-ink-600'
                        }`}
                      >
                        <Icon size={18} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-ink-900">{l}</p>
                          {done && <StatPill tone="positive">Paid</StatPill>}
                          {missed && <StatPill tone="watch">Missed</StatPill>}
                          {!done && !missed && <StatPill tone="neutral">{status}</StatPill>}
                        </div>
                        <p className="text-xs text-ink-500 mt-1">{w}</p>
                        <p className="text-sm font-bold text-ink-900 mt-1.5">UGX {a.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-ink-100">
                      <button
                        onClick={() => setCommitmentStatus(id, done ? 'upcoming' : 'fulfilled')}
                        className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition ${
                          done ? 'bg-brand-600 text-white' : 'border border-brand-200 text-brand-700 hover:bg-brand-50'
                        }`}
                      >
                        <Check size={13} />
                        {done ? 'Fulfilled' : 'Mark paid'}
                      </button>
                      <button
                        onClick={() => setCommitmentStatus(id, missed ? 'upcoming' : 'missed')}
                        className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition ${
                          missed ? 'bg-accent-600 text-white' : 'border border-accent-200 text-accent-700 hover:bg-accent-50'
                        }`}
                      >
                        <X size={13} />
                        {missed ? 'Missed' : 'Mark missed'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <CalendarClock size={22} className="text-ink-400 mx-auto mb-3" />
              <p className="text-sm text-ink-500">No commitments yet</p>
              <p className="text-xs text-ink-400 mt-1">Add your first one below</p>
            </div>
          )}
        </div>

        {showForm ? (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-base font-semibold text-ink-900">New commitment</h2>
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
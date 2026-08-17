'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useGoogleFont } from '@/lib/fonts'
import { useFinance } from '@/lib/store'
import { track } from '@/lib/analytics'
import AppHeader from '@/components/AppHeader'
import { Laptop, Users, Landmark, Gift, Check, ArrowLeft } from 'lucide-react'

const sources = [
  { key: 'freelance', label: 'Freelance', icon: Laptop },
  { key: 'family', label: 'Family', icon: Users },
  { key: 'business', label: 'Business', icon: Landmark },
  { key: 'gift', label: 'Gift', icon: Gift },
] as const

export default function AddIncome() {
  const display = useGoogleFont('Fraunces')
  const body = useGoogleFont('Manrope')
  const { addIncome } = useFinance()

  const [amount, setAmount] = useState('')
  const [source, setSource] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)

  const canSave = amount.trim().length > 0 && source !== null

  const handleSave = () => {
    if (!canSave) return
    track('income_added', { amount: Number(amount), source })
    addIncome(Number(amount), sources.find((s) => s.key === source)?.label ?? 'Unknown', note)
    setSaved(true)
  }

  if (saved) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5" style={{ fontFamily: body }}>
        <div className="w-full max-w-md mx-auto flex flex-col items-center text-center animate-fade-up">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-700 mb-6">
            <Check size={28} />
          </div>
          <h1 style={{ fontFamily: display }} className="font-display text-2xl font-semibold text-ink-900 mb-2">
            Income recorded
          </h1>
          <p className="text-sm text-ink-500 mb-8 max-w-[28ch] leading-relaxed">
            UGX {Number(amount || 0).toLocaleString()} from {sources.find((s) => s.key === source)?.label ?? 'unknown'} has
            been added to your balance.
          </p>
          <div className="card p-5 text-left w-full mb-8 bg-brand-50 border-brand-100">
            <p className="text-xs font-semibold text-brand-700 uppercase tracking-wide mb-1.5">Updated insight</p>
            <p className="text-sm text-ink-700 leading-relaxed">
              This bumps your safe-to-spend for today. We&rsquo;ve kept your commitments protected first.
            </p>
          </div>
          <Link
            href="/DailySnapshot"
            className="btn-primary w-full"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: body }}>
      <AppHeader />
      <main className="mx-auto max-w-md px-5 pt-4 pb-10 space-y-6 animate-fade-up">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Add income</h1>
          <p className="text-sm text-ink-500 mt-1">Every income record makes Nafaka&rsquo;s rhythm read more accurate.</p>
        </div>

        <div className="card p-6">
          <label className="text-xs font-semibold text-ink-400 uppercase tracking-wide">Amount received</label>
          <div className="flex items-baseline gap-2 mt-3">
            <span style={{ fontFamily: display }} className="text-3xl font-semibold text-ink-900">
              UGX
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="0"
              autoFocus
              className="flex-1 bg-transparent text-3xl outline-none text-ink-900 placeholder:text-ink-300"
              style={{ fontFamily: display }}
            />
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-ink-900 mb-3">Where did it come from?</h2>
          <div className="grid grid-cols-2 gap-3">
            {sources.map(({ key, label, icon: Icon }) => {
              const isActive = source === key
              return (
                <button
                  key={key}
                  onClick={() => setSource(key)}
                  className={`rounded-[1.25rem] border p-4 flex flex-col items-start gap-2.5 text-left transition ${
                    isActive ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'card hover:bg-ink-50'
                  }`}
                >
                  <Icon size={19} className={isActive ? 'text-brand-700' : 'text-ink-400'} />
                  <span className={`text-sm font-medium ${isActive ? 'text-brand-800' : 'text-ink-900'}`}>{label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-ink-900 mb-3">Note (optional)</h2>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Logo design for a client"
            className="input"
          />
        </div>

        <button
          disabled={!canSave}
          onClick={handleSave}
          className={`btn-primary w-full ${!canSave ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Check size={15} />
          Save income
        </button>
      </main>
    </div>
  )
}
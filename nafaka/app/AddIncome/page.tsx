'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useGoogleFont } from '@/lib/fonts'
import { useFinance } from '@/lib/store'
import { track } from '@/lib/analytics'
import { ChevronLeft, Laptop, Users, Landmark, Gift, Check } from 'lucide-react'

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
      <div className="min-h-screen bg-background flex items-center justify-center" style={{ fontFamily: body }}>
        <div className="max-w-sm w-full mx-auto px-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-secondary/15 flex items-center justify-center mb-6">
            <Check size={28} className="text-secondary" />
          </div>
          <h1 style={{ fontFamily: display }} className="text-2xl text-foreground mb-2">
            Income recorded
          </h1>
          <p className="text-sm text-muted-foreground mb-8 max-w-[28ch]">
            UGX {Number(amount || 0).toLocaleString()} from {sources.find((s) => s.key === source)?.label ?? 'unknown'} has
            been added to your balance.
          </p>
          <div className="bg-accent/50 border border-border rounded-2xl p-5 text-left w-full mb-8">
            <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1.5">Updated insight</p>
            <p className="text-sm text-foreground leading-relaxed">
              This bumps your safe-to-spend for today. We&rsquo;ve kept your Cell and offering commitments protected first.
            </p>
          </div>
          <Link
            href="/DailySnapshot"
            className="cursor-pointer w-full flex items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold py-4 text-base hover:bg-primary/90 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: body }}>
      <div className="max-w-sm mx-auto min-h-screen flex flex-col px-6 pt-8 pb-10">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/DailySnapshot"
            className="cursor-pointer w-9 h-9 rounded-full flex items-center justify-center border border-border text-foreground hover:bg-muted transition-colors"
            aria-label="Back"
          >
            <ChevronLeft size={18} />
          </Link>
          <h1 style={{ fontFamily: display }} className="text-lg text-foreground">
            Add income
          </h1>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Amount received</label>
          <div className="flex items-baseline gap-2 mt-3">
            <span style={{ fontFamily: display }} className="text-3xl text-foreground">
              UGX
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="0"
              autoFocus
              className="flex-1 bg-transparent text-3xl outline-none text-foreground placeholder:text-muted-foreground"
              style={{ fontFamily: display }}
            />
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">Where did it come from?</h2>
          <div className="grid grid-cols-2 gap-3">
            {sources.map(({ key, label, icon: Icon }) => {
              const isActive = source === key
              return (
                <button
                  key={key}
                  onClick={() => setSource(key)}
                  className={`cursor-pointer rounded-2xl border p-4 flex flex-col items-start gap-2.5 text-left transition-colors ${
                    isActive ? 'border-secondary bg-secondary/10' : 'border-border bg-card hover:bg-muted'
                  }`}
                >
                  <Icon size={19} className={isActive ? 'text-secondary' : 'text-muted-foreground'} />
                  <span className="text-sm font-medium text-foreground">{label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-semibold text-foreground mb-3">Note (optional)</h2>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Logo design for a client"
            className="w-full bg-card border border-border rounded-2xl px-4 py-3.5 text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground transition-colors"
          />
        </div>

        <div className="mt-auto">
          <button
            disabled={!canSave}
            onClick={handleSave}
            className={`cursor-pointer w-full rounded-full py-4 text-base font-semibold transition-colors ${
              canSave
                ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            Save income
          </button>
        </div>
      </div>
    </div>
  )
}

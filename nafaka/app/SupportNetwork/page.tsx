'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import { useGoogleFont } from '@/lib/fonts'
import { useFinance } from '@/lib/store'
import { ChevronLeft, ArrowDownLeft, ArrowUpRight, Plus, X, Check, Users2 } from 'lucide-react'

type Direction = 'lent' | 'borrowed'

export default function SupportNetwork() {
  const display = useGoogleFont('Fraunces')
  const body = useGoogleFont('Manrope')
  const { network, addNetworkEntry } = useFinance()

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [direction, setDirection] = useState<Direction>('lent')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  const canAdd = name.trim().length > 0 && amount.trim().length > 0

  const totalOwedToYou = network.reduce((sum, p) => (p.balance > 0 ? sum + p.balance : sum), 0)
  const totalYouOwe = network.reduce((sum, p) => (p.balance < 0 ? sum + Math.abs(p.balance) : sum), 0)

  function fmt(n: number) { return `UGX ${Math.abs(n).toLocaleString()}` }

  const handleAdd = () => {
    if (!canAdd) return
    addNetworkEntry(name.trim(), 'Contact', direction, Number(amount))
    setName('')
    setAmount('')
    setNote('')
    setDirection('lent')
    setShowForm(false)
  }

  return (
    <div className="min-h-screen bg-background pb-32" style={{ fontFamily: body }}>
      <div className="max-w-sm mx-auto px-6 pt-8">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/DailySnapshot"
            className="cursor-pointer w-9 h-9 rounded-full flex items-center justify-center border border-border text-foreground hover:bg-muted transition-colors"
            aria-label="Back"
          >
            <ChevronLeft size={18} />
          </Link>
          <h1 style={{ fontFamily: display }} className="text-lg text-foreground">
            Support network
          </h1>
        </div>

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Money moves between people who care about each other. Keeping track helps without keeping score.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                <ArrowDownLeft size={14} className="text-secondary" />
              </span>
              <p className="text-xs text-muted-foreground">Owed to you</p>
            </div>
            <p style={{ fontFamily: display }} className="text-xl text-foreground">
              {fmt(totalOwedToYou)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                <ArrowUpRight size={14} className="text-primary" />
              </span>
              <p className="text-xs text-muted-foreground">You owe</p>
            </div>
            <p style={{ fontFamily: display }} className="text-xl text-foreground">
              {fmt(totalYouOwe)}
            </p>
          </div>
        </div>

        <h2 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground mb-3">People</h2>
        {network.length > 0 ? (
          <div className="space-y-2.5 mb-6">
            {network.map((p) => (
              <div key={p.id} className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3.5">
                <span className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-semibold text-foreground">
                  {p.initials}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.relationship} &middot; {p.lastEntry}</p>
                </div>
                <p className={`text-sm font-semibold ${p.balance >= 0 ? 'text-secondary' : 'text-primary'}`}>
                  {p.balance >= 0 ? '+' : '-'}{fmt(p.balance)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 border border-dashed border-border rounded-2xl mb-6">
            <Users2 size={22} className="text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No one in your network yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Log a give or borrow below</p>
          </div>
        )}

        {showForm ? (
          <div className="bg-card border border-border rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">Log an exchange</h2>
              <button
                onClick={() => setShowForm(false)}
                className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex bg-muted rounded-full p-1 mb-3">
              <button
                onClick={() => setDirection('lent')}
                className={`cursor-pointer flex-1 rounded-full py-2 text-xs font-semibold transition-colors ${
                  direction === 'lent' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                I gave / lent
              </button>
              <button
                onClick={() => setDirection('borrowed')}
                className={`cursor-pointer flex-1 rounded-full py-2 text-xs font-semibold transition-colors ${
                  direction === 'borrowed' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                I borrowed
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Who&rsquo;s this with? e.g. Aunt Grace"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground transition-colors"
              />
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Amount (UGX)"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground transition-colors"
              />
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note (optional)"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground transition-colors"
              />
              <button
                disabled={!canAdd}
                onClick={handleAdd}
                className={`cursor-pointer w-full flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold transition-colors ${
                  canAdd
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                <Check size={15} />
                Save entry
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="cursor-pointer w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-4 text-sm font-semibold text-primary hover:bg-muted transition-colors"
          >
            <Plus size={16} />
            Log a give or borrow
          </button>
        )}
      </div>

      <BottomNav active="home" />
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import BottomNav from '@/components/BottomNav'
import AppHeader from '@/components/AppHeader'
import { useGoogleFont } from '@/lib/fonts'
import { useFinance } from '@/lib/store'
import { ArrowDownLeft, ArrowUpRight, Plus, X, Check, HeartHandshake } from 'lucide-react'
import { SectionTitle } from '@/components/proto/ui'

type Direction = 'lent' | 'borrowed'

export default function SupportNetwork() {
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
    <div className="min-h-screen bg-background pb-28" style={{ fontFamily: body }}>
      <AppHeader />
      <main className="mx-auto max-w-md px-5 pt-4 space-y-6 animate-fade-up">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Support Network</h1>
          <p className="text-sm text-ink-500 mt-1">
            Money moves between people who care about each other. Keep track — without keeping score.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                <ArrowUpRight size={14} />
              </span>
              <p className="text-xs text-ink-500">Given · YTD</p>
            </div>
            <p className="font-display text-xl font-semibold text-ink-900">{fmt(totalOwedToYou)}</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-100 text-accent-700">
                <ArrowDownLeft size={14} />
              </span>
              <p className="text-xs text-ink-500">Received · YTD</p>
            </div>
            <p className="font-display text-xl font-semibold text-ink-900">{fmt(totalYouOwe)}</p>
          </div>
        </div>

        <div>
          <SectionTitle title="People" hint={`${network.length} in your circle`} />
          {network.length > 0 ? (
            <div className="space-y-3">
              {network.map((p) => (
                <div key={p.id} className="card p-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white text-xs font-bold">
                    {p.initials}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-900 truncate">{p.name}</p>
                    <p className="text-xs text-ink-500 mt-0.5">{p.relationship} &middot; {p.lastEntry}</p>
                  </div>
                  <p className={`text-sm font-bold whitespace-nowrap ${p.balance >= 0 ? 'text-brand-600' : 'text-accent-700'}`}>
                    {p.balance >= 0 ? '+' : '-'}{fmt(p.balance)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <HeartHandshake size={22} className="text-ink-400 mx-auto mb-3" />
              <p className="text-sm text-ink-500">No one in your network yet</p>
              <p className="text-xs text-ink-400 mt-1">Log a give or borrow below</p>
            </div>
          )}
        </div>

        {showForm ? (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-base font-semibold text-ink-900">Log an exchange</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-ink-500 hover:text-ink-800 transition"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex bg-ink-100 rounded-full p-1 mb-4">
              <button
                onClick={() => setDirection('lent')}
                className={`flex-1 rounded-full py-2 text-xs font-semibold transition ${
                  direction === 'lent' ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                I gave / lent
              </button>
              <button
                onClick={() => setDirection('borrowed')}
                className={`flex-1 rounded-full py-2 text-xs font-semibold transition ${
                  direction === 'borrowed' ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-500 hover:text-ink-800'
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
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note (optional)"
                className="input"
              />
              <button
                disabled={!canAdd}
                onClick={handleAdd}
                className={`btn-primary w-full ${!canAdd ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Check size={15} />
                Save entry
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowForm(true)} className="btn-ghost w-full">
            <Plus size={16} /> Log a give or borrow
          </button>
        )}
      </main>

      <BottomNav active="home" />
    </div>
  )
}
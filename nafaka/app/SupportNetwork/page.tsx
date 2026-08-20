'use client'

import React, { useState } from 'react'
import BottomNav from '@/components/BottomNav'
import AppHeader from '@/components/AppHeader'
import { useGoogleFont } from '@/lib/fonts'
import { useFinance } from '@/lib/store'
import { ArrowUpRight, ArrowDownRight, Users, Plus, X, Check } from 'lucide-react'
import { SectionTitle } from '@/components/proto/ui'
import { fmt } from '@/components/proto/format'
import { useToast } from '@/components/Toast'

type Direction = 'lent' | 'borrowed'

export default function SupportNetwork() {
  const body = useGoogleFont('Manrope')
  const { network, addNetworkEntry } = useFinance()
  const toast = useToast()

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [direction, setDirection] = useState<Direction>('lent')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  const canAdd = name.trim().length > 0 && amount.trim().length > 0

  const totalGiven = network.reduce((sum, p) => (p.balance > 0 ? sum + p.balance : sum), 0)
  const totalReceived = network.reduce((sum, p) => (p.balance < 0 ? sum + Math.abs(p.balance) : sum), 0)

  const handleAdd = () => {
    if (!canAdd) return
    addNetworkEntry(name.trim(), 'Contact', direction, Number(amount))
    toast.show('success', 'Added to your network')
    setName('')
    setAmount('')
    setNote('')
    setDirection('lent')
    setShowForm(false)
  }

  return (
    <div className="min-h-screen bg-ink-50 pb-28 md:pb-10 md:pl-64" style={{ fontFamily: body }}>
      <AppHeader />
      <main id="main" className="mx-auto w-full max-w-md px-5 pt-4 md:max-w-3xl md:px-8 space-y-6 animate-fade-up">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Support Network</h1>
          <p className="text-sm text-ink-500 mt-1">
            Family, faith, and community money flows. Nafaka treats these as obligations, not as &ldquo;leakage&rdquo;.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="card p-4">
            <div className="flex items-center gap-2">
              <ArrowUpRight size={16} className="text-accent-600" />
              <p className="text-xs font-medium text-ink-500">Given YTD</p>
            </div>
            <p className="mt-2 text-xl font-bold text-ink-900 tabular-nums">{fmt(totalGiven)}</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2">
              <ArrowDownRight size={16} className="text-brand-600" />
              <p className="text-xs font-medium text-ink-500">Received YTD</p>
            </div>
            <p className="mt-2 text-xl font-bold text-ink-900 tabular-nums">{fmt(totalReceived)}</p>
          </div>
        </div>

        <div>
          <SectionTitle title="Your network" hint="People and groups you exchange with" />
          <div className="space-y-3">
            {network.map((p) => {
              const gives = p.balance > 0
              const receives = p.balance < 0
              return (
                <div key={p.id} className="card p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-900 text-white">
                      <Users size={18} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink-900">{p.name}</p>
                      <p className="text-xs text-ink-500">{p.relationship}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-ink-900 tabular-nums">{fmt(Math.abs(p.balance))}</p>
                      <p className="text-[10px] text-ink-400 mt-0.5">YTD</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className={`pill ${
                        gives ? 'bg-accent-100 text-accent-700' : receives ? 'bg-brand-100 text-brand-700' : 'bg-ink-100 text-ink-600'
                      }`}
                    >
                      {gives ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {gives ? 'gives' : 'receives'}
                    </span>
                    <span className="text-[11px] text-ink-500">Last: {p.lastEntry}</span>
                  </div>
                </div>
              )
            })}
            {network.length === 0 && (
              <div className="card p-8 text-center">
                <Users size={22} className="text-ink-400 mx-auto mb-3" />
                <p className="text-sm text-ink-500">No one in your network yet</p>
                <p className="text-xs text-ink-400 mt-1">Log a give or borrow below</p>
              </div>
            )}
          </div>
        </div>

        {showForm ? (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-base font-semibold text-ink-900">Add a contact</h2>
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
            <Plus size={16} /> Add a contact
          </button>
        )}
      </main>

      <BottomNav active="home" />
    </div>
  )
}
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import { useGoogleFont } from '@/lib/fonts'
import { useFinance } from '@/lib/store'
import { ChevronLeft, Church, Users, Landmark, Home as HomeIcon, Plus, X, Check, CalendarClock, CheckCheck, XCircle } from 'lucide-react'

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
  const display = useGoogleFont('Fraunces')
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
            Upcoming commitments
          </h1>
        </div>

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          These are protected first when we calculate what&rsquo;s safe to spend each day. Mark what you&rsquo;ve
          followed through on &mdash; it&rsquo;s how Nafaka learns your commitment reliability.
        </p>

        {commitments.length > 0 ? (
          <div className="space-y-2.5 mb-6">
            {commitments.map(({ id, label: l, when: w, amount: a, status }) => {
              const Icon = pickIcon(l)
              const done = status === 'fulfilled'
              const missed = status === 'missed'
              return (
                <div key={id} className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <span className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Icon size={16} className={done ? 'text-secondary' : missed ? 'text-destructive' : 'text-secondary'} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{l}</p>
                        {done && (
                          <span className="text-[10px] font-semibold text-secondary bg-secondary/15 rounded-full px-2 py-0.5 shrink-0">
                            Paid
                          </span>
                        )}
                        {missed && (
                          <span className="text-[10px] font-semibold text-destructive bg-destructive/10 rounded-full px-2 py-0.5 shrink-0">
                            Missed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{w}</p>
                    </div>
                    <p className={`text-sm font-semibold ${missed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      UGX {a.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-4 pb-3.5 pt-1">
                    <button
                      onClick={() => setCommitmentStatus(id, done ? 'upcoming' : 'fulfilled')}
                      className={`cursor-pointer flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-colors ${
                        done
                          ? 'bg-secondary text-secondary-foreground'
                          : 'border border-secondary/30 text-secondary hover:bg-secondary/10'
                      }`}
                    >
                      <CheckCheck size={13} />
                      {done ? 'Fulfilled' : 'Mark paid'}
                    </button>
                    <button
                      onClick={() => setCommitmentStatus(id, missed ? 'upcoming' : 'missed')}
                      className={`cursor-pointer flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-colors ${
                        missed
                          ? 'bg-destructive text-destructive-foreground'
                          : 'border border-destructive/30 text-destructive hover:bg-destructive/10'
                      }`}
                    >
                      <XCircle size={13} />
                      {missed ? 'Missed' : 'Mark missed'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-2xl mb-6">
            <CalendarClock size={24} className="text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No commitments yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Add your first one below</p>
          </div>
        )}

        {showForm ? (
          <div className="bg-card border border-border rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">New commitment</h2>
              <button
                onClick={() => setShowForm(false)}
                className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
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
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground transition-colors"
              />
              <input
                type="text"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                placeholder="When? e.g. In 5 days"
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
                Add commitment
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="cursor-pointer w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-4 text-sm font-semibold text-primary hover:bg-muted transition-colors"
          >
            <Plus size={16} />
            Add a commitment
          </button>
        )}
      </div>

      <BottomNav active="home" />
    </div>
  )
}

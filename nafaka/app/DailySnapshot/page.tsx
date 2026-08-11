'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import { useGoogleFont } from '@/lib/fonts'
import { useFinance } from '@/lib/store'
import {
  Plus,
  Minus,
  Sparkles,
  Church,
  Users,
  Landmark,
  Home as HomeIcon,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Trash2,
  HeartHandshake,
  Bell,
} from 'lucide-react'

const iconMap: Record<string, typeof Church> = {
  cell: Users,
  church: Church,
  rent: HomeIcon,
  debt: Landmark,
}

export default function DailySnapshot() {
  const display = useGoogleFont('Fraunces')
  const body = useGoogleFont('Manrope')
  const { profile, balance, safeToSpend, transactions, commitments, deleteTransaction } = useFinance()

  const [openRow, setOpenRow] = useState<number | null>(null)

  const handleDelete = (id: number) => {
    deleteTransaction(id)
    setOpenRow(null)
  }

  function fmt(n: number) { return `UGX ${n.toLocaleString()}` }

  const today = new Date()
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })

  function commitmentIcon(label: string) {
    const lower = label.toLowerCase()
    if (lower.includes('cell')) return iconMap.cell
    if (lower.includes('tithe') || lower.includes('offering') || lower.includes('church')) return iconMap.church
    if (lower.includes('rent')) return iconMap.rent
    if (lower.includes('debt') || lower.includes('repayment')) return iconMap.debt
    return Landmark
  }

  return (
    <div className="min-h-screen bg-background pb-32" style={{ fontFamily: body }}>
      <div className="max-w-sm mx-auto px-6 pt-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs text-muted-foreground">{dateStr}</p>
            <h1 style={{ fontFamily: display }} className="text-2xl text-foreground mt-0.5">
              Hey {profile.name}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/Notifications"
              className="cursor-pointer relative w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors"
              aria-label="Notifications"
            >
              <Bell size={17} />
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-primary" />
            </Link>
            <Link
              href="/Profile"
              className="cursor-pointer w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center text-secondary font-semibold hover:bg-secondary/25 transition-colors"
              aria-label="Profile"
            >
              {profile.name.charAt(0).toUpperCase()}
            </Link>
          </div>
        </div>

        <div className="relative rounded-3xl bg-primary text-primary-foreground p-6 overflow-hidden mb-5">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary-foreground/10" />
          <p className="text-xs uppercase tracking-wide text-primary-foreground/70 mb-2">Current balance</p>
          <p style={{ fontFamily: display }} className="text-4xl mb-6">
            {fmt(balance)}
          </p>
          <div className="flex items-center justify-between border-t border-primary-foreground/20 pt-4">
            <div>
              <p className="text-xs text-primary-foreground/70">Safe to spend today</p>
              <p style={{ fontFamily: display }} className="text-xl mt-0.5">
                {fmt(safeToSpend)}
              </p>
            </div>
            <span className="text-[11px] bg-primary-foreground/15 rounded-full px-3 py-1.5">
              After commitments
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link
            href="/AddIncome"
            className="cursor-pointer bg-card border border-border rounded-2xl px-4 py-4 flex items-center gap-3 hover:bg-muted transition-colors"
          >
            <span className="w-9 h-9 rounded-full bg-secondary/15 flex items-center justify-center">
              <Plus size={17} className="text-secondary" />
            </span>
            <span className="text-sm font-semibold text-foreground">Add income</span>
          </Link>
          <Link
            href="/AddExpense"
            className="cursor-pointer bg-card border border-border rounded-2xl px-4 py-4 flex items-center gap-3 hover:bg-muted transition-colors"
          >
            <span className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
              <Minus size={17} className="text-primary" />
            </span>
            <span className="text-sm font-semibold text-foreground">Add expense</span>
          </Link>
        </div>

        <div className="bg-accent/50 border border-border rounded-2xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles size={15} className="text-secondary-foreground" />
            </span>
            <div>
              <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1.5">Today&rsquo;s insight</p>
              <p className="text-sm text-foreground leading-relaxed">
                You&rsquo;ve kept transport spending steady this week even with less income coming in. That consistency
                matters more than the amount.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/SupportNetwork"
          className="cursor-pointer flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3.5 mb-8 hover:bg-muted transition-colors"
        >
          <span className="w-9 h-9 rounded-full bg-secondary/15 flex items-center justify-center shrink-0">
            <HeartHandshake size={16} className="text-secondary" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Support network</p>
            <p className="text-xs text-muted-foreground">Track what you&rsquo;ve lent or borrowed</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </Link>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Coming up</h2>
            <Link href="/LifeEvents" className="cursor-pointer text-xs text-primary flex items-center gap-0.5 hover:underline">
              See all <ChevronRight size={13} />
            </Link>
          </div>
          {commitments.length > 0 ? (
            <div className="space-y-2.5">
              {commitments.map(({ id, label, when, amount }) => {
                const Icon = commitmentIcon(label)
                return (
                  <div key={id} className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3.5">
                    <span className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-secondary" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{when}</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{fmt(amount)}</p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 border border-dashed border-border rounded-2xl">
              <p className="text-sm text-muted-foreground">No upcoming commitments</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Add one in Life Events</p>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Recent activity</h2>
          </div>
          {transactions.length > 0 ? (
            <div className="space-y-2.5">
              {transactions.map(({ id, type, label, amount, time }) => {
                const isOpen = openRow === id
                return (
                  <div key={id} className="bg-card border border-border rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setOpenRow(isOpen ? null : id)}
                      className="cursor-pointer w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted transition-colors"
                    >
                      <span
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                          type === 'income' ? 'bg-secondary/15' : 'bg-primary/15'
                        }`}
                      >
                        {type === 'income' ? (
                          <ArrowUpRight size={16} className="text-secondary" />
                        ) : (
                          <ArrowDownRight size={16} className="text-primary" />
                        )}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground">{time}</p>
                      </div>
                      <p className={`text-sm font-semibold ${type === 'income' ? 'text-secondary' : 'text-foreground'}`}>
                        {type === 'income' ? '+' : '-'} {fmt(amount)}
                      </p>
                    </button>
                    {isOpen && (
                      <div className="flex items-center gap-2 px-4 pb-3.5 pt-1">
                        <button
                          onClick={() => handleDelete(id)}
                          className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-destructive/30 py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 border border-dashed border-border rounded-2xl">
              <p className="text-sm text-muted-foreground">No transactions yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Add income or an expense above</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  )
}

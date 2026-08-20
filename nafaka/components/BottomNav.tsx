'use client'

import React from 'react'
import Link from 'next/link'
import { Home, LineChart, HeartPulse, Sparkles, MessageCircle, User } from 'lucide-react'

interface BottomNavProps {
  active: 'home' | 'patterns' | 'score' | 'coach' | 'chat'
}

const items = [
  { key: 'home', label: 'Today', icon: Home, href: '/DailySnapshot' },
  { key: 'patterns', label: 'Patterns', icon: LineChart, href: '/FinancialPersonality' },
  { key: 'score', label: 'Health', icon: HeartPulse, href: '/HealthScore' },
  { key: 'coach', label: 'Review', icon: Sparkles, href: '/WeeklyReview' },
  { key: 'chat', label: 'Chat', icon: MessageCircle, href: '/AIChat' },
] as const

export default function BottomNav({ active }: BottomNavProps) {
  return (
    <>
      {/* Mobile bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-ink-100 bg-white/85 backdrop-blur-lg md:hidden">
        <div className="mx-auto max-w-md grid grid-cols-5">
          {items.map(({ key, label, icon: Icon, href }) => {
            const isActive = active === key
            return (
              <Link
                key={key}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className="relative flex flex-col items-center gap-1 py-2.5 transition"
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                    isActive ? 'bg-brand-600 text-white shadow-soft' : 'text-ink-500 hover:text-ink-800'
                  }`}
                >
                  <Icon size={18} strokeWidth={2.2} />
                </span>
                <span className={`text-[10px] font-semibold ${isActive ? 'text-brand-700' : 'text-ink-500'}`}>{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-ink-100 bg-white md:flex">
        <Link href="/DailySnapshot" className="flex items-center gap-2.5 px-5 py-5" aria-label="Nafaka home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
            <Sparkles size={18} />
          </span>
          <span className="font-display text-lg font-semibold text-ink-900 tracking-tight">Nafaka</span>
        </Link>
        <nav className="flex-1 space-y-1 px-3">
          {items.map(({ key, label, icon: Icon, href }) => {
            const isActive = active === key
            return (
              <Link
                key={key}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                  isActive ? 'bg-brand-50 text-brand-800' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
                }`}
              >
                <Icon size={18} strokeWidth={2.2} className={isActive ? 'text-brand-600' : 'text-ink-500'} />
                {label}
              </Link>
            )
          })}
        </nav>
        <Link
          href="/Profile"
          className="mx-3 mb-4 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50 hover:text-ink-900"
        >
          <User size={18} className="text-ink-500" />
          Profile &amp; settings
        </Link>
      </aside>
    </>
  )
}

'use client'

import React from 'react'
import Link from 'next/link'
import { Home, LineChart, HeartPulse, Sparkles, MessageCircle } from 'lucide-react'

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
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-ink-100 bg-white/85 backdrop-blur-lg">
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
  )
}
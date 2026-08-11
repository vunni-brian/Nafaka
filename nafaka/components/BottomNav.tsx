'use client'

import React from 'react'
import Link from 'next/link'
import { Home, Sparkles, Gauge, MessageCircle, NotebookText } from 'lucide-react'

interface BottomNavProps {
  active: 'home' | 'patterns' | 'score' | 'coach' | 'chat'
}

export default function BottomNav({ active }: BottomNavProps) {
  const items = [
    { key: 'home', label: 'Today', icon: Home, href: '/DailySnapshot' },
    { key: 'patterns', label: 'Patterns', icon: Sparkles, href: '/FinancialPersonality' },
    { key: 'score', label: 'Score', icon: Gauge, href: '/HealthScore' },
    { key: 'coach', label: 'Coach', icon: NotebookText, href: '/WeeklyReview' },
    { key: 'chat', label: 'Chat', icon: MessageCircle, href: '/AIChat' },
  ] as const

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 pb-4 pt-2 z-50">
      <div className="flex items-center justify-between bg-card/95 backdrop-blur border border-border rounded-2xl px-2 py-2 shadow-lg shadow-foreground/5">
        {items.map(({ key, label, icon: Icon, href }) => {
          const isActive = active === key
          return (
            <Link
              key={key}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 flex-1 cursor-pointer transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                  isActive ? 'bg-primary/15' : ''
                }`}
              >
                <Icon size={18} strokeWidth={2.2} />
              </span>
              <span className="text-[10px] font-medium tracking-wide">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

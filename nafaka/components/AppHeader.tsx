'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Sparkles, Settings } from 'lucide-react'

const PRIMARY = ['/DailySnapshot', '/FinancialPersonality', '/HealthScore', '/WeeklyReview', '/AIChat']

export default function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const isSecondary = !PRIMARY.some((p) => pathname?.startsWith(p)) && pathname !== '/'

  return (
    <header className="sticky top-0 z-20 bg-ink-50/85 backdrop-blur-lg border-b border-ink-100">
      <div className="mx-auto max-w-md flex items-center justify-between px-5 h-14">
        <Link href="/DailySnapshot" className="flex items-center gap-2" aria-label="Nafaka home">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-soft">
            <Sparkles size={17} />
          </span>
          <span className="font-display text-base font-semibold text-ink-900 tracking-tight">Nafaka</span>
        </Link>
        <div className="flex items-center gap-1">
          {isSecondary && (
            <button
              onClick={() => (window.history.length > 1 ? router.back() : router.push('/DailySnapshot'))}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-ink-600 hover:bg-ink-100 transition"
            >
              Back
            </button>
          )}
          <Link
            href="/Profile"
            aria-label="Profile and settings"
            className={`rounded-lg p-2 transition ${pathname === '/Profile' ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-100'}`}
          >
            <Settings size={18} />
          </Link>
        </div>
      </div>
    </header>
  )
}
'use client'

import React, { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { useGoogleFont } from '@/lib/fonts'
import { useFinance } from '@/lib/store'
import { buildNotifications, type AppNotification } from '@/lib/notifications'
import { Bell, Sparkles, CalendarClock, TrendingUp, Circle } from 'lucide-react'
import AppHeader from '@/components/AppHeader'

const typeIcon: Record<AppNotification['kind'], typeof Bell> = {
  insight: TrendingUp,
  daily: Sparkles,
  commitment: CalendarClock,
  info: Bell,
}

const READ_KEY = 'nafaka-notification-read'
const SEEN_KEY = 'nafaka-notification-seen'

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function relativeTime(ts: number | undefined, now: number): string {
  if (!ts) return 'Just now'
  const diff = now - ts
  if (diff < 5 * 60_000) return 'Just now'
  if (diff < 60 * 60_000) return `${Math.round(diff / 60_000)}m ago`
  if (diff < 24 * 60 * 60_000) return `${Math.round(diff / 3_600_000)}h ago`
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const nowListeners = new Set<() => void>()
let cachedNow = Date.now()

function subscribeNow(cb: () => void): () => void {
  nowListeners.add(cb)
  return () => {
    nowListeners.delete(cb)
  }
}

function getNow(): number {
  return cachedNow
}

if (typeof window !== 'undefined') {
  window.setInterval(() => {
    cachedNow = Date.now()
    nowListeners.forEach((cb) => cb())
  }, 60_000)
}

export default function Notifications() {
  const body = useGoogleFont('Manrope')
  const { commitments, safeToSpend, behaviorModel, profile } = useFinance()
  const now = useSyncExternalStore(subscribeNow, getNow, getNow)

  const notifications = useMemo(
    () =>
      buildNotifications({
        commitments,
        behaviorModel,
        safeToSpend,
        notificationsOptIn: profile.notificationsOptIn,
      }),
    [commitments, behaviorModel, safeToSpend, profile.notificationsOptIn],
  )

  const [readIds, setReadIds] = useState<Set<string>>(() => new Set(load<string[]>(READ_KEY, [])))
  const [stamps, setStamps] = useState<Record<string, number>>(() => load<Record<string, number>>(SEEN_KEY, {}))

  useEffect(() => {
    try {
      window.localStorage.setItem(READ_KEY, JSON.stringify([...readIds]))
    } catch {
      // storage may be unavailable; read state just won't persist
    }
  }, [readIds])

  useEffect(() => {
    try {
      window.localStorage.setItem(SEEN_KEY, JSON.stringify(stamps))
    } catch {
      // storage may be unavailable; timestamps just won't persist
    }
  }, [stamps])

  const missing = notifications.filter((n) => !stamps[n.id])
  if (missing.length > 0) {
    const next = { ...stamps }
    for (const n of missing) next[n.id] = now
    setStamps(next)
  }

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length

  const markAllRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)))
  }

  return (
    <div className="min-h-screen bg-ink-50 pb-16 md:pb-10 md:pl-64" style={{ fontFamily: body }}>
      <AppHeader />
      <main id="main" className="mx-auto w-full max-w-md px-5 pt-4 md:max-w-3xl md:px-8 space-y-6 animate-fade-up">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Notifications</h1>
          <p className="text-sm text-ink-500 mt-1">Coaching, reminders, and milestones from Nafaka.</p>
        </div>

        {notifications.length > 0 && (
          <div className="card divide-y divide-ink-100">
            {notifications.map((n) => {
              const Icon = typeIcon[n.kind] ?? Bell
              const isUnread = !readIds.has(n.id)
              return (
                <div key={n.id} className={`flex items-start gap-3 px-4 py-3.5 ${isUnread ? 'bg-brand-50/40' : ''}`}>
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      n.kind === 'daily'
                        ? 'bg-brand-100 text-brand-700'
                        : n.kind === 'commitment'
                        ? 'bg-accent-100 text-accent-700'
                        : 'bg-ink-100 text-ink-600'
                    }`}
                  >
                    <Icon size={16} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-ink-900">{n.title}</p>
                      {isUnread && <Circle size={7} className="fill-brand-600 text-brand-600" />}
                    </div>
                    <p className="text-xs text-ink-600 mt-1 leading-relaxed">{n.detail}</p>
                    <p className="text-[10px] text-ink-400 mt-1.5 tabular-nums">{relativeTime(stamps[n.id], now)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {notifications.length === 0 && (
          <div className="card p-10 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-400 mb-4">
              <Bell size={20} />
            </span>
            <p className="text-sm text-ink-500">No notifications yet.</p>
            <p className="text-xs text-ink-400 mt-1 max-w-[26ch] mx-auto leading-relaxed">
              Insights, commitment reminders, and your daily safe-to-spend will show up here as you use Nafaka.
            </p>
          </div>
        )}

        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-ghost w-full">
            Mark all as read
          </button>
        )}
      </main>
    </div>
  )
}
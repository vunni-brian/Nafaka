'use client'

import React, { useMemo, useState } from 'react'
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

export default function Notifications() {
  const body = useGoogleFont('Manrope')
  const { commitments, safeToSpend, behaviorModel, profile } = useFinance()

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

  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length

  const markAllRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)))
  }

  return (
    <div className="min-h-screen bg-ink-50 pb-16 md:pb-10 md:pl-64" style={{ fontFamily: body }}>
      <AppHeader />
      <main className="mx-auto w-full max-w-md px-5 pt-4 md:max-w-3xl md:px-8 space-y-6 animate-fade-up">
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
                    <p className="text-[10px] text-ink-400 mt-1.5">Just now</p>
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
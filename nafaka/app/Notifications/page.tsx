'use client'

import React, { useMemo, useState } from 'react'
import { useGoogleFont } from '@/lib/fonts'
import { useFinance } from '@/lib/store'
import { buildNotifications, type AppNotification } from '@/lib/notifications'
import { Bell, Church, Sparkles, Sun, CheckCheck } from 'lucide-react'
import AppHeader from '@/components/AppHeader'

const iconMap: Record<AppNotification['kind'], typeof Bell> = {
  commitment: Church,
  insight: Sparkles,
  daily: Sun,
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
  const unread = notifications.filter((n) => !readIds.has(n.id))
  const unreadCount = unread.length

  const markAllRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)))
  }

  const markRead = (id: string) => {
    setReadIds((prev) => new Set(prev).add(id))
  }

  return (
    <div className="min-h-screen bg-background pb-16" style={{ fontFamily: body }}>
      <AppHeader />
      <main className="mx-auto max-w-md px-5 pt-4 space-y-5 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">Notifications</h1>
            <p className="text-xs text-ink-500 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'You’re all caught up'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-800 transition"
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          )}
        </div>

        <div className="space-y-3">
          {notifications.map((n) => {
            const Icon = iconMap[n.kind] ?? Bell
            const isUnread = !readIds.has(n.id)
            return (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`w-full text-left flex items-start gap-3 rounded-[1.25rem] p-4 transition shadow-sm ${
                  isUnread
                    ? 'bg-brand-600 text-white'
                    : 'card hover:bg-ink-50'
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    isUnread ? 'bg-white/15 text-white' : 'bg-brand-100 text-brand-700'
                  }`}
                >
                  <Icon size={17} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${isUnread ? 'text-white' : 'text-ink-900'}`}>{n.title}</p>
                    {isUnread && <span className="w-2 h-2 rounded-full bg-white shrink-0 mt-1.5" />}
                  </div>
                  <p className={`text-xs mt-1 leading-relaxed ${isUnread ? 'text-white/80' : 'text-ink-500'}`}>{n.detail}</p>
                  <p className={`text-[11px] mt-2 ${isUnread ? 'text-white/60' : 'text-ink-400'}`}>Just now</p>
                </div>
              </button>
            )
          })}
        </div>

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
      </main>
    </div>
  )
}
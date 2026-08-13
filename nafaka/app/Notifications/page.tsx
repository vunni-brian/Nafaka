'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useGoogleFont } from '@/lib/fonts'
import { useFinance } from '@/lib/store'
import { buildNotifications, type AppNotification } from '@/lib/notifications'
import {
  ChevronLeft,
  Bell,
  Church,
  Sparkles,
  CheckCheck,
  Sun,
} from 'lucide-react'

const iconMap: Record<AppNotification['kind'], typeof Bell> = {
  commitment: Church,
  insight: Sparkles,
  daily: Sun,
  info: Bell,
}

export default function Notifications() {
  const display = useGoogleFont('Fraunces')
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
      <div className="max-w-sm mx-auto px-6 pt-8">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/DailySnapshot"
            className="cursor-pointer w-9 h-9 rounded-full flex items-center justify-center border border-border text-foreground hover:bg-muted transition-colors"
            aria-label="Back"
          >
            <ChevronLeft size={18} />
          </Link>
          <h1 style={{ fontFamily: display }} className="text-lg text-foreground flex-1">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="cursor-pointer flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          )}
        </div>

        {unreadCount > 0 && (
          <p className="text-xs text-muted-foreground mb-6">
            {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
          </p>
        )}

        <div className="space-y-2.5">
          {notifications.map((n) => {
            const Icon = iconMap[n.kind] ?? Bell
            const isUnread = !readIds.has(n.id)
            return (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`cursor-pointer w-full text-left flex items-start gap-3 rounded-2xl border px-4 py-4 transition-colors ${
                  isUnread ? 'border-primary/30 bg-accent/40' : 'border-border bg-card hover:bg-muted'
                }`}
              >
                <span className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-primary" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    {isUnread && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.detail}</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-2">Just now</p>
                </div>
              </button>
            )
          })}
        </div>

        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bell size={20} className="text-muted-foreground" />
            </span>
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
            <p className="text-xs text-muted-foreground/70 mt-1 max-w-[24ch]">
              Insights, commitment reminders, and your daily safe-to-spend will show up here as you use Nafaka.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useGoogleFont } from '@/lib/fonts'
import {
  ChevronLeft,
  Bell,
  Church,
  Users,
  Sparkles,
  HeartHandshake,
  Landmark,
  CheckCheck,
} from 'lucide-react'

type NotificationItem = {
  id: number
  icon: typeof Bell
  iconBg: string
  iconColor: string
  title: string
  detail: string
  time: string
  unread: boolean
}

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    icon: Church,
    iconBg: 'bg-secondary/15',
    iconColor: 'text-secondary',
    title: 'Sunday offering due tomorrow',
    detail: 'UGX 10,000 is coming up. Your safe-to-spend already accounts for it.',
    time: '2h ago',
    unread: true,
  },
  {
    id: 2,
    icon: Sparkles,
    iconBg: 'bg-primary/15',
    iconColor: 'text-primary',
    title: 'New pattern detected',
    detail: "You've been spending more on weekends after deposits land. Worth a look.",
    time: '5h ago',
    unread: true,
  },
  {
    id: 3,
    icon: Users,
    iconBg: 'bg-secondary/15',
    iconColor: 'text-secondary',
    title: 'Cell meeting reminder',
    detail: 'UGX 5,000 contribution due tomorrow evening.',
    time: '1d ago',
    unread: true,
  },
  {
    id: 4,
    icon: HeartHandshake,
    iconBg: 'bg-secondary/15',
    iconColor: 'text-secondary',
    title: 'Support network update',
    detail: 'Grace paid back UGX 15,000. Your balance with her is now settled.',
    time: '2d ago',
    unread: false,
  },
  {
    id: 5,
    icon: Landmark,
    iconBg: 'bg-primary/15',
    iconColor: 'text-primary',
    title: 'Debt repayment upcoming',
    detail: 'UGX 30,000 due in 18 days. Set aside a little each week to stay ahead.',
    time: '3d ago',
    unread: false,
  },
]

export default function Notifications() {
  const display = useGoogleFont('Fraunces')
  const body = useGoogleFont('Manrope')

  const [notifications, setNotifications] = useState(initialNotifications)
  const unreadCount = notifications.filter((n) => n.unread).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  const markRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)))
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
          {notifications.map(({ id, icon: Icon, iconBg, iconColor, title, detail, time, unread }) => (
            <button
              key={id}
              onClick={() => markRead(id)}
              className={`cursor-pointer w-full text-left flex items-start gap-3 rounded-2xl border px-4 py-4 transition-colors ${
                unread ? 'border-primary/30 bg-accent/40' : 'border-border bg-card hover:bg-muted'
              }`}
            >
              <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                <Icon size={16} className={iconColor} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  {unread && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{detail}</p>
                <p className="text-[11px] text-muted-foreground/70 mt-2">{time}</p>
              </div>
            </button>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bell size={20} className="text-muted-foreground" />
            </span>
            <p className="text-sm text-muted-foreground">You&rsquo;re all caught up.</p>
          </div>
        )}
      </div>
    </div>
  )
}

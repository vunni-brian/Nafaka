'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import AppHeader from '@/components/AppHeader'
import { useGoogleFont } from '@/lib/fonts'
import { useFinance } from '@/lib/store'
import { CalendarDays, Sparkles, ShieldCheck, Bell, Globe, Lock, ChevronRight, LogOut, Check, Trash2 } from 'lucide-react'
import { SectionTitle, ConfidenceBar, Modal } from '@/components/proto/ui'
import { fmt } from '@/components/proto/format'
import { tierLabel, tierCopy } from '@/lib/brain/describe'
import { daysBetween, toISODate } from '@/lib/brain/stats'
import { createClient } from '@/utils/supabase/client'

const LOCAL_STORAGE_KEY = 'nafaka-finance-v1'

export default function Profile() {
  const body = useGoogleFont('Manrope')
  const router = useRouter()
  const { profile, setProfileName, setNotificationsOptIn, behaviorModel, commitments, transactions } = useFinance()

  const [editing, setEditing] = useState(false)
  const [nameDraft, setNameDraft] = useState(profile.name)
  const [signingOut, setSigningOut] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const confidencePctValue = Math.round(behaviorModel.confidence * 100)

  const earliest = transactions.reduce<string | null>((min, t) => {
    const d = t.recordedAt?.slice(0, 10)
    return d && (!min || d < min) ? d : min
  }, null)
  const daysUsing = earliest ? Math.max(1, daysBetween(earliest, toISODate(new Date()))) : behaviorModel.dataPoints

  const handleSaveName = () => {
    if (nameDraft.trim().length > 0) setProfileName(nameDraft.trim())
    setEditing(false)
  }

  const handleSignOut = async (e: React.FormEvent) => {
    e.preventDefault()
    if (signingOut) return
    setSigningOut(true)
    // The route handler clears cookies and redirects to /login
    const res = await fetch('/auth/signout', { method: 'POST' })
    router.push(res.redirected ? res.url : '/login')
    router.refresh()
  }

  const handleDeleteAccount = async () => {
    if (deleting) return
    setDeleting(true)
    setDeleteError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.functions.invoke('delete-account')
      if (error) throw new Error(error.message || 'Deletion failed. Please try again.')
      window.localStorage.removeItem(LOCAL_STORAGE_KEY)
      const res = await fetch('/auth/signout', { method: 'POST' })
      router.push(res.redirected ? res.url : '/login')
      router.refresh()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Deletion failed. Please try again.')
      setDeleting(false)
    }
  }

  const unlocks = [
    { label: 'Patterns', sub: '40% conf', unlocked: confidencePctValue >= 40 },
    { label: 'Health', sub: '70% conf', unlocked: confidencePctValue >= 70 },
    { label: 'Coaching', sub: '90% conf', unlocked: confidencePctValue >= 90 },
  ]

  return (
    <div className="min-h-screen bg-ink-50 pb-28 md:pb-10 md:pl-64" style={{ fontFamily: body }}>
      <AppHeader />
      <main className="mx-auto w-full max-w-md px-5 pt-4 md:max-w-3xl md:px-8 space-y-6 animate-fade-up">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Profile</h1>
          <p className="text-sm text-ink-500 mt-1">Your account, behavior model, and preferences.</p>
        </div>

        {/* Profile card */}
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white font-display text-xl font-semibold">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    className="input py-2 w-40"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white hover:bg-brand-700 transition"
                    aria-label="Save name"
                  >
                    <Check size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="font-display text-lg font-semibold text-ink-900 truncate">
                    {profile.name.charAt(0).toUpperCase() + profile.name.slice(1)}
                  </p>
                  <button
                    onClick={() => { setNameDraft(profile.name); setEditing(true) }}
                    className="text-xs font-semibold text-brand-700 hover:underline"
                  >
                    Edit
                  </button>
                </div>
              )}
              <p className="text-xs text-ink-500 flex items-center gap-1 mt-0.5">
                <CalendarDays size={12} /> Using Nafaka for {daysUsing} days
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-ink-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-brand-600" />
                <p className="text-sm font-semibold text-ink-900">Behavioral confidence</p>
              </div>
              <ConfidenceBar value={confidencePctValue} />
            </div>
            <p className="text-xs text-ink-500 mt-2">
              {tierLabel(behaviorModel.confidenceTier)}. {tierCopy(behaviorModel.confidenceTier)} Full intelligence unlocks at 90%.
            </p>
          </div>
        </div>

        {/* Commitments */}
        <div>
          <SectionTitle title="Recurring commitments" hint={`${commitments.length} tracked`} />
          <div className="card divide-y divide-ink-100">
            {commitments.map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink-900 truncate">{c.label}</p>
                  <p className="text-xs text-ink-500">{c.when} &middot; {c.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-ink-900">{fmt(c.amount)}</p>
                  <p className="text-[10px] text-brand-700 font-semibold">
                    {c.status === 'fulfilled' ? '100% reliable' : c.status === 'missed' ? '0% reliable' : 'tracking'}
                  </p>
                </div>
              </div>
            ))}
            {commitments.length === 0 && (
              <div className="px-4 py-6 text-center">
                <p className="text-xs text-ink-500">No commitments tracked yet.</p>
              </div>
            )}
          </div>
          <Link href="/LifeEvents" className="btn-ghost w-full mt-3">
            + Add commitment
          </Link>
        </div>

        {/* Preferences */}
        <div>
          <SectionTitle title="Preferences" />
          <div className="card divide-y divide-ink-100">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-100 text-ink-600">
                <Bell size={17} />
              </span>
              <p className="text-sm font-medium text-ink-800 flex-1">Notifications</p>
              <button
                onClick={() => setNotificationsOptIn(!profile.notificationsOptIn)}
                aria-pressed={!!profile.notificationsOptIn}
                aria-label="Toggle notifications"
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  profile.notificationsOptIn ? 'bg-brand-600' : 'bg-ink-200'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    profile.notificationsOptIn ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center gap-3 px-4 py-3.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-100 text-ink-600">
                <Globe size={17} />
              </span>
              <p className="text-sm font-medium text-ink-800 flex-1">Region context</p>
              <p className="text-xs font-semibold text-ink-500">Uganda</p>
              <ChevronRight size={16} className="text-ink-300" />
            </div>
            <div className="flex items-center gap-3 px-4 py-3.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-100 text-ink-600">
                <ShieldCheck size={17} />
              </span>
              <p className="text-sm font-medium text-ink-800 flex-1">Judgment filter</p>
              <p className="text-xs font-semibold text-ink-500">Always on</p>
              <ChevronRight size={16} className="text-ink-300" />
            </div>
            <Link href="/privacy" className="flex items-center gap-3 px-4 py-3.5 hover:bg-ink-50 transition">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-100 text-ink-600">
                <Lock size={17} />
              </span>
              <p className="text-sm font-medium text-ink-800 flex-1">Privacy &amp; data</p>
              <ChevronRight size={16} className="text-ink-300" />
            </Link>
          </div>
        </div>

        {/* Unlock levels */}
        <div>
          <SectionTitle title="Unlock levels" hint="How Nafaka grows with your data" />
          <div className="card p-4">
            <div className="grid grid-cols-3 gap-2">
              {unlocks.map((u) => (
                <div
                  key={u.label}
                  className={`rounded-xl border px-2 py-3 text-center transition ${
                    u.unlocked ? 'border-brand-500 bg-brand-50 text-brand-800' : 'border-ink-200 text-ink-600'
                  }`}
                >
                  <p className="text-sm font-bold">{u.label}</p>
                  <p className="text-[10px] mt-0.5 opacity-70">{u.unlocked ? 'Unlocked' : u.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Secondary nav */}
        <div>
          <SectionTitle title="More" />
          <div className="card divide-y divide-ink-100">
            <Link href="/LifeEvents" className="flex items-center w-full px-4 py-3.5 hover:bg-ink-50 transition">
              <p className="text-sm font-medium text-ink-800 flex-1 text-left">Life events</p>
              <ChevronRight size={16} className="text-ink-300" />
            </Link>
            <Link href="/SupportNetwork" className="flex items-center w-full px-4 py-3.5 hover:bg-ink-50 transition">
              <p className="text-sm font-medium text-ink-800 flex-1 text-left">Support network</p>
              <ChevronRight size={16} className="text-ink-300" />
            </Link>
            <Link href="/Notifications" className="flex items-center w-full px-4 py-3.5 hover:bg-ink-50 transition">
              <p className="text-sm font-medium text-ink-800 flex-1 text-left">Notifications</p>
              <ChevronRight size={16} className="text-ink-300" />
            </Link>
          </div>
        </div>

        {/* Danger zone */}
        <div>
          <SectionTitle title="Danger zone" />
          <div className="card p-4">
            <p className="text-xs text-ink-500 mb-3">
              Permanently deletes your account, financial data and coaching history. This cannot be undone.
            </p>
            <button
              onClick={() => { setDeleteOpen(true); setDeleteError(null) }}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 transition cursor-pointer"
            >
              <Trash2 size={16} /> Delete my account
            </button>
          </div>
        </div>

        <form onSubmit={handleSignOut}>
          <button
            type="submit"
            disabled={signingOut}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-accent-700 hover:bg-accent-50 transition disabled:opacity-60"
          >
            <LogOut size={16} /> {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </form>

        <p className="text-center text-[11px] text-ink-400">Nafaka 2.0 &middot; Behavioral Financial Intelligence</p>
      </main>

      <BottomNav active="home" />

      <Modal
        open={deleteOpen}
        onClose={() => { if (!deleting) setDeleteOpen(false) }}
        title="Delete your Nafaka account?"
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
              className="flex-1 rounded-xl border border-ink-200 py-3 text-sm font-semibold text-ink-700 hover:bg-ink-50 transition disabled:opacity-60 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 transition disabled:opacity-60 cursor-pointer"
            >
              {deleting ? 'Deleting…' : 'Delete my account'}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-ink-700 leading-relaxed">
            This permanently deletes your Nafaka account and your financial data, including transactions,
            commitments, goals, coaching history and financial insights.
          </p>
          <p className="text-sm font-semibold text-red-700">This can&apos;t be undone.</p>
          {deleteError && (
            <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {deleteError}
            </p>
          )}
        </div>
      </Modal>
    </div>
  )
}
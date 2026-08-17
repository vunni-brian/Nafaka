'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import AppHeader from '@/components/AppHeader'
import { useGoogleFont } from '@/lib/fonts'
import { useFinance } from '@/lib/store'
import { createClient } from '@/utils/supabase/client'
import { ChevronRight, Sparkles, Check, LogOut, BellRing } from 'lucide-react'
import { SectionTitle } from '@/components/proto/ui'

export default function Profile() {
  const body = useGoogleFont('Manrope')
  const router = useRouter()
  const { profile, setProfileName, setNotificationsOptIn } = useFinance()

  const [editing, setEditing] = useState(false)
  const [nameDraft, setNameDraft] = useState(profile.name)
  const [email, setEmail] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)

  const handleSaveName = () => {
    if (nameDraft.trim().length > 0) setProfileName(nameDraft.trim())
    setEditing(false)
  }

  React.useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null))
  }, [])

  const handleSignOut = async (e: React.FormEvent) => {
    e.preventDefault()
    if (signingOut) return
    setSigningOut(true)
    // The route handler clears cookies and redirects to /login
    const res = await fetch('/auth/signout', { method: 'POST' })
    if (res.redirected) router.push(res.url)
    else router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background pb-28" style={{ fontFamily: body }}>
      <AppHeader />
      <main className="mx-auto max-w-md px-5 pt-4 space-y-6 animate-fade-up">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Settings</h1>
          <p className="text-sm text-ink-500 mt-1">Your profile, preferences, and account.</p>
        </div>

        {/* Profile card */}
        <div className="card p-4 flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white text-xl font-semibold">
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
            <p className="text-xs text-ink-500 mt-0.5">{email ?? 'Demo account'}</p>
          </div>
        </div>

        <div>
          <SectionTitle title="Financial archetype" hint="From your onboarding" />
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <Sparkles size={17} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-900">{profile.archetype || 'Not set yet'}</p>
                <p className="text-xs text-ink-500 mt-0.5">Your money personality, shaped by how you describe yourself</p>
              </div>
            </div>
            {profile.priorities.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.priorities.map((p) => (
                  <span key={p} className="pill bg-brand-50 text-brand-700 border border-brand-200">{p}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <SectionTitle title="Preferences" hint="Nafaka behavior" />
          <div className="card divide-y divide-ink-100">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-100 text-accent-700">
                <BellRing size={16} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-900">Notifications</p>
                <p className="text-xs text-ink-500">Daily safe-to-spend and reminders</p>
              </div>
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
            <button
              onClick={() => window.history.back()}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-ink-50 transition"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                <Sparkles size={16} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-900">View notifications</p>
                <p className="text-xs text-ink-500">See recent reminders and insights</p>
              </div>
              <ChevronRight size={16} className="text-ink-300 shrink-0" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSignOut} className="pt-2">
          <button
            type="submit"
            disabled={signingOut}
            className="btn-ghost w-full disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <LogOut size={16} />
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </form>
      </main>

      <BottomNav active="home" />
    </div>
  )
}
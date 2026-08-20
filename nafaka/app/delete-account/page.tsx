'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useGoogleFont } from '@/lib/fonts'
import { createClient } from '@/utils/supabase/client'
import { clearLocalFinanceState } from '@/lib/store'
import { SUPPORT_EMAIL } from '@/lib/site'
import { ChevronLeft, ShieldCheck, Trash2 } from 'lucide-react'

export default function DeleteAccountPage() {
  const display = useGoogleFont('Fraunces')
  const body = useGoogleFont('Manrope')
  const [user, setUser] = useState<{ email: string | undefined } | null>(null)
  const [checking, setChecking] = useState(true)
  const [checked, setChecked] = useState(false)
  const [working, setWorking] = useState(false)
  const [done, setDone] = useState(false)
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled && data.user) setUser({ email: data.user.email ?? undefined })
    })
    .finally(() => {
      if (!cancelled) setChecking(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const deleteHere = async () => {
    if (!checked || working) return
    setWorking(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.functions.invoke('delete-account')
      if (error) throw error
      clearLocalFinanceState()
      await supabase.auth.signOut()
      setDone(true)
    } catch {
      setStatus('Something went wrong. Please try again or contact us at ' + SUPPORT_EMAIL + '.')
    } finally {
      setWorking(false)
    }
  }

  const requestDeletion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || working) return
    setWorking(true)
    setStatus(null)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/delete-request`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), website }),
        },
      )
      if (!res.ok) throw new Error()
      setDone(true)
    } catch {
      setStatus('Could not submit your request. Please try again or email us at ' + SUPPORT_EMAIL + '.')
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: body }}>
      <div className="max-w-sm mx-auto px-6 pt-8 pb-14">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/"
            className="cursor-pointer w-9 h-9 rounded-full flex items-center justify-center border border-border text-foreground hover:bg-muted transition-colors"
            aria-label="Back"
          >
            <ChevronLeft size={18} />
          </Link>
          <h1 style={{ fontFamily: display }} className="text-lg text-foreground flex-1">
            Delete account
          </h1>
        </div>

        {checking ? (
          <div className="space-y-4" aria-busy="true">
            <div className="h-24 rounded-2xl bg-secondary/60 animate-pulse" />
            <div className="h-12 rounded-full bg-secondary/60 animate-pulse" />
          </div>
        ) : done ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-secondary/20 bg-secondary/5 p-5">
              <h2 style={{ fontFamily: display }} className="text-base font-semibold text-foreground mb-2">
                Request received
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your account has been (or will be) permanently deleted. If you requested deletion by email, we will
                confirm with you before removing anything. This can&apos;t be undone.
              </p>
            </div>
            <Link
              href="/"
              className="block w-full text-center rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground"
            >
              Back to Nafaka
            </Link>
          </div>
        ) : user ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              You&apos;re signed in as <span className="text-foreground font-medium">{user.email}</span>. Deleting your
              account permanently removes your account, your financial data, and your coaching history. This can&apos;t
              be undone.
            </p>
            <label className="flex items-start gap-3 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="mt-1 accent-brand-600"
              />
              <span>I understand this is permanent and cannot be undone.</span>
            </label>
            {status && <p role="alert" className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{status}</p>}
            <button
              onClick={deleteHere}
              disabled={!checked || working}
              className="w-full cursor-pointer flex items-center justify-center gap-2 rounded-full bg-red-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Trash2 size={15} />
              {working ? 'Deleting…' : 'Delete my account permanently'}
            </button>
          </div>
        ) : (
          <form onSubmit={requestDeletion} className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Not signed in? Enter the email address you used to create your Nafaka account and we&apos;ll send you a
              confirmation before permanently deleting your account and all associated data.
            </p>
            <label className="block">
              <span className="sr-only">Account email</span>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground outline-none focus:border-primary sm:text-sm"
              />
            </label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            {status && <p role="alert" className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{status}</p>}
            <button
              type="submit"
              disabled={working || !email.trim()}
              className="w-full cursor-pointer flex items-center justify-center gap-2 rounded-full bg-red-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              <ShieldCheck size={15} />
              {working ? 'Submitting…' : 'Request account deletion'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
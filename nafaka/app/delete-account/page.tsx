'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, CheckCircle2, AlertTriangle } from 'lucide-react'
import { useGoogleFont } from '@/lib/fonts'

export default function DeleteAccountPage() {
  const display = useGoogleFont('Fraunces')
  const body = useGoogleFont('Manrope')
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (pending) return
    setPending(true)
    setError(null)

    try {
      const response = await fetch('/api/account-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, reason, confirmation }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error === 'not_configured' ? 'The deletion service is temporarily unavailable. Please try again later.' : 'Please check the form and try again.')
      }
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10" style={{ fontFamily: body }}>
      <div className="mx-auto max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground" aria-label="Back">
            <ChevronLeft size={18} />
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Nafaka</p>
            <h1 style={{ fontFamily: display }} className="text-2xl text-foreground">Delete account</h1>
          </div>
        </div>

        {done ? (
          <section className="rounded-2xl border border-brand-200 bg-brand-50 p-6">
            <CheckCircle2 className="mb-3 text-brand-700" size={28} />
            <h2 style={{ fontFamily: display }} className="text-xl text-foreground">Request received</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              We received your account deletion request. Nafaka will process the request and delete the associated account and data, subject to any retention required by law.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">You can close this page now.</p>
          </section>
        ) : (
          <>
            <section className="mb-6 rounded-2xl border border-border bg-card p-5">
              <div className="mb-3 flex gap-3">
                <AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={20} />
                <div>
                  <h2 className="font-semibold text-foreground">What will be deleted</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Your Nafaka account and associated financial data, including transactions, commitments, goals, coaching history and financial insights, will be deleted. Some records may be retained where legally required.
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                You can also delete your account inside the app from Profile → Delete my account.
              </p>
            </section>

            <form onSubmit={submit} className="space-y-5 rounded-2xl border border-border bg-card p-5">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-foreground">Account email</label>
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm outline-none focus:border-brand-500" placeholder="you@example.com" />
              </div>

              <div>
                <label htmlFor="reason" className="mb-1.5 block text-sm font-semibold text-foreground">Reason (optional)</label>
                <textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-border bg-background px-3.5 py-3 text-sm outline-none focus:border-brand-500" placeholder="Tell us why you are leaving" />
              </div>

              <div>
                <label htmlFor="confirmation" className="mb-1.5 block text-sm font-semibold text-foreground">Confirmation</label>
                <p className="mb-2 text-xs text-muted-foreground">Type <strong>DELETE MY ACCOUNT</strong> to confirm.</p>
                <input id="confirmation" required value={confirmation} onChange={(e) => setConfirmation(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm outline-none focus:border-brand-500" placeholder="DELETE MY ACCOUNT" />
              </div>

              {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

              <button type="submit" disabled={pending} className="w-full rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50">
                {pending ? 'Submitting…' : 'Request account deletion'}
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/privacy" className="underline underline-offset-2">Privacy Policy</Link>
          {' · '}
          <Link href="/terms" className="underline underline-offset-2">Terms</Link>
        </p>
      </div>
    </main>
  )
}

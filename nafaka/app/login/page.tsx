'use client'

import React, { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useGoogleFont } from '@/lib/fonts'
import { createClient } from '@/utils/supabase/client'
import { Sparkles, Mail, Lock, LogIn, UserPlus } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const display = useGoogleFont('Fraunces')
  const body = useGoogleFont('Manrope')

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(searchParams.get('error') === 'auth' ? 'Sign-in failed. Please try again.' : null)

  const next = searchParams.get('next') ?? '/DailySnapshot'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError(null)
    setMessage(null)

    const supabase = createClient()

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push(next)
        router.refresh()
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${next}`,
          },
        })
        if (error) throw error
        setMessage('Check your inbox for a confirmation link, then sign in.')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(msg.replace(/^supabase/i, '').trim())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden" style={{ fontFamily: body }}>
      <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute top-1/3 -left-24 w-64 h-64 rounded-full bg-secondary/25 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-accent/40 blur-3xl" />

      <div className="relative max-w-sm mx-auto min-h-screen flex flex-col px-6 pt-16 pb-10">
        <Link href="/" className="flex items-center gap-2" aria-label="Nafaka home">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <Sparkles size={16} className="text-primary-foreground" />
          </div>
          <span className="text-sm tracking-[0.2em] uppercase text-muted-foreground font-semibold">Nafaka</span>
        </Link>

        <div className="mt-14 flex-1 flex flex-col justify-center">
          <h1 style={{ fontFamily: display }} className="text-4xl leading-[1.08] text-foreground font-medium mb-2">
            {mode === 'signin' ? 'Welcome back' : 'Start your plan'}
          </h1>
          <p className="text-muted-foreground text-base mb-8">
            {mode === 'signin'
              ? 'Sign in to your Nafaka account.'
              : 'Create an account — takes about a minute.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <label className="block">
              <span className="sr-only">Email</span>
              <div className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3.5 focus-within:border-primary transition-colors">
                <Mail size={17} className="text-muted-foreground shrink-0" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm min-w-0"
                />
              </div>
            </label>

            <label className="block">
              <span className="sr-only">Password</span>
              <div className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3.5 focus-within:border-primary transition-colors">
                <Lock size={17} className="text-muted-foreground shrink-0" />
                <input
                  type="password"
                  required
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm min-w-0"
                />
              </div>
            </label>

            {error && (
              <p role="alert" className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {error.replace(/^: /, '')}
              </p>
            )}
            {message && (
              <p role="status" className="text-sm text-primary bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer w-full flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold py-4 text-base hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="animate-pulse">Please wait…</span>
              ) : mode === 'signin' ? (
                <>
                  <LogIn size={17} /> Sign in
                </>
              ) : (
                <>
                  <UserPlus size={17} /> Create account
                </>
              )}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setError(null)
              setMessage(null)
            }}
            className="cursor-pointer mt-6 text-center text-sm text-primary hover:underline"
          >
            {mode === 'signin' ? 'New here? Create an account' : 'Already have an account? Sign in'}
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Your data is protected with row-level security.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginForm />
    </Suspense>
  )
}
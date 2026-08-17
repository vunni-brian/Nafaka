'use client'

import React, { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useGoogleFont } from '@/lib/fonts'
import { createClient } from '@/utils/supabase/client'
import { track } from '@/lib/analytics'
import { Sparkles, Mail, Lock, LogIn, UserPlus, Smartphone, ShieldCheck } from 'lucide-react'

function GoogleIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a11.99 11.99 0 0 0 0 10.76l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42A11.99 11.99 0 0 0 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const display = useGoogleFont('Fraunces')
  const body = useGoogleFont('Manrope')

  const [mode, setMode] = useState<'signin' | 'signup' | 'phone'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(searchParams.get('error') === 'auth' ? 'Sign-in failed. Please try again.' : null)

  const next = searchParams.get('next') ?? '/DailySnapshot'

  const handleGoogle = async () => {
    if (loading) return
    setLoading(true)
    setError(null)
    setMessage(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
      },
    })
    if (error) {
      setError(error.message.replace(/^supabase/i, '').trim())
      setLoading(false)
      return
    }
    track('signed_in', { method: 'google' })
  }

  const handlePhoneSend = async () => {
    if (loading) return
    setLoading(true)
    setError(null)
    setMessage(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: { shouldCreateUser: true },
    })
    if (error) {
      setError(error.message.replace(/^supabase/i, '').trim())
      setLoading(false)
      return
    }
    setOtpSent(true)
    setLoading(false)
  }

  const handlePhoneVerify = async () => {
    if (loading) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' })
    if (error) {
      setError(error.message.replace(/^supabase/i, '').trim())
      setLoading(false)
      return
    }
    track('signed_in', { method: 'phone_otp' })
    router.push(next)
    router.refresh()
  }

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
        track('signed_in', { method: 'email_password' })
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
        track('signed_up', { method: 'email' })
        setMessage('Check your inbox for a confirmation link, then sign in.')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(msg.replace(/^supabase/i, '').trim())
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'flex w-full items-center gap-3 rounded-xl2 border border-ink-200 bg-white px-4 py-3.5 focus-within:border-brand-500 transition-colors'

  return (
    <div className="min-h-screen bg-ink-50 relative overflow-hidden" style={{ fontFamily: body }}>
      <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-brand-500/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-accent-500/10 blur-3xl" />

      <div className="relative max-w-md mx-auto min-h-screen flex flex-col px-6 pt-12 pb-10">
        <Link href="/" className="flex items-center gap-2" aria-label="Nafaka home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-glow">
            <Sparkles size={17} />
          </span>
          <span className="font-display text-xl font-semibold text-ink-900 tracking-tight">Nafaka</span>
        </Link>

        <div className="mt-14 flex-1 flex flex-col justify-center animate-fade-up">
          <h1 style={{ fontFamily: display }} className="font-display text-4xl leading-[1.08] font-medium text-ink-900 mb-2">
            {mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Start your plan' : 'Sign in with your number'}
          </h1>
          <p className="text-ink-500 text-base mb-8">
            {mode === 'signin'
              ? 'Sign in to your Nafaka account.'
              : mode === 'signup'
                ? 'Create an account — takes about a minute.'
                : 'We\'ll text you a code. No email or password needed.'}
          </p>

          {mode === 'phone' ? (
            <div className="space-y-4">
              {!otpSent ? (
                <>
                  <label className="block">
                    <span className="sr-only">Phone number</span>
                    <div className={inputClass}>
                      <Smartphone size={17} className="text-ink-400 shrink-0" />
                      <input
                        type="tel"
                        required
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder="+256 700 000 000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-ink-900 placeholder:text-ink-400 text-sm min-w-0"
                      />
                    </div>
                  </label>
                  <button
                    type="button"
                    onClick={handlePhoneSend}
                    disabled={loading || phone.trim().length < 8}
                    className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? <span className="animate-pulse">Please wait…</span> : <>Send code</>}
                  </button>
                </>
              ) : (
                <>
                  <label className="block">
                    <span className="sr-only">Verification code</span>
                    <div className={inputClass}>
                      <ShieldCheck size={17} className="text-ink-400 shrink-0" />
                      <input
                        type="text"
                        required
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="6-digit code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 bg-transparent outline-none text-ink-900 placeholder:text-ink-400 text-sm min-w-0"
                      />
                    </div>
                  </label>
                  <button
                    type="button"
                    onClick={handlePhoneVerify}
                    disabled={loading || otp.length < 4}
                    className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? <span className="animate-pulse">Please wait…</span> : <>Verify &amp; sign in</>}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp('') }}
                    className="cursor-pointer w-full text-center text-sm text-brand-700 hover:underline"
                  >
                    Use a different number
                  </button>
                </>
              )}
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <label className="block">
              <span className="sr-only">Email</span>
              <div className={inputClass}>
                <Mail size={17} className="text-ink-400 shrink-0" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-ink-900 placeholder:text-ink-400 text-sm min-w-0"
                />
              </div>
            </label>

            <label className="block">
              <span className="sr-only">Password</span>
              <div className={inputClass}>
                <Lock size={17} className="text-ink-400 shrink-0" />
                <input
                  type="password"
                  required
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-ink-900 placeholder:text-ink-400 text-sm min-w-0"
                />
              </div>
            </label>

            {error && (
              <p role="alert" className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {error.replace(/^: /, '')}
              </p>
            )}
            {message && (
              <p role="status" className="text-sm text-brand-700 bg-brand-50 border border-brand-500/20 rounded-xl px-4 py-3">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
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
          )}

          {error && mode === 'phone' && (
            <p role="alert" className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error.replace(/^: /, '')}
            </p>
          )}
          {message && mode === 'phone' && (
            <p role="status" className="text-sm text-brand-700 bg-brand-50 border border-brand-500/20 rounded-xl px-4 py-3">
              {message}
            </p>
          )}

          <div className="flex items-center gap-3 my-6" role="separator">
            <div className="h-px flex-1 bg-ink-200" />
            <span className="text-xs text-ink-400">or</span>
            <div className="h-px flex-1 bg-ink-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="cursor-pointer w-full flex items-center justify-center gap-3 rounded-xl2 border border-ink-200 bg-white text-ink-900 font-semibold py-4 text-base hover:bg-ink-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === 'phone' ? 'signin' : mode === 'signin' ? 'signup' : 'signin')
              setError(null)
              setMessage(null)
            }}
            className="cursor-pointer mt-6 text-center text-sm text-brand-700 hover:underline"
          >
            {mode === 'phone'
              ? 'Prefer email? Sign in with email'
              : mode === 'signin'
                ? 'New here? Create an account'
                : 'Already have an account? Sign in'}
          </button>

          {mode !== 'phone' && (
            <button
              type="button"
              onClick={() => {
                setMode('phone')
                setError(null)
                setMessage(null)
              }}
              className="cursor-pointer mt-3 text-center text-sm text-ink-500 hover:underline"
            >
              Use your phone number instead
            </button>
          )}
        </div>

        <p className="text-center text-xs text-ink-400">
          Your data is protected with row-level security.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink-50" />}>
      <LoginForm />
    </Suspense>
  )
}
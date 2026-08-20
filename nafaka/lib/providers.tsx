'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { FinancialProvider, useFinance } from '@/lib/store'
import { initAnalytics, identify, pageview, resetAnalytics } from '@/lib/analytics'
import FeedbackButton from '@/components/FeedbackButton'
import AnalyticsConsent from '@/components/AnalyticsConsent'
import OfflineBanner from '@/components/OfflineBanner'
import { ToastProvider } from '@/components/Toast'
import { NativeAuthBridge } from '@/components/NativeAuthBridge'

function HydrationSkeleton() {
  return (
    <div className="min-h-screen bg-ink-50" aria-busy="true">
      <div className="mx-auto w-full max-w-md px-5 pt-8 space-y-6">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
            <Sparkles size={17} />
          </span>
          <span className="font-display text-xl font-semibold text-ink-900 tracking-tight">Nafaka</span>
        </div>
        <div className="h-40 rounded-[1.25rem] bg-gradient-to-br from-ink-900 via-ink-900 to-brand-950" />
        <div className="space-y-2">
          <div className="h-3 rounded-full bg-ink-100 overflow-hidden relative">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-ink-200/60 to-transparent animate-shimmer" />
          </div>
          <div className="h-3 w-4/5 rounded-full bg-ink-100 overflow-hidden relative">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-ink-200/60 to-transparent animate-shimmer" />
          </div>
          <div className="h-3 w-2/3 rounded-full bg-ink-100 overflow-hidden relative">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-ink-200/60 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  )
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { isOnboarded, isHydrated } = useFinance()
  const pathname = usePathname()
  const router = useRouter()

  const isPublic =
    pathname === '/' || pathname === '/login' || pathname === '/Onboarding' || pathname === '/privacy' || pathname === '/terms' || pathname === '/delete-account' || pathname.startsWith('/auth/')

  useEffect(() => {
    if (isHydrated && !isOnboarded && !isPublic) router.replace('/Onboarding')
  }, [isHydrated, isOnboarded, isPublic, router])

  if (!isHydrated) return <>{isPublic ? children : <HydrationSkeleton />}</>
  return <>{children}</>
}

function Analytics() {
  const pathname = usePathname()
  const { user } = useFinance()
  const lastUserId = useRef<string | null>(null)

  useEffect(() => {
    if (window.localStorage.getItem('nafaka-analytics-consent-v1') === 'accepted') initAnalytics()
  }, [])

  useEffect(() => {
    if (user) {
      identify(user.id)
      lastUserId.current = user.id
    } else if (lastUserId.current) {
      resetAnalytics()
      lastUserId.current = null
    }
  }, [user])

  useEffect(() => {
    pageview()
  }, [pathname])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FinancialProvider>
      <Analytics />
      <NativeAuthBridge />
      <OfflineBanner />
      <ToastProvider>
        <OnboardingGuard>
          {children}
          <FeedbackButton />
          <AnalyticsConsent />
        </OnboardingGuard>
      </ToastProvider>
    </FinancialProvider>
  )
}

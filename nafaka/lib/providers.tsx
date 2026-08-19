'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { FinancialProvider, useFinance } from '@/lib/store'
import { initAnalytics, identify, pageview, resetAnalytics } from '@/lib/analytics'
import FeedbackButton from '@/components/FeedbackButton'
import AnalyticsConsent from '@/components/AnalyticsConsent'
import { NativeAuthBridge } from '@/components/NativeAuthBridge'

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { isOnboarded, isHydrated } = useFinance()
  const pathname = usePathname()
  const router = useRouter()

  const isPublic =
    pathname === '/' || pathname === '/login' || pathname === '/Onboarding' || pathname === '/privacy' || pathname === '/terms' || pathname === '/delete-account' || pathname.startsWith('/auth/')

  useEffect(() => {
    if (isHydrated && !isOnboarded && !isPublic) router.replace('/Onboarding')
  }, [isHydrated, isOnboarded, isPublic, router])

  if (!isHydrated) return <>{isPublic ? children : null}</>
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
      <OnboardingGuard>
        {children}
        <FeedbackButton />
        <AnalyticsConsent />
      </OnboardingGuard>
    </FinancialProvider>
  )
}

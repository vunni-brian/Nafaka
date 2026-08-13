'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { FinancialProvider, useFinance } from '@/lib/store'
import { initAnalytics, pageview } from '@/lib/analytics'
import FeedbackButton from '@/components/FeedbackButton'

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { isOnboarded, isHydrated } = useFinance()
  const pathname = usePathname()
  const router = useRouter()

  const isPublic =
    pathname === '/' || pathname === '/login' || pathname === '/Onboarding' || pathname === '/privacy' || pathname === '/terms' || pathname.startsWith('/auth/')

  useEffect(() => {
    if (isHydrated && !isOnboarded && !isPublic) {
      router.replace('/Onboarding')
    }
  }, [isHydrated, isOnboarded, isPublic, router])

  if (!isHydrated) {
    return <>{isPublic ? children : null}</>
  }

  return <>{children}</>
}

function Analytics() {
  const pathname = usePathname()

  useEffect(() => {
    initAnalytics()
  }, [])

  useEffect(() => {
    pageview()
  }, [pathname])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FinancialProvider>
      <Analytics />
      <OnboardingGuard>
        {children}
        <FeedbackButton />
      </OnboardingGuard>
    </FinancialProvider>
  )
}
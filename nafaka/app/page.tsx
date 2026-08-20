'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFinance } from '@/lib/store'

export default function Welcome() {
  const router = useRouter()
  const { isHydrated, isOnboarded } = useFinance()

  useEffect(() => {
    if (!isHydrated) return
    router.replace(isOnboarded ? '/DailySnapshot' : '/Onboarding')
  }, [isHydrated, isOnboarded, router])

  return null
}
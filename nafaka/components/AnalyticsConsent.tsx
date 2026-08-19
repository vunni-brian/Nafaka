'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { initAnalytics } from '@/lib/analytics'

const CONSENT_KEY = 'nafaka-analytics-consent-v1'
const emptySubscribe = () => () => {}

export default function AnalyticsConsent() {
  const visible = useSyncExternalStore(
    emptySubscribe,
    () => window.localStorage.getItem(CONSENT_KEY) === null,
    () => false,
  )

  useEffect(() => {
    if (window.localStorage.getItem(CONSENT_KEY) === 'accepted') initAnalytics()
  }, [])

  const choose = (accepted: boolean) => {
    window.localStorage.setItem(CONSENT_KEY, accepted ? 'accepted' : 'declined')
    if (accepted) initAnalytics()
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] border-t border-ink-200 bg-white px-4 py-3 shadow-lg md:bottom-4 md:left-4 md:right-auto md:max-w-md md:rounded-2xl md:border">
      <p className="text-xs leading-relaxed text-ink-600">
        Nafaka uses privacy-conscious analytics to understand how people use the app and improve it. Analytics is optional and does not affect core features. You can change your choice by clearing this site&apos;s data.
      </p>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => choose(false)} className="flex-1 cursor-pointer rounded-xl border border-ink-200 px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-ink-50">
          Decline
        </button>
        <button type="button" onClick={() => choose(true)} className="flex-1 cursor-pointer rounded-xl bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700">
          Allow analytics
        </button>
      </div>
    </div>
  )
}
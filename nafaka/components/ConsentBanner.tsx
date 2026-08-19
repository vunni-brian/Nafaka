'use client'

import React, { useSyncExternalStore, useState } from 'react'
import Link from 'next/link'
import { getConsent, setConsent } from '@/lib/analytics'

const emptySubscribe = () => () => {}

export default function ConsentBanner() {
  const [dismissed, setDismissed] = useState(false)
  const needsConsent = useSyncExternalStore(
    emptySubscribe,
    () => !dismissed && getConsent() === null,
    () => false,
  )

  if (!needsConsent) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] bg-ink-900 text-white px-5 py-4">
      <p className="text-xs leading-relaxed text-white/80 mb-3">
        Nafaka uses analytics to understand how the app is used and improve it. No bank details or personal
        information beyond basic usage is collected. See the{' '}
        <Link href="/privacy" className="underline text-white">
          Privacy Policy
        </Link>
        .
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => { setConsent('granted'); setDismissed(true) }}
          className="flex-1 cursor-pointer rounded-full bg-brand-600 py-2.5 text-xs font-semibold text-white hover:bg-brand-700 transition"
        >
          Accept
        </button>
        <button
          onClick={() => { setConsent('declined'); setDismissed(true) }}
          className="flex-1 cursor-pointer rounded-full border border-white/30 py-2.5 text-xs font-semibold text-white/80 hover:bg-white/10 transition"
        >
          Decline
        </button>
      </div>
    </div>
  )
}
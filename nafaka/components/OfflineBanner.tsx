'use client'

import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export default function OfflineBanner() {
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine)

  useEffect(() => {
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  if (!offline) return null

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-14 z-40 flex items-center justify-center gap-2 border-b border-accent-200 bg-accent-50 px-4 py-2 text-xs font-medium text-accent-700 md:top-0"
    >
      <WifiOff size={13} aria-hidden="true" />
      <span>You&apos;re offline — your entries will sync when you&apos;re back online.</span>
    </div>
  )
}
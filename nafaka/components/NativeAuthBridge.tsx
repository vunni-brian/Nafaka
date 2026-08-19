'use client'

import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'

/** Bridges native OAuth deep links back into the existing web callback route. */
export function NativeAuthBridge() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const listener = App.addListener('appUrlOpen', (data) => {
      const url = new URL(data.url)
      if (url.pathname !== '/auth/callback') return

      const code = url.searchParams.get('code')
      if (!code) {
        window.location.assign(`${window.location.origin}/login?error=auth`)
        return
      }

      const target = new URL('/auth/callback', window.location.origin)
      target.searchParams.set('code', code)
      const next = url.searchParams.get('next')
      if (next) target.searchParams.set('next', next)
      window.location.assign(target.toString())
    })

    return () => {
      void listener.then((l) => l.remove())
    }
  }, [])

  return null
}

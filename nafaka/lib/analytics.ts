import posthog from 'posthog-js'

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'

let initialized = false

/** Initialize PostHog once. Safe no-op until NEXT_PUBLIC_POSTHOG_KEY is set. */
export function initAnalytics(): void {
  if (!POSTHOG_KEY || initialized || typeof window === 'undefined') return
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false,
    capture_pageleave: false,
  })
  initialized = true
}

/** Capture a named event with optional properties. No-op when analytics is off. */
export function track(event: string, props?: Record<string, unknown>): void {
  if (!initialized) return
  posthog.capture(event, props)
}

/** Track a page view. No-op when analytics is off. */
export function pageview(): void {
  if (!initialized) return
  posthog.capture('$pageview')
}

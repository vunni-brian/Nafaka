import posthog from 'posthog-js'

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ?? process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'
const CONSENT_KEY = 'nafaka-analytics-consent'

let initialized = false

export function getConsent(): 'granted' | 'declined' | null {
  if (typeof window === 'undefined') return null
  const value = window.localStorage.getItem(CONSENT_KEY)
  if (value === 'granted' || value === 'declined') return value
  return null
}

export function setConsent(value: 'granted' | 'declined'): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CONSENT_KEY, value)
  if (value === 'granted') {
    initAnalytics()
  } else if (initialized) {
    posthog.opt_out_capturing()
  }
}

/** Initialize PostHog once. Only starts when the user has granted analytics consent. */
export function initAnalytics(): void {
  if (!POSTHOG_KEY || initialized || typeof window === 'undefined') return
  if (getConsent() !== 'granted') return
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false,
    capture_pageleave: false,
    person_profiles: 'identified_only',
    opt_out_capturing_by_default: false,
  })
  initialized = true
}

/** Link the current browser session to a logged-in user. No-op when analytics is off. */
export function identify(userId: string): void {
  if (!initialized) return
  posthog.identify(userId)
}

/** Forget the current user after sign-out so sessions stay separate. No-op when analytics is off. */
export function resetAnalytics(): void {
  if (!initialized) return
  posthog.reset()
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

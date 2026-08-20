'use client'

import React from 'react'
import { clearLocalFinanceState } from '@/lib/store'

type Props = { children: React.ReactNode }
type State = { error: Error | null }

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  private handleReset = () => {
    this.setState({ error: null })
  }

  private handleWipe = () => {
    clearLocalFinanceState()
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      return (
        <main id="main" className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink-50 px-6 text-center" style={{ fontFamily: 'Manrope, sans-serif' }}>
          <p className="font-display text-2xl font-semibold text-ink-900">Something went wrong</p>
          <p className="max-w-sm text-sm leading-relaxed text-ink-500">
            Nafaka hit an unexpected error. If it keeps happening, reset your local data — nothing is lost that
            hasn&apos;t been synced.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="cursor-pointer rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={this.handleWipe}
              className="cursor-pointer rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50"
            >
              Reset my data
            </button>
          </div>
        </main>
      )
    }
    return this.props.children
  }
}
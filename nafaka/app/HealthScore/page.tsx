'use client'

import React from 'react'
import BottomNav from '@/components/BottomNav'
import AppHeader from '@/components/AppHeader'
import { useGoogleFont } from '@/lib/fonts'
import { TrendingUp, ShieldCheck, Heart, Sparkles, Lock } from 'lucide-react'
import { useFinance } from '@/lib/store'
import { computeHealthScore, type HealthComponentKey } from '@/lib/brain/health'
import { componentSuggestion, weakestReadyComponent } from '@/lib/brain/focus'
import { tierLabel } from '@/lib/brain/describe'
import { Ring, SectionTitle } from '@/components/proto/ui'
import LearningState from '@/components/proto/LearningState'

const noteFor: Record<HealthComponentKey, string> = {
  consistency: 'Spending steadiness across days',
  commitment: 'On-time recurring payments',
  savings: 'Balance building week over week',
  debt: 'Obligations as a share of income',
  resilience: 'Days of buffer for essentials',
}

export default function HealthScore() {
  const body = useGoogleFont('Manrope')
  const { behaviorModel, profile } = useFinance()

  const health = computeHealthScore(behaviorModel)
  const score = health.score
  const weakest = weakestReadyComponent(health.components)
  const confidencePctValue = Math.round(behaviorModel.confidence * 100)

  const statusColor = (s: 'good' | 'ok' | 'watch') =>
    s === 'good' ? 'text-brand-700' : s === 'ok' ? 'text-ink-600' : 'text-accent-700'
  const statusBg = (s: 'good' | 'ok' | 'watch') =>
    s === 'good' ? 'bg-brand-500' : s === 'ok' ? 'bg-ink-400' : 'bg-accent-500'

  // Health score unlocks at 70% confidence
  if (score === null) {
    return (
      <div className="min-h-screen bg-ink-50 pb-28 md:pb-10 md:pl-64" style={{ fontFamily: body }}>
        <AppHeader />
        <main id="main" className="mx-auto w-full max-w-md px-5 pt-4 md:max-w-3xl md:px-8 space-y-6 animate-fade-up">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">Financial Health</h1>
            <p className="text-sm text-ink-500 mt-1">Measured by behavior, not by how much you earn.</p>
          </div>
          {confidencePctValue < 40 ? (
            <LearningState confidence={confidencePctValue} dataPoints={behaviorModel.dataPoints} />
          ) : (
            <>
              <div className="card p-6 text-center">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 text-ink-400">
                  <Lock size={24} />
                </span>
                <p className="mt-4 font-display text-lg font-semibold text-ink-900">Unlocks at 70% confidence</p>
                <p className="mt-2 text-sm text-ink-500 max-w-xs mx-auto leading-relaxed">
                  Your Financial Health Score needs about 3 months of behavior to be accurate. Right now you&rsquo;re at {confidencePctValue}%.
                </p>
                <div className="mt-4 max-w-[180px] mx-auto">
                  <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${confidencePctValue}%`, transition: 'width 0.8s ease' }} />
                  </div>
                  <p className="text-[11px] text-ink-400 mt-1.5">{confidencePctValue}% of 70% needed</p>
                </div>
              </div>
              <div className="card p-4 border-brand-100 bg-brand-50/50">
                <div className="flex items-start gap-3">
                  <ShieldCheck size={18} className="text-brand-700 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-ink-900">Nafaka never punishes you</p>
                    <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                      Irregular income isn&rsquo;t bad. High spending isn&rsquo;t automatically bad. Supporting family isn&rsquo;t bad. Your score reflects behavior in context &mdash; never judgment.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
        <BottomNav active="score" />
      </div>
    )
  }

  const dimensions = health.components.map((c) => ({
    label: c.label,
    score: Math.round(c.value),
    status: (c.value >= 75 ? 'good' : c.value >= 50 ? 'ok' : 'watch') as 'good' | 'ok' | 'watch',
    note: c.ready ? noteFor[c.key] : 'Still learning',
  }))

  return (
    <div className="min-h-screen bg-ink-50 pb-28 md:pb-10 md:pl-64" style={{ fontFamily: body }}>
      <AppHeader />
      <main id="main" className="mx-auto w-full max-w-md px-5 pt-4 md:max-w-6xl md:px-10 space-y-6 animate-fade-up">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Financial Health</h1>
          <p className="text-sm text-ink-500 mt-1">Measured by behavior, not by how much you earn.</p>
        </div>

        <div className="md:grid md:grid-cols-3 md:gap-6 md:items-start">
        {/* Score hero */}
        <div className="card p-6 flex flex-col items-center text-center md:row-start-1 md:col-start-1 md:col-span-2">
          <Ring value={score} size={148} stroke={12} label={`${score}`} sublabel="of 100" tone="brand" />
          <div className="mt-4 flex items-center gap-1.5">
            <TrendingUp size={15} className="text-brand-600" />
            <p className="text-sm font-semibold text-brand-700">{tierLabel(behaviorModel.confidenceTier)}</p>
          </div>
          <p className="text-xs text-ink-500 mt-2 max-w-xs">
            Your score blends resilience, commitment reliability, income stability, spending control, savings habit, and social balance.
          </p>
          <div className="mt-3">
            <span className="pill bg-brand-100 text-brand-700">
              <Sparkles size={12} /> Based on {behaviorModel.dataPoints} records &middot; {confidencePctValue}% confidence
            </span>
          </div>
        </div>

        {/* Personality teaser */}
        <div className="card p-4 bg-gradient-to-br from-brand-50 to-white md:row-start-1 md:col-start-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Heart size={20} />
            </span>
            <div>
              <p className="text-xs font-medium text-ink-500">Your emerging financial personality</p>
              <p className="font-display text-lg font-semibold text-ink-900">
                {profile.archetype || 'The patient builder'}
              </p>
            </div>
          </div>
          <p className="text-xs text-ink-600 mt-3 leading-relaxed">
            {weakest ? componentSuggestion(weakest.key) : 'Your behavior model is still assembling — keep logging and this fills in.'}
          </p>
          <p className="text-[10px] text-ink-400 mt-2">Locks in at 90% confidence (~3 months of data).</p>
        </div>

        {/* Dimensions */}
        <div className="md:row-start-2 md:col-start-1 md:col-span-2">
          <SectionTitle title="Score breakdown" hint={`${health.readyCount} behavioral dimensions`} />
          <div className="space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
            {dimensions.map((d) => (
              <div key={d.label} className="card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${statusBg(d.status)}`} />
                    <p className="text-sm font-semibold text-ink-900">{d.label}</p>
                  </div>
                  <p className={`text-lg font-bold tabular-nums ${statusColor(d.status)}`}>{d.score}</p>
                </div>
                <div className="mt-2.5 h-1.5 w-full rounded-full bg-ink-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${statusBg(d.status)}`}
                    style={{ width: `${d.score}%`, transition: 'width 0.8s ease' }}
                  />
                </div>
                <p className="text-xs text-ink-500 mt-1.5">{d.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Judgment filter note */}
        <div className="card p-4 border-brand-100 bg-brand-50/50 md:row-start-2 md:col-start-3">
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} className="text-brand-700 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-ink-900">Nafaka never punishes you</p>
              <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                Irregular income isn&rsquo;t bad. High spending isn&rsquo;t automatically bad. Supporting family isn&rsquo;t bad. Every insight is reframed with your context first.
              </p>
            </div>
          </div>
        </div>
        </div>
      </main>

      <BottomNav active="score" />
    </div>
  )
}
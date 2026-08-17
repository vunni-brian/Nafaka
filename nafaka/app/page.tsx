'use client'

import React from 'react'
import Link from 'next/link'
import { useGoogleFont } from '@/lib/fonts'
import { TrendingUp, HandHeart, ListChecks, Brain, RefreshCw, ArrowRight, Sparkles } from 'lucide-react'

export default function Welcome() {
  const display = useGoogleFont('Fraunces')
  const body = useGoogleFont('Manrope')

  return (
    <div className="min-h-screen bg-ink-950 relative overflow-hidden" style={{ fontFamily: body }}>
      <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="absolute top-1/3 -left-24 w-64 h-64 rounded-full bg-accent-500/15 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-ink-700/30 blur-3xl" />

      <div className="relative max-w-md mx-auto min-h-screen flex flex-col px-6 pt-12 pb-10">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-glow">
            <Sparkles size={20} />
          </span>
          <span className="font-display text-xl font-semibold text-white tracking-tight">Nafaka</span>
        </div>

        <div className="mt-14 flex-1 flex flex-col animate-fade-up">
          <p className="text-sm font-semibold text-brand-400 mb-4 tracking-wide">An AI Financial Operating System</p>
          <h1 style={{ fontFamily: display }} className="font-display text-5xl leading-[1.05] font-medium text-white mb-6">
            Your money
            <br />
            changes.
            <br />
            <span className="italic text-brand-400">Your plan should too.</span>
          </h1>
          <p className="text-white/70 text-base leading-relaxed max-w-[30ch]">
            An AI coach that adapts to how your money actually moves — whether income is steady, seasonal, or somewhere in between.
          </p>
          <p className="text-white/70 text-base leading-relaxed max-w-[32ch] mt-3">
            If this month is a market day, not a payday, your plan for tithe, savings, and bills adjusts automatically.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 rounded-xl2 border border-white/10 bg-white/5 px-4 py-3.5">
              <div className="w-9 h-9 rounded-full bg-accent-500/20 flex items-center justify-center shrink-0">
                <TrendingUp size={17} className="text-accent-400" />
              </div>
              <p className="text-sm text-white">Learns your patterns, not just your categories</p>
            </div>
            <div className="flex items-center gap-3 rounded-xl2 border border-white/10 bg-white/5 px-4 py-3.5">
              <div className="w-9 h-9 rounded-full bg-brand-500/20 flex items-center justify-center shrink-0">
                <HandHeart size={17} className="text-brand-400" />
              </div>
              <p className="text-sm text-white">Respects tithe, cell meetings, and family support</p>
            </div>
          </div>

          <div className="mt-10">
            <h2 style={{ fontFamily: display }} className="font-display text-2xl leading-snug font-medium text-white mb-4">
              How it works
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-xl2 border border-white/10 bg-white/5 px-4 py-3.5">
                <div className="w-9 h-9 rounded-full bg-accent-500/20 flex items-center justify-center shrink-0">
                  <ListChecks size={17} className="text-accent-400" />
                </div>
                <p className="text-sm text-white">
                  <span className="font-semibold">Tell Nafaka about your money.</span> A few questions, about 2 minutes.
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-xl2 border border-white/10 bg-white/5 px-4 py-3.5">
                <div className="w-9 h-9 rounded-full bg-brand-500/20 flex items-center justify-center shrink-0">
                  <Brain size={17} className="text-brand-400" />
                </div>
                <p className="text-sm text-white">
                  <span className="font-semibold">It learns your rhythm.</span> Paydays, market days, and the slow weeks between.
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-xl2 border border-white/10 bg-white/5 px-4 py-3.5">
                <div className="w-9 h-9 rounded-full bg-ink-700/50 flex items-center justify-center shrink-0">
                  <RefreshCw size={17} className="text-ink-300" />
                </div>
                <p className="text-sm text-white">
                  <span className="font-semibold">Your plan adjusts as life changes.</span> No rebuilding from scratch.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <Link
            href="/Onboarding"
            className="cursor-pointer w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white py-4 text-base font-semibold text-ink-900 transition hover:bg-white/90 active:scale-[0.98]"
          >
            Get started
            <ArrowRight size={17} />
          </Link>
          <p className="text-center text-xs text-white/50 mt-4">
            No bank connection or card needed · Adjust or stop anytime
          </p>
          <p className="text-center text-xs text-white/50 mt-2 italic">
            Nafaka means &ldquo;harvest&rdquo; in Swahili — a plan that grows with every season of income.
          </p>
          <p className="text-center text-[11px] text-white/40 mt-4 leading-relaxed">
            Nafaka is not a bank. We don&rsquo;t hold, move, or invest your money — and we don&rsquo;t provide
            financial advice.
          </p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <Link href="/privacy" className="cursor-pointer text-xs text-white/50 hover:text-white transition">
              Privacy Policy
            </Link>
            <span className="text-white/30 text-xs">·</span>
            <Link href="/terms" className="cursor-pointer text-xs text-white/50 hover:text-white transition">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
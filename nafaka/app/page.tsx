'use client'

import React from 'react'
import Link from 'next/link'
import { useGoogleFont } from '@/lib/fonts'
import { TrendingUp, HandHeart, ListChecks, Brain, RefreshCw } from 'lucide-react'
import Image from 'next/image'

export default function Welcome() {
  const display = useGoogleFont('Fraunces')
  const body = useGoogleFont('Manrope')

  return (
    <div className="min-h-screen bg-background relative overflow-hidden" style={{ fontFamily: body }}>
      <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute top-1/3 -left-24 w-64 h-64 rounded-full bg-brand-300/30 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-accent-300/35 blur-3xl" />

      <div className="relative max-w-sm mx-auto min-h-screen flex flex-col px-6 pt-16 pb-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl overflow-hidden bg-card border border-border flex items-center justify-center shrink-0">
            <Image src="/nafaka-logo.png" alt="Nafaka logo" width={122} height={113} className="w-full h-full object-contain" />
          </div>
          <span className="text-sm tracking-[0.2em] uppercase text-muted-foreground font-semibold">Nafaka</span>
        </div>

        <div className="mt-14 flex-1 flex flex-col">
          <p className="text-sm font-semibold text-secondary mb-4 tracking-wide">An AI Financial Operating System</p>
          <h1
            style={{ fontFamily: display }}
            className="text-5xl leading-[1.05] text-foreground font-medium mb-6"
          >
            Your money
            <br />
            changes.
            <br />
            <span className="italic text-primary">Your plan should too.</span>
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-[30ch]">
            An AI coach that adapts to how your money actually moves — whether income is steady, seasonal, or somewhere in between.
          </p>
          <p className="text-muted-foreground text-base leading-relaxed max-w-[32ch] mt-3">
            If this month is a market day, not a payday, your plan for tithe, savings, and bills adjusts automatically.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3.5">
              <div className="w-9 h-9 rounded-full bg-secondary/15 flex items-center justify-center shrink-0">
                <TrendingUp size={17} className="text-secondary" />
              </div>
              <p className="text-sm text-foreground">Learns your patterns, not just your categories</p>
            </div>
            <div className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3.5">
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <HandHeart size={17} className="text-primary" />
              </div>
              <p className="text-sm text-foreground">Respects tithe, cell meetings, and family support</p>
            </div>
          </div>

          <div className="mt-10">
            <h2 style={{ fontFamily: display }} className="text-2xl leading-snug text-foreground font-medium mb-4">
              How it works
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-card border border-border rounded-2xl px-4 py-3.5">
                <div className="w-9 h-9 rounded-full bg-secondary/15 flex items-center justify-center shrink-0">
                  <ListChecks size={17} className="text-secondary" />
                </div>
                <p className="text-sm text-foreground">
                  <span className="font-semibold">Tell Nafaka about your money.</span> A few questions, about 2 minutes.
                </p>
              </div>
              <div className="flex items-start gap-3 bg-card border border-border rounded-2xl px-4 py-3.5">
                <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <Brain size={17} className="text-primary" />
                </div>
                <p className="text-sm text-foreground">
                  <span className="font-semibold">It learns your rhythm.</span> Paydays, market days, and the slow weeks between.
                </p>
              </div>
              <div className="flex items-start gap-3 bg-card border border-border rounded-2xl px-4 py-3.5">
                <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                  <RefreshCw size={17} className="text-accent" />
                </div>
                <p className="text-sm text-foreground">
                  <span className="font-semibold">Your plan adjusts as life changes.</span> No rebuilding from scratch.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <Link
            href="/Onboarding"
            className="cursor-pointer w-full flex items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold py-4 text-base hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            Get started
          </Link>
          <p className="text-center text-xs text-muted-foreground mt-4">
            No bank connection or card needed · Adjust or stop anytime
          </p>
          <p className="text-center text-xs text-muted-foreground mt-2 italic">
            Nafaka means &ldquo;harvest&rdquo; in Swahili — a plan that grows with every season of income.
          </p>
          <p className="text-center text-[11px] text-muted-foreground/70 mt-4 leading-relaxed">
            Nafaka is not a bank. We don&rsquo;t hold, move, or invest your money — and we don&rsquo;t provide
            financial advice.
          </p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <Link href="/privacy" className="cursor-pointer text-xs text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <span className="text-muted-foreground/40 text-xs">·</span>
            <Link href="/terms" className="cursor-pointer text-xs text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

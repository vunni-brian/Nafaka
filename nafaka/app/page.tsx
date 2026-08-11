'use client'

import React from 'react'
import Link from 'next/link'
import { useGoogleFont } from '@/lib/fonts'
import { Sparkles, TrendingUp, HandHeart } from 'lucide-react'

export default function Welcome() {
  const display = useGoogleFont('Fraunces')
  const body = useGoogleFont('Manrope')

  return (
    <div className="min-h-screen bg-background relative overflow-hidden" style={{ fontFamily: body }}>
      <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute top-1/3 -left-24 w-64 h-64 rounded-full bg-secondary/25 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-accent/40 blur-3xl" />

      <div className="relative max-w-sm mx-auto min-h-screen flex flex-col px-6 pt-16 pb-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <Sparkles size={16} className="text-primary-foreground" />
          </div>
          <span className="text-sm tracking-[0.2em] uppercase text-muted-foreground font-semibold">Nafaka</span>
        </div>

        <div className="mt-16 flex-1 flex flex-col justify-center">
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

          <div className="mt-10 space-y-4">
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
        </div>

        <div className="mt-10">
          <Link
            href="/Onboarding"
            className="cursor-pointer w-full flex items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold py-4 text-base hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            Get started
          </Link>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Takes about 2 minutes · No bank connection needed
          </p>
        </div>
      </div>
    </div>
  )
}

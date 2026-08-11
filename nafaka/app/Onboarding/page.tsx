'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useGoogleFont } from '@/lib/fonts'
import {
  GraduationCap,
  Briefcase,
  Laptop,
  Store,
  ShieldCheck,
  Landmark,
  PiggyBank,
  HandHeart,
  LifeBuoy,
  ChevronLeft,
  Bell,
  Check,
  Sparkles,
} from 'lucide-react'

const archetypes = [
  { key: 'student', label: 'Student', icon: GraduationCap },
  { key: 'employee', label: 'Employee', icon: Briefcase },
  { key: 'freelancer', label: 'Freelancer', icon: Laptop },
  { key: 'business', label: 'Business owner', icon: Store },
] as const

const priorities = [
  { key: 'survive', label: 'Survive the month', icon: ShieldCheck },
  { key: 'debt', label: 'Pay off debt', icon: Landmark },
  { key: 'save', label: 'Save toward a goal', icon: PiggyBank },
  { key: 'give', label: 'Keep up with giving', icon: HandHeart },
  { key: 'emergency', label: 'Build an emergency fund', icon: LifeBuoy },
] as const

export default function Onboarding() {
  const display = useGoogleFont('Fraunces')
  const body = useGoogleFont('Manrope')

  const [step, setStep] = useState(0)
  const [archetype, setArchetype] = useState<string | null>(null)
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([])
  const [balance, setBalance] = useState('')
  const [commitments, setCommitments] = useState({ cell: true, church: true, rent: false, debt: false })
  const [notifications, setNotifications] = useState<boolean | null>(null)

  const totalSteps = 6
  const progress = ((step + 1) / totalSteps) * 100

  const togglePriority = (key: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : prev.length < 3 ? [...prev, key] : prev
    )
  }

  const canContinue = () => {
    if (step === 0) return archetype !== null
    if (step === 1) return selectedPriorities.length > 0
    if (step === 2) return balance.trim().length > 0
    if (step === 4) return notifications !== null
    return true
  }

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: body }}>
      <div className="max-w-sm mx-auto min-h-screen flex flex-col px-6 pt-8 pb-10">
        <div className="flex items-center gap-3 mb-8">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="cursor-pointer w-9 h-9 rounded-full flex items-center justify-center border border-border text-foreground hover:bg-muted transition-colors"
              aria-label="Back"
            >
              <ChevronLeft size={18} />
            </button>
          ) : (
            <div className="w-9 h-9" />
          )}
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex-1">
          {step === 0 && (
            <div>
              <h1 style={{ fontFamily: display }} className="text-3xl text-foreground mb-2">
                Who are you?
              </h1>
              <p className="text-muted-foreground text-sm mb-8">This helps us shape how we talk to you.</p>
              <div className="grid grid-cols-2 gap-3">
                {archetypes.map(({ key, label, icon: Icon }) => {
                  const isActive = archetype === key
                  return (
                    <button
                      key={key}
                      onClick={() => setArchetype(key)}
                      className={`cursor-pointer rounded-2xl border p-5 flex flex-col items-start gap-3 text-left transition-colors ${
                        isActive ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-muted'
                      }`}
                    >
                      <Icon size={22} className={isActive ? 'text-primary' : 'text-secondary'} />
                      <span className="text-sm font-semibold text-foreground">{label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h1 style={{ fontFamily: display }} className="text-3xl text-foreground mb-2">
                What matters most?
              </h1>
              <p className="text-muted-foreground text-sm mb-8">Pick up to 3 priorities. No wrong answers.</p>
              <div className="space-y-3">
                {priorities.map(({ key, label, icon: Icon }) => {
                  const isActive = selectedPriorities.includes(key)
                  return (
                    <button
                      key={key}
                      onClick={() => togglePriority(key)}
                      className={`cursor-pointer w-full rounded-2xl border px-4 py-4 flex items-center gap-3 text-left transition-colors ${
                        isActive ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-muted'
                      }`}
                    >
                      <Icon size={19} className={isActive ? 'text-primary' : 'text-secondary'} />
                      <span className="text-sm font-medium text-foreground flex-1">{label}</span>
                      {isActive && (
                        <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check size={12} className="text-primary-foreground" />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 style={{ fontFamily: display }} className="text-3xl text-foreground mb-2">
                Your balance
              </h1>
              <p className="text-muted-foreground text-sm mb-8">
                What&rsquo;s in your wallet or mobile money right now? Just an estimate is fine.
              </p>
              <div className="bg-card border border-border rounded-2xl p-6">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Current balance (UGX)
                </label>
                <div className="flex items-baseline gap-2 mt-3">
                  <span style={{ fontFamily: display }} className="text-3xl text-foreground">
                    UGX
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="0"
                    className="flex-1 bg-transparent text-3xl outline-none text-foreground placeholder:text-muted-foreground"
                    style={{ fontFamily: display }}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h1 style={{ fontFamily: display }} className="text-3xl text-foreground mb-2">
                Quick commitments
              </h1>
              <p className="text-muted-foreground text-sm mb-8">Toggle what applies. We&rsquo;ll help you plan around them.</p>
              <div className="space-y-3">
                {[
                  { key: 'cell', label: 'Cell meeting', sub: 'Weekly fellowship contribution' },
                  { key: 'church', label: 'Tithe / offering', sub: 'Sunday giving' },
                  { key: 'rent', label: 'Rent', sub: 'Monthly housing payment' },
                  { key: 'debt', label: 'Debt repayment', sub: 'To a person or institution' },
                ].map(({ key, label, sub }: { key: string; label: string; sub: string }) => {
                  const active = (commitments as Record<string, boolean>)[key]
                  return (
                    <button
                      key={key}
                      onClick={() => setCommitments((c) => ({ ...c, [key]: !(c as Record<string, boolean>)[key] }))}
                      className={`cursor-pointer w-full rounded-2xl border px-4 py-4 flex items-center justify-between text-left transition-colors ${
                        active ? 'border-secondary bg-secondary/10' : 'border-border bg-card hover:bg-muted'
                      }`}
                    >
                      <span>
                        <span className="block text-sm font-semibold text-foreground">{label}</span>
                        <span className="block text-xs text-muted-foreground mt-0.5">{sub}</span>
                      </span>
                      <span
                        className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors shrink-0 ${
                          active ? 'bg-secondary justify-end' : 'bg-muted justify-start'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full bg-card shadow" />
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h1 style={{ fontFamily: display }} className="text-3xl text-foreground mb-2">
                Stay in the loop
              </h1>
              <p className="text-muted-foreground text-sm mb-8">
                A gentle check-in each morning and evening. You can turn this off anytime.
              </p>
              <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mb-4">
                  <Bell size={24} className="text-primary" />
                </div>
                <p className="text-sm text-foreground font-medium">&ldquo;Good morning. Here&rsquo;s your safe-to-spend for today.&rdquo;</p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setNotifications(true)}
                  className={`cursor-pointer w-full rounded-2xl border px-4 py-4 text-sm font-semibold transition-colors ${
                    notifications === true ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground hover:bg-muted'
                  }`}
                >
                  Yes, keep me on track
                </button>
                <button
                  onClick={() => setNotifications(false)}
                  className={`cursor-pointer w-full rounded-2xl border px-4 py-4 text-sm font-semibold transition-colors ${
                    notifications === false ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground hover:bg-muted'
                  }`}
                >
                  Not right now
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="flex flex-col items-center text-center pt-6">
              <div className="w-16 h-16 rounded-full bg-secondary/15 flex items-center justify-center mb-6">
                <Sparkles size={26} className="text-secondary" />
              </div>
              <h1 style={{ fontFamily: display }} className="text-3xl text-foreground mb-3">
                You&rsquo;re set up.
              </h1>
              <p className="text-muted-foreground text-sm mb-8 max-w-[28ch]">
                Here&rsquo;s your first insight, based on what you&rsquo;ve told us.
              </p>
              <div className="bg-card border border-border rounded-2xl p-6 text-left w-full">
                <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-3">First insight</p>
                <p className="text-sm text-foreground leading-relaxed">
                  With UGX {balance || '0'} to start and cell + tithe as priorities, we&rsquo;ll protect those commitments
                  first &mdash; then show you what&rsquo;s safe to spend on everything else.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8">
          {step < totalSteps - 1 ? (
            <button
              disabled={!canContinue()}
              onClick={() => setStep((s) => Math.min(totalSteps - 1, s + 1))}
              className={`cursor-pointer w-full rounded-full py-4 text-base font-semibold transition-colors ${
                canContinue()
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          ) : (
            <Link
              href="/DailySnapshot"
              className="cursor-pointer w-full flex items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold py-4 text-base hover:bg-primary/90 transition-colors"
            >
              Enter Nafaka
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

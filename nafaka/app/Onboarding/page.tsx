'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useGoogleFont } from '@/lib/fonts'
import { useFinance } from '@/lib/store'
import { track } from '@/lib/analytics'
import {
  Brain,
  ShieldCheck,
  Heart,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Laptop,
  Store,
  Landmark,
  PiggyBank,
  HandHeart,
  LifeBuoy,
  ChevronLeft,
  Bell,
  Check,
  Sparkles,
} from 'lucide-react'

const slides = [
  {
    icon: Brain,
    title: 'Nafaka learns, never asks',
    body: "Other apps demand your monthly income and fixed expenses. Nafaka watches how you actually handle money and builds a behavioral model of you - no forms, no judgment.",
    accent: 'from-brand-500 to-brand-700',
  },
  {
    icon: ShieldCheck,
    title: 'Confidence is always honest',
    body: "For the first few weeks I'm honest: 'I'm still learning you.' As your data grows, my coaching gets sharper. You'll always know how well I actually know you.",
    accent: 'from-accent-500 to-accent-700',
  },
  {
    icon: Heart,
    title: 'Built for how money moves here',
    body: "Mobile money, SACCOs, school fees, family support, tithe. Irregular income isn't bad. Supporting family isn't bad. Nafaka understands your context first.",
    accent: 'from-ink-700 to-ink-900',
  },
]

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

  const { completeOnboarding } = useFinance()
  const router = useRouter()

  const [slideStep, setSlideStep] = useState(0)
  const [phase, setPhase] = useState<'slides' | 'form'>('slides')

  const [step, setStep] = useState(0)
  const [archetype, setArchetype] = useState<string | null>(null)
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([])
  const [balance, setBalance] = useState('')
  const [commitments, setCommitments] = useState({ cell: true, church: true, rent: false, debt: false })
  const [notifications, setNotifications] = useState<boolean | null>(null)
  const [consent, setConsent] = useState(false)

  const totalSteps = 6
  const progress = ((step + 1) / totalSteps) * 100

  const togglePriority = (key: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : prev.length < 3 ? [...prev, key] : prev
    )
  }

  const canContinue = () => {
    if (step === 0) return archetype !== null && consent
    if (step === 1) return selectedPriorities.length > 0
    if (step === 2) return balance.trim().length > 0
    if (step === 4) return notifications !== null
    return true
  }

  const handleFinish = () => {
    track('onboarding_completed', {
      archetype,
      priorities: selectedPriorities,
      startingBalance: Number(balance) || 0,
      notificationsOptIn: notifications === true,
    })
    track('consent_granted', { at: new Date().toISOString() })
    completeOnboarding({
      archetype: archetype ?? '',
      priorities: selectedPriorities,
      startingBalance: Number(balance) || 0,
      commitmentFlags: commitments,
      notificationsOptIn: notifications === true,
      consentGivenAt: new Date().toISOString(),
    })
    router.push('/DailySnapshot')
  }

  // ── Prototype intro slides ──────────────────────────────────────────────
  if (phase === 'slides') {
    const slide = slides[slideStep]
    const Icon = slide.icon
    const isLast = slideStep === slides.length - 1
    return (
      <div className="min-h-screen bg-ink-950 flex flex-col" style={{ fontFamily: body }}>
        <div className="relative flex-1 flex flex-col items-center justify-center px-6 overflow-hidden">
          <div className={`absolute -top-20 -right-16 h-64 w-64 rounded-full bg-gradient-to-br ${slide.accent} opacity-20 blur-3xl`} />
          <div className={`absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-gradient-to-br ${slide.accent} opacity-10 blur-3xl`} />

          <div className="relative flex items-center gap-2 mb-12 animate-fade-in">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-glow">
              <Sparkles size={19} />
            </span>
            <span className="font-display text-xl font-semibold text-white tracking-tight">Nafaka</span>
          </div>

          <div key={slideStep} className="relative animate-scale-in">
            <div className={`flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br ${slide.accent} shadow-glow`}>
              <Icon size={52} className="text-white" strokeWidth={1.8} />
            </div>
          </div>

          <div key={`t-${slideStep}`} className="relative mt-10 text-center max-w-sm animate-fade-up">
            <h1 style={{ fontFamily: display }} className="font-display text-2xl font-semibold text-white leading-snug">
              {slide.title}
            </h1>
            <p className="mt-3 text-sm text-white/70 leading-relaxed">{slide.body}</p>
          </div>
        </div>

        <div className="relative px-6 pb-10 pt-4">
          <div className="flex items-center justify-center gap-2 mb-6">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === slideStep ? 'w-6 bg-brand-400' : 'w-1.5 bg-white/25'}`}
              />
            ))}
          </div>

          <button
            onClick={() => (isLast ? setPhase('form') : setSlideStep((s) => s + 1))}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-semibold text-ink-900 transition hover:bg-white/90 active:scale-[0.98] cursor-pointer"
          >
            {isLast ? 'Start using Nafaka' : 'Continue'}
            <ArrowRight size={16} />
          </button>

          {!isLast && (
            <button
              onClick={() => setPhase('form')}
              className="mt-3 w-full text-center text-xs font-medium text-white/50 hover:text-white/70 transition cursor-pointer"
            >
              Skip intro
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Data collection steps ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-ink-50" style={{ fontFamily: body }}>
      <div className="max-w-md mx-auto min-h-screen flex flex-col px-5 pt-8 pb-10">
        <div className="flex items-center gap-3 mb-8">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="cursor-pointer w-9 h-9 rounded-full flex items-center justify-center border border-ink-200 text-ink-600 hover:bg-ink-100 transition"
              aria-label="Back"
            >
              <ChevronLeft size={18} />
            </button>
          ) : (
            <div className="w-9 h-9" />
          )}
          <div className="flex-1 h-1.5 rounded-full bg-ink-100 overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex-1">
          {step === 0 && (
            <div>
              <h1 style={{ fontFamily: display }} className="font-display text-3xl font-semibold text-ink-900 mb-2">
                Who are you?
              </h1>
              <p className="text-ink-500 text-sm mb-8">This helps us shape how we talk to you.</p>
              <div className="grid grid-cols-2 gap-3">
                {archetypes.map(({ key, label, icon: Icon }) => {
                  const isActive = archetype === key
                  return (
                    <button
                      key={key}
                      onClick={() => setArchetype(key)}
                      className={`cursor-pointer rounded-xl2 border p-5 flex flex-col items-start gap-3 text-left transition ${
                        isActive ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'card hover:bg-ink-50'
                      }`}
                    >
                      <Icon size={22} className={isActive ? 'text-brand-700' : 'text-ink-400'} />
                      <span className={`text-sm font-semibold ${isActive ? 'text-brand-800' : 'text-ink-900'}`}>{label}</span>
                    </button>
                  )
                })}
              </div>

              <button
                type="button"
                role="checkbox"
                aria-checked={consent}
                onClick={() => setConsent((c) => !c)}
                className="cursor-pointer w-full flex items-start gap-3 rounded-xl2 border border-ink-200 bg-white px-4 py-3.5 mt-6 text-left transition hover:bg-ink-50"
              >
                <span
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition ${
                    consent ? 'bg-brand-600 border-brand-600' : 'border-ink-300'
                  }`}
                >
                  {consent && <Check size={13} className="text-white" />}
                </span>
                <span className="text-xs text-ink-600 leading-relaxed">
                  I agree to the{' '}
                  <Link href="/privacy" onClick={(e) => e.stopPropagation()} className="text-brand-700 hover:underline">
                    Privacy Policy
                  </Link>{' '}
                  and{' '}
                  <Link href="/terms" onClick={(e) => e.stopPropagation()} className="text-brand-700 hover:underline">
                    Terms of Service
                  </Link>
                </span>
              </button>
            </div>
          )}

          {step === 1 && (
            <div>
              <h1 style={{ fontFamily: display }} className="font-display text-3xl font-semibold text-ink-900 mb-2">
                What matters most?
              </h1>
              <p className="text-ink-500 text-sm mb-8">Pick up to 3 priorities. No wrong answers.</p>
              <div className="space-y-3">
                {priorities.map(({ key, label, icon: Icon }) => {
                  const isActive = selectedPriorities.includes(key)
                  return (
                    <button
                      key={key}
                      onClick={() => togglePriority(key)}
                      className={`cursor-pointer w-full rounded-xl2 border px-4 py-4 flex items-center gap-3 text-left transition ${
                        isActive ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'card hover:bg-ink-50'
                      }`}
                    >
                      <Icon size={19} className={isActive ? 'text-brand-700' : 'text-ink-400'} />
                      <span className={`text-sm font-medium flex-1 ${isActive ? 'text-brand-800' : 'text-ink-900'}`}>{label}</span>
                      {isActive && (
                        <span className="w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center">
                          <Check size={12} className="text-white" />
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
              <h1 style={{ fontFamily: display }} className="font-display text-3xl font-semibold text-ink-900 mb-2">
                Your balance
              </h1>
              <p className="text-ink-500 text-sm mb-8">
                What&rsquo;s in your wallet or mobile money right now? Just an estimate is fine.
              </p>
              <div className="card p-6">
                <label className="text-xs font-semibold text-ink-400 uppercase tracking-wide">
                  Current balance (UGX)
                </label>
                <div className="flex items-baseline gap-2 mt-3">
                  <span style={{ fontFamily: display }} className="font-display text-3xl font-semibold text-ink-900">
                    UGX
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="0"
                    className="flex-1 bg-transparent text-3xl outline-none text-ink-900 placeholder:text-ink-300"
                    style={{ fontFamily: display }}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h1 style={{ fontFamily: display }} className="font-display text-3xl font-semibold text-ink-900 mb-2">
                Quick commitments
              </h1>
              <p className="text-ink-500 text-sm mb-8">Toggle what applies. We&rsquo;ll help you plan around them.</p>
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
                      className={`cursor-pointer w-full rounded-xl2 border px-4 py-4 flex items-center justify-between text-left transition ${
                        active ? 'border-brand-500 bg-brand-50 text-brand-800' : 'card hover:bg-ink-50 text-ink-600'
                      }`}
                    >
                      <span>
                        <span className={`block text-sm font-semibold ${active ? 'text-brand-800' : 'text-ink-900'}`}>{label}</span>
                        <span className={`block text-xs mt-0.5 ${active ? 'text-brand-600/80' : 'text-ink-500'}`}>{sub}</span>
                      </span>
                      <span
                        className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors shrink-0 ${
                          active ? 'bg-brand-600 justify-end' : 'bg-ink-200 justify-start'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full bg-white shadow" />
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h1 style={{ fontFamily: display }} className="font-display text-3xl font-semibold text-ink-900 mb-2">
                Stay in the loop
              </h1>
              <p className="text-ink-500 text-sm mb-8">
                A gentle check-in each morning and evening. You can turn this off anytime.
              </p>
              <div className="card p-6 flex flex-col items-center text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center mb-4">
                  <Bell size={24} className="text-brand-700" />
                </div>
                <p className="text-sm text-ink-900 font-medium">&ldquo;Good morning. Here&rsquo;s your safe-to-spend for today.&rdquo;</p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setNotifications(true)}
                  className={`cursor-pointer w-full rounded-xl2 border px-4 py-4 text-sm font-semibold transition ${
                    notifications === true ? 'border-brand-500 bg-brand-50 text-brand-800 ring-1 ring-brand-500' : 'card text-ink-900 hover:bg-ink-50'
                  }`}
                >
                  Yes, keep me on track
                </button>
                <button
                  onClick={() => setNotifications(false)}
                  className={`cursor-pointer w-full rounded-xl2 border px-4 py-4 text-sm font-semibold transition ${
                    notifications === false ? 'border-brand-500 bg-brand-50 text-brand-800 ring-1 ring-brand-500' : 'card text-ink-900 hover:bg-ink-50'
                  }`}
                >
                  Not right now
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="flex flex-col items-center text-center pt-6">
              <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mb-6">
                <Sparkles size={26} className="text-brand-700" />
              </div>
              <h1 style={{ fontFamily: display }} className="font-display text-3xl font-semibold text-ink-900 mb-3">
                You&rsquo;re set up.
              </h1>
              <p className="text-ink-500 text-sm mb-8 max-w-[28ch]">
                Here&rsquo;s your first insight, based on what you&rsquo;ve told us.
              </p>
              <div className="card p-6 text-left w-full">
                <p className="text-xs font-semibold text-brand-700 uppercase tracking-wide mb-3">First insight</p>
                <p className="text-sm text-ink-700 leading-relaxed">
                  {(() => {
                    const flags: Array<[boolean, string]> = [
                      [commitments.cell, 'cell meetings'],
                      [commitments.church, 'your offering'],
                      [commitments.rent, 'rent'],
                      [commitments.debt, 'debt repayments'],
                    ]
                    const chosen = flags.filter(([on]) => on).map(([, label]) => label)
                    const protectedList =
                      chosen.length > 1
                        ? `${chosen.slice(0, -1).join(', ')} and ${chosen[chosen.length - 1]}`
                        : chosen[0]
                    return protectedList
                      ? `With UGX ${Number(balance) || 0} to start, we&rsquo;ll protect ${protectedList} first — then show you what&rsquo;s safe to spend on everything else.`
                      : `With UGX ${Number(balance) || 0} to start, we&rsquo;ll show you what&rsquo;s safe to spend each day — protecting essentials before anything else.`
                  })()}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8">
          {step < totalSteps - 1 ? (
            <button
              disabled={!canContinue()}
              onClick={() => { track('onboarding_step', { step }); setStep((s) => Math.min(totalSteps - 1, s + 1)) }}
              className={`btn-primary w-full ${!canContinue() ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Continue
            </button>
          ) : (
            <button onClick={handleFinish} className="btn-primary w-full">
              <Sparkles size={16} />
              Enter Nafaka
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
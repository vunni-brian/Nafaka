import { useState } from 'react';
import { Sparkles, Brain, ShieldCheck, Heart, ArrowRight } from 'lucide-react';

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
];

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const slide = slides[step];
  const Icon = slide.icon;
  const isLast = step === slides.length - 1;

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col">
      {/* Decorative background */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className={`absolute -top-20 -right-16 h-64 w-64 rounded-full bg-gradient-to-br ${slide.accent} opacity-20 blur-3xl`} />
        <div className={`absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-gradient-to-br ${slide.accent} opacity-10 blur-3xl`} />

        {/* Logo */}
        <div className="relative flex items-center gap-2 mb-12 animate-fade-in">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-glow">
            <Sparkles size={19} />
          </span>
          <span className="font-display text-xl font-semibold text-white tracking-tight">Nafaka</span>
        </div>

        {/* Icon disc */}
        <div key={step} className="relative animate-scale-in">
          <div className={`flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br ${slide.accent} shadow-glow`}>
            <Icon size={52} className="text-white" strokeWidth={1.8} />
          </div>
        </div>

        {/* Copy */}
        <div key={`t-${step}`} className="relative mt-10 text-center max-w-sm animate-fade-up">
          <h1 className="font-display text-2xl font-semibold text-white leading-snug">{slide.title}</h1>
          <p className="mt-3 text-sm text-white/70 leading-relaxed">{slide.body}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="relative px-6 pb-10 pt-4">
        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-brand-400' : 'w-1.5 bg-white/25'}`}
            />
          ))}
        </div>

        <button
          onClick={() => (isLast ? onDone() : setStep((s) => s + 1))}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-semibold text-ink-900 transition hover:bg-white/90 active:scale-[0.98]"
        >
          {isLast ? 'Start using Nafaka' : 'Continue'}
          <ArrowRight size={16} />
        </button>

        {!isLast && (
          <button onClick={onDone} className="mt-3 w-full text-center text-xs font-medium text-white/50 hover:text-white/70 transition">
            Skip intro
          </button>
        )}
      </div>
    </div>
  );
}

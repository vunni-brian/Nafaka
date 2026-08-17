import { Sparkles, Check, ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react';
import { SectionTitle, StatPill } from '@/components/ui';
import { weeklyReview } from '@/data/mock';
import type { StageProfile } from '@/data/mock';
import type { Screen } from '@/types';

export function ReviewScreen({ onNavigate, stage }: { onNavigate: (s: Screen) => void; stage: StageProfile }) {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Weekly Review</h1>
          <p className="text-sm text-ink-500 mt-1">{weeklyReview.weekLabel}</p>
        </div>
        <StatPill tone="positive">
          <Sparkles size={12} /> {stage.confidence}% confidence
        </StatPill>
      </div>

      {/* Judgment-filtered headline */}
      <div className="relative overflow-hidden rounded-xl2 bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white shadow-card">
        <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-white/70">
            <Sparkles size={16} />
            <p className="text-xs font-semibold uppercase tracking-wide">This week, with context</p>
          </div>
          <p className="mt-3 font-display text-xl font-semibold leading-snug">{weeklyReview.headline}</p>
          <p className="mt-2 text-sm text-white/85 leading-relaxed">{weeklyReview.body}</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5">
            <Check size={14} />
            <span className="text-xs font-medium">Nothing to correct here</span>
          </div>
        </div>
      </div>

      {/* Delta comparison */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <p className="text-xs font-medium text-ink-500">Total spending</p>
          <p className="mt-1 text-2xl font-bold text-accent-700">+{weeklyReview.totalDelta}%</p>
          <p className="text-[11px] text-ink-400 mt-1">vs last week</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium text-ink-500">Discretionary spending</p>
          <p className="mt-1 text-2xl font-bold text-brand-700">{weeklyReview.discretionaryDelta}%</p>
          <p className="text-[11px] text-ink-400 mt-1">the part you control</p>
        </div>
      </div>

      {/* Highlights */}
      <div>
        <SectionTitle title="Week highlights" />
        <div className="grid grid-cols-2 gap-3">
          {weeklyReview.highlights.map((h) => (
            <div key={h.label} className="card p-3.5">
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                    h.tone === 'positive' ? 'bg-brand-100 text-brand-700' : 'bg-ink-100 text-ink-600'
                  }`}
                >
                  {h.tone === 'positive' ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                </span>
                <p className="text-[11px] font-medium text-ink-500">{h.label}</p>
              </div>
              <p className="mt-2 text-sm font-bold text-ink-900">{h.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Next week coaching */}
      <div>
        <SectionTitle title="Looking ahead" hint="Adaptive coaching for next week" />
        <div className="space-y-3">
          {weeklyReview.nextWeek.map((tip, i) => (
            <div key={i} className="card p-4 flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-100 text-accent-700 text-xs font-bold">
                {i + 1}
              </span>
              <p className="text-sm text-ink-700 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => onNavigate('chat')} className="btn-primary w-full">
        <Sparkles size={16} /> Ask Nafaka about this week
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

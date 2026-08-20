import { ShieldCheck, TrendingUp, Heart, Sparkles, Lock } from 'lucide-react';
import { Ring, SectionTitle } from '@/components/ui';
import { LearningState } from '@/components/LearningState';
import { healthScore } from '@/data/mock';
import type { StageProfile } from '@/data/mock';

export function HealthScreen({ stage }: { stage: StageProfile }) {
  const statusColor = (s: 'good' | 'ok' | 'watch') =>
    s === 'good' ? 'text-brand-700' : s === 'ok' ? 'text-ink-600' : 'text-accent-700';
  const statusBg = (s: 'good' | 'ok' | 'watch') =>
    s === 'good' ? 'bg-brand-500' : s === 'ok' ? 'bg-ink-400' : 'bg-accent-500';

  // Health score unlocks at 70% confidence
  if (!stage.hasHealth) {
    return (
      <div className="space-y-6 animate-fade-up">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Financial Health</h1>
          <p className="text-sm text-ink-500 mt-1">Measured by behavior, not by how much you earn.</p>
        </div>
        <div className="card p-6 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 text-ink-400">
            <Lock size={24} />
          </span>
          <p className="mt-4 font-display text-lg font-semibold text-ink-900">Unlocks at 70% confidence</p>
          <p className="mt-2 text-sm text-ink-500 max-w-xs mx-auto leading-relaxed">
            Your Financial Health Score needs about 3 months of behavior to be accurate. Right now you're at {stage.confidence}%.
          </p>
          <div className="mt-4 max-w-[180px] mx-auto">
            <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${stage.confidence}%`, transition: 'width 0.8s ease' }} />
            </div>
            <p className="text-[11px] text-ink-400 mt-1.5">{stage.confidence}% of 70% needed</p>
          </div>
        </div>
        <div className="card p-4 border-brand-100 bg-brand-50/50">
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} className="text-brand-700 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-ink-900">Nafaka never punishes you</p>
              <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                Irregular income isn't bad. High spending isn't automatically bad. Supporting family isn't bad. Your score reflects behavior in context - never judgment.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Financial Health</h1>
        <p className="text-sm text-ink-500 mt-1">Measured by behavior, not by how much you earn.</p>
      </div>

      {/* Score hero */}
      <div className="card p-6 flex flex-col items-center text-center">
        <Ring value={healthScore.total} size={148} stroke={12} label={`${healthScore.total}`} sublabel="of 100" tone="brand" />
        <div className="mt-4 flex items-center gap-1.5">
          <TrendingUp size={15} className="text-brand-600" />
          <p className="text-sm font-semibold text-brand-700">Up {healthScore.change} points this month</p>
        </div>
        <p className="text-xs text-ink-500 mt-2 max-w-xs">
          Your score blends resilience, commitment reliability, income stability, spending control, savings habit, and social balance.
        </p>
        <div className="mt-3">
          <span className="pill bg-brand-100 text-brand-700">
            <Sparkles size={12} /> Based on {stage.joinedDays} days · {stage.confidence}% confidence
          </span>
        </div>
      </div>

      {/* Personality teaser */}
      <div className="card p-4 bg-gradient-to-br from-brand-50 to-white">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Heart size={20} />
          </span>
          <div>
            <p className="text-xs font-medium text-ink-500">Your emerging financial personality</p>
            <p className="font-display text-lg font-semibold text-ink-900">The Reliable Nester</p>
          </div>
        </div>
        <p className="text-xs text-ink-600 mt-3 leading-relaxed">
          You consistently prioritize commitments, spend slowly after income, and keep family obligations reliable. Your buffer is still growing - reach 14 days for full resilience.
        </p>
        <p className="text-[10px] text-ink-400 mt-2">Locks in at 90% confidence (~3 months of data).</p>
      </div>

      {/* Dimensions */}
      <div>
        <SectionTitle title="Score breakdown" hint="6 behavioral dimensions" />
        <div className="space-y-3">
          {healthScore.dimensions.map((d) => (
            <div key={d.label} className="card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${statusBg(d.status)}`} />
                  <p className="text-sm font-semibold text-ink-900">{d.label}</p>
                </div>
                <p className={`text-lg font-bold ${statusColor(d.status)}`}>{d.score}</p>
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
      <div className="card p-4 border-brand-100 bg-brand-50/50">
        <div className="flex items-start gap-3">
          <ShieldCheck size={18} className="text-brand-700 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-ink-900">Nafaka never punishes you</p>
            <p className="text-xs text-ink-600 mt-1 leading-relaxed">
              Irregular income isn't bad. High spending isn't automatically bad. Supporting family isn't bad. Every insight is reframed with your context first.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

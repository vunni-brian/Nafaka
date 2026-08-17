import {
  Calendar,
  Home,
  Wallet,
  Users,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Minus,
  Lock,
  type LucideIcon,
} from 'lucide-react';
import { SectionTitle, ConfidenceBar, StatPill } from '@/components/ui';
import { BarChart } from '@/components/charts';
import { LearningState } from '@/components/LearningState';
import { weeklySpend, weeklySpendLabels, type StageProfile } from '@/data/mock';

const iconMap: Record<string, LucideIcon> = {
  calendar: Calendar,
  home: Home,
  wallet: Wallet,
  users: Users,
  piggy: PiggyBank,
};

const lockedExamples = ['Borrowing behavior', 'Spending trigger patterns', 'Savings consistency'];

export function PatternsScreen({ stage }: { stage: StageProfile }) {
  // Week 1 - learning state
  if (stage.confidence < 40) {
    return <LearningState stage={stage} />;
  }

  const confirmed = stage.patterns.filter((p) => p.status === 'confirmed');
  const emerging = stage.patterns.filter((p) => p.status === 'emerging');

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Patterns</h1>
        <p className="text-sm text-ink-500 mt-1">
          How Nafaka sees your money behavior. Patterns become confirmed as confidence grows.
        </p>
        <div className="mt-3 flex items-center gap-3">
          <ConfidenceBar value={stage.confidence} />
          <span className="text-xs text-ink-500">{stage.stage}</span>
        </div>
      </div>

      {/* Weekend vs weekday chart */}
      <div className="card p-4">
        <SectionTitle title="Spending by week" hint="See your spending rhythm" />
        <BarChart data={weeklySpend} labels={weeklySpendLabels} tone="accent" height={130} />
      </div>

      {/* Confirmed patterns - only week12 */}
      {confirmed.length > 0 && (
        <div>
          <SectionTitle title="Confirmed patterns" hint={`${confirmed.length} patterns locked in`} />
          <div className="space-y-3">
            {confirmed.map((p) => {
              const Icon = iconMap[p.icon] ?? TrendingUp;
              return (
                <div key={p.id} className="card p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                      <Icon size={18} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-ink-900">{p.title}</p>
                        <StatPill tone="positive">Confirmed · {p.confidence}%</StatPill>
                      </div>
                      <p className="text-xs text-ink-600 mt-1.5 leading-relaxed">{p.detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Emerging patterns - week4+ */}
      {emerging.length > 0 && (
        <div>
          <SectionTitle title="Emerging patterns" hint="Needs more data to confirm" />
          <div className="space-y-3">
            {emerging.map((p) => {
              const Icon = iconMap[p.icon] ?? TrendingUp;
              return (
                <div key={p.id} className="card p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-100 text-accent-700">
                      <Icon size={18} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-ink-900">{p.title}</p>
                        <StatPill tone="watch">Emerging · {p.confidence}%</StatPill>
                      </div>
                      <p className="text-xs text-ink-600 mt-1.5 leading-relaxed">{p.detail}</p>
                      <div className="mt-2.5">
                        <div className="h-1.5 w-full rounded-full bg-ink-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-accent-500"
                            style={{ width: `${p.confidence}%`, transition: 'width 0.8s ease' }}
                          />
                        </div>
                        <p className="text-[10px] text-ink-400 mt-1">Will confirm at ~70% confidence</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All signals */}
      {stage.signals.length > 0 && (
        <div>
          <SectionTitle title="All behavioral signals" hint={stage.confidence >= 70 ? 'Calculated daily from your activity' : 'Emerging - still calculating'} />
          <div className="card divide-y divide-ink-100">
            {stage.signals.map((s) => (
              <div key={s.key} className="flex items-center gap-3 px-4 py-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    s.status === 'good'
                      ? 'bg-brand-100 text-brand-700'
                      : s.status === 'ok'
                      ? 'bg-ink-100 text-ink-600'
                      : 'bg-accent-100 text-accent-700'
                  }`}
                >
                  {s.trend === 'up' ? <TrendingUp size={15} /> : s.trend === 'down' ? <TrendingDown size={15} /> : <Minus size={15} />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink-900">{s.label}</p>
                  <p className="text-xs text-ink-500 leading-snug mt-0.5">{s.description}</p>
                </div>
                <span className="text-right">
                  <p className="text-sm font-bold text-ink-900 whitespace-nowrap">{s.display}</p>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked / future signals */}
      <div>
        <SectionTitle title="Still learning" hint="Unlocks with more data" />
        <div className="card divide-y divide-ink-100">
          {lockedExamples.map((label) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3 opacity-60">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-400">
                <Lock size={14} />
              </span>
              <p className="text-sm font-medium text-ink-600 flex-1">{label}</p>
              <span className="text-xs text-ink-400">Locked</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

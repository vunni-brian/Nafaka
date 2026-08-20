import { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  CalendarDays,
  Sparkles,
  Wallet,
  ShieldCheck,
  Users,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Ring, SectionTitle, StatPill, ConfidenceBar } from '@/components/ui';
import { AreaChart, DonutSegments } from '@/components/charts';
import { AddTransactionModal, QuickAdd } from '@/components/AddTransaction';
import { LearningState } from '@/components/LearningState';
import {
  user,
  balance,
  daysOfBuffer,
  thisWeek,
  transactions,
  weeklyReview,
  fmt,
  fmtFull,
  incomeTrend,
  incomeTrendLabels,
  weeklySpend,
  weeklySpendLabels,
  spendBreakdown,
  type StageProfile,
} from '@/data/mock';
import type { Screen, TxnType } from '@/types';

export function TodayScreen({ onNavigate, stage }: { onNavigate: (s: Screen) => void; stage: StageProfile }) {
  const [addOpen, setAddOpen] = useState(false);
  const [addType, setAddType] = useState<TxnType>('expense');

  const openAdd = (t: TxnType) => {
    setAddType(t);
    setAddOpen(true);
  };

  // Early state: show learning experience instead of full dashboard
  if (stage.confidence < 40) {
    return (
      <>
        <LearningState stage={stage} onAdd={() => openAdd('expense')} />
        <AddTransactionModal open={addOpen} onClose={() => setAddOpen(false)} type={addType} />
      </>
    );
  }

  const isWeek4 = stage.confidence < 70;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Hero balance card */}
      <div className="relative overflow-hidden rounded-xl2 bg-gradient-to-br from-ink-900 via-ink-900 to-brand-950 p-5 text-white shadow-card">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-500/20 blur-2xl" />
        <div className="absolute -right-4 top-10 h-24 w-24 rounded-full bg-accent-500/10 blur-xl" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-white/60">Good morning, {user.name}</p>
              <p className="text-xs text-white/40 mt-0.5">{user.location}</p>
            </div>
            <button
              onClick={() => onNavigate('notifications')}
              className="relative rounded-full p-2 bg-white/10 hover:bg-white/15 transition"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent-400 ring-2 ring-ink-900" />
            </button>
          </div>

          <p className="mt-5 text-xs font-medium text-white/60">Current balance</p>
          <p className="mt-1 font-display text-3xl font-semibold tracking-tight">{fmtFull(stage.balance)}</p>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/20 text-brand-300">
                <ArrowUpRight size={15} />
              </span>
              <div>
                <p className="text-[10px] text-white/50">Income this week</p>
                <p className="text-sm font-semibold">{fmt(thisWeek.income)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-500/20 text-accent-300">
                <ArrowDownRight size={15} />
              </span>
              <div>
                <p className="text-[10px] text-white/50">Spent this week</p>
                <p className="text-sm font-semibold">{fmt(thisWeek.expenses)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning status + buffer */}
      <div className="card p-4">
        <div className="flex items-center gap-4">
          <Ring value={stage.confidence} size={72} stroke={7} label={`${stage.confidence}%`} sublabel="conf." />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-brand-600" />
              <p className="text-sm font-semibold text-ink-900">{stage.stage}</p>
            </div>
            <p className="text-xs text-ink-500 mt-1">
              {stage.joinedDays} days of behavior observed. Full intelligence unlocks at 90%.
            </p>
            <div className="mt-2.5">
              <ConfidenceBar value={stage.confidence} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick add */}
      <div>
        <SectionTitle title="Quick add" hint="Log income or expense to teach Nafaka" />
        <QuickAdd onPick={openAdd} />
      </div>

      {/* Income trend chart - week4+ */}
      <div className="card p-4">
        <SectionTitle
          title="Income trend"
          hint="Last 6 months"
          action={
            <span className="pill bg-brand-100 text-brand-700">
              <TrendingUp size={12} /> +18%
            </span>
          }
        />
        <AreaChart data={incomeTrend} labels={incomeTrendLabels} tone="brand" valuePrefix="UGX " />
      </div>

      {/* Spending chart - week12 only */}
      {!isWeek4 && (
        <div className="card p-4">
          <SectionTitle title="Weekly spending" hint="Last 6 weeks" />
          <AreaChart data={weeklySpend} labels={weeklySpendLabels} tone="accent" valuePrefix="UGX " />
        </div>
      )}

      {/* Behavioral signals glance */}
      <div>
        <SectionTitle
          title="Your financial behavior"
          hint={isWeek4 ? 'Emerging signals - still learning' : 'Learned signals, updated daily'}
          action={
            <button onClick={() => onNavigate('patterns')} className="text-xs font-semibold text-brand-700 hover:text-brand-800">
              View patterns
            </button>
          }
        />
        {stage.signals.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            <SignalChip icon={<Wallet size={16} />} label="Post-income spending" value={stage.signals[1]?.display ?? '—'} tone={stage.signals[1]?.status ?? 'ok'} />
            <SignalChip icon={<ShieldCheck size={16} />} label="Commitment reliability" value={stage.signals[2]?.display ?? '—'} tone={stage.signals[2]?.status ?? 'ok'} />
            <SignalChip icon={<CalendarDays size={16} />} label="Financial slack" value={`${daysOfBuffer} days buffer`} tone="ok" />
            <SignalChip icon={<Users size={16} />} label="Social obligation load" value={stage.signals[3]?.display ?? '—'} tone={stage.signals[3]?.status ?? 'ok'} />
          </div>
        ) : (
          <div className="card p-4 text-center">
            <p className="text-xs text-ink-500">Signals unlock at 40% confidence.</p>
          </div>
        )}
      </div>

      {/* Spend breakdown donut - week12 only */}
      {!isWeek4 && (
        <div className="card p-4">
          <SectionTitle title="Where your money went" hint="This week" />
          <div className="flex items-center gap-5">
            <DonutSegments
              segments={spendBreakdown}
              size={130}
              stroke={18}
              centerLabel={fmt(thisWeek.expenses)}
              centerSub="total"
            />
            <div className="flex-1 space-y-2">
              {spendBreakdown.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="text-xs text-ink-600 flex-1">{s.label}</span>
                  <span className="text-xs font-semibold text-ink-900">{fmt(s.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Weekly insight teaser - week4+ */}
      {stage.hasReview && (
        <div className="card overflow-hidden">
          <button onClick={() => onNavigate('review')} className="w-full text-left p-4 hover:bg-ink-50 transition">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <Sparkles size={18} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-ink-900">Weekly insight</p>
                  <StatPill tone="positive">New</StatPill>
                </div>
                <p className="text-sm text-ink-600 mt-1 leading-relaxed">{weeklyReview.headline}</p>
                <p className="text-xs text-ink-500 mt-1.5">{weeklyReview.body}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
                  Read full review <ChevronRight size={14} />
                </span>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Recent transactions */}
      <div>
        <SectionTitle
          title="Recent activity"
          hint="Last 7 days"
          action={
            <button className="text-xs font-semibold text-brand-700 hover:text-brand-800">See all</button>
          }
        />
        <div className="card divide-y divide-ink-100">
          {transactions.slice(0, 6).map((t) => (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  t.type === 'income' ? 'bg-brand-100 text-brand-700' : 'bg-ink-100 text-ink-600'
                }`}
              >
                {t.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-900 truncate">{t.category}</p>
                <p className="text-xs text-ink-500 truncate">
                  {t.note ?? t.subcategory ?? '—'}
                  {(t.isCommitment || t.isSocialObligation || t.isDiscretionary) && (
                    <span className="ml-1.5 text-ink-400">
                      · {t.isCommitment ? 'commitment' : t.isSocialObligation ? 'social' : 'discretionary'}
                    </span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${t.type === 'income' ? 'text-brand-700' : 'text-ink-900'}`}>
                  {t.type === 'income' ? '+' : '−'}
                  {fmtFull(t.amount)}
                </p>
                <p className="text-[10px] text-ink-400 mt-0.5">{t.method?.toUpperCase()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AddTransactionModal open={addOpen} onClose={() => setAddOpen(false)} type={addType} />
    </div>
  );
}

function SignalChip({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: 'good' | 'ok' | 'watch' }) {
  const tones = {
    good: 'text-brand-700 bg-brand-50 border-brand-100',
    ok: 'text-ink-700 bg-ink-50 border-ink-100',
    watch: 'text-accent-700 bg-accent-50 border-accent-100',
  };
  return (
    <div className={`rounded-xl border p-3 ${tones[tone]}`}>
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-[11px] font-medium text-ink-500">{label}</p>
      </div>
      <p className="mt-2 text-sm font-bold text-ink-900">{value}</p>
    </div>
  );
}

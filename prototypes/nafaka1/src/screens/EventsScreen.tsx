import { CalendarClock, GraduationCap, Coins, PartyPopper, Briefcase } from 'lucide-react';
import { SectionTitle, StatPill } from '@/components/ui';
import { lifeEvents } from '@/data/mock';

const typeIcon = {
  income: Coins,
  expense: CalendarClock,
  milestone: PartyPopper,
};

const toneStyles = {
  positive: { ring: 'bg-brand-100 text-brand-700', pill: 'positive' as const },
  watch: { ring: 'bg-accent-100 text-accent-700', pill: 'watch' as const },
  neutral: { ring: 'bg-ink-100 text-ink-600', pill: 'neutral' as const },
};

export function EventsScreen() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Life Events</h1>
        <p className="text-sm text-ink-500 mt-1">
          Nafaka factors real-life events into your behavior - so context is never mistaken for bad habits.
        </p>
      </div>

      <div className="card p-4 bg-gradient-to-br from-brand-50 to-white">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
            <GraduationCap size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink-900">School fees coming up</p>
            <p className="text-xs text-ink-500">Sep 5 · UGX 300,000 for your niece</p>
          </div>
        </div>
        <p className="text-xs text-ink-600 mt-3 leading-relaxed">
          Nafaka will mark that week's spending spike as expected, not as overspending. No guilt, just planning.
        </p>
      </div>

      <div>
        <SectionTitle title="Upcoming events" hint="Next 3 months" />
        <div className="space-y-3">
          {lifeEvents.map((e) => {
            const Icon = typeIcon[e.type] ?? Briefcase;
            const t = toneStyles[e.tone];
            return (
              <div key={e.id} className="card p-4 flex items-start gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.ring}`}>
                  <Icon size={18} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-ink-900">{e.title}</p>
                    <StatPill tone={t.pill}>{e.impact}</StatPill>
                  </div>
                  <p className="text-xs text-ink-500 mt-1">{e.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button className="btn-ghost w-full">+ Add a life event</button>
    </div>
  );
}

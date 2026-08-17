import { ArrowUpRight, ArrowDownRight, RefreshCw, Users } from 'lucide-react';
import { SectionTitle, StatPill } from '@/components/ui';
import { supportContacts } from '@/data/mock';

export function SupportScreen() {
  const totalGiven = supportContacts.filter((c) => c.direction !== 'receives').reduce((s, c) => s + c.totalYtd, 0);
  const totalReceived = supportContacts.filter((c) => c.direction !== 'gives').reduce((s, c) => s + c.totalYtd, 0);

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Support Network</h1>
        <p className="text-sm text-ink-500 mt-1">
          Family, faith, and community money flows. Nafaka treats these as obligations, not as "leakage".
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <div className="flex items-center gap-2">
            <ArrowUpRight size={16} className="text-accent-600" />
            <p className="text-xs font-medium text-ink-500">Given YTD</p>
          </div>
          <p className="mt-2 text-xl font-bold text-ink-900">UGX {(totalGiven / 1000).toFixed(0)}k</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2">
            <ArrowDownRight size={16} className="text-brand-600" />
            <p className="text-xs font-medium text-ink-500">Received YTD</p>
          </div>
          <p className="mt-2 text-xl font-bold text-ink-900">UGX {(totalReceived / 1000).toFixed(0)}k</p>
        </div>
      </div>

      <div>
        <SectionTitle title="Your network" hint="People and groups you exchange with" />
        <div className="space-y-3">
          {supportContacts.map((c) => (
            <div key={c.id} className="card p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-900 text-white">
                  <Users size={18} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink-900">{c.name}</p>
                  <p className="text-xs text-ink-500">{c.relationship}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-ink-900">UGX {(c.totalYtd / 1000).toFixed(0)}k</p>
                  <p className="text-[10px] text-ink-400 mt-0.5">YTD</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span
                  className={`pill ${
                    c.direction === 'gives'
                      ? 'bg-accent-100 text-accent-700'
                      : c.direction === 'receives'
                      ? 'bg-brand-100 text-brand-700'
                      : 'bg-ink-100 text-ink-600'
                  }`}
                >
                  {c.direction === 'gives' ? <ArrowUpRight size={12} /> : c.direction === 'receives' ? <ArrowDownRight size={12} /> : <RefreshCw size={12} />}
                  {c.direction}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-ink-500">Reliability</span>
                  <StatPill tone={c.reliability >= 90 ? 'positive' : 'neutral'}>{c.reliability}%</StatPill>
                </div>
              </div>
              <p className="text-[11px] text-ink-400 mt-2">Last: {c.lastTransfer}</p>
            </div>
          ))}
        </div>
      </div>

      <button className="btn-ghost w-full">+ Add a contact</button>
    </div>
  );
}

import { describe, test, expect } from 'vitest'
import type { ReactNode } from 'react'
import { render } from 'vitest-browser-react'
import { argosScreenshot } from '@argos-ci/vitest'
import '../../app/globals.css'
import { SectionTitle, StatPill, Ring, ConfidenceBar, Sparkline } from '@/components/proto/ui'
import { AreaChart, BarChart, DonutSegments } from '@/components/proto/charts'
import { fmt } from '@/components/proto/format'

function Card({ children }: { children: ReactNode }) {
  return <div className="card p-4 bg-white">{children}</div>
}

describe('Nafaka UI kit', () => {
  test('hero balance card', async () => {
    render(
      <div className="relative overflow-hidden rounded-xl2 bg-gradient-to-br from-ink-900 via-ink-900 to-brand-950 p-5 text-white shadow-card">
        <p className="text-xs font-medium text-white/60">Current balance</p>
        <p className="mt-1 font-display text-3xl font-semibold tracking-tight">UGX 845,000</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/20 text-brand-300">↑</span>
            <div>
              <p className="text-[10px] text-white/50">Income this week</p>
              <p className="text-sm font-semibold">UGX 320,000</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-500/20 text-accent-300">↓</span>
            <div>
              <p className="text-[10px] text-white/50">Spent this week</p>
              <p className="text-sm font-semibold">UGX 214,500</p>
            </div>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4">
          <div>
            <p className="text-[10px] text-white/50">Safe to spend today</p>
            <p className="text-lg font-semibold mt-0.5">UGX 12,400</p>
          </div>
          <span className="text-[11px] bg-white/15 rounded-full px-3 py-1.5">Why this amount?</span>
        </div>
      </div>
    )
    await argosScreenshot('hero-balance-card')
  })

  test('confidence ring and bar', async () => {
    render(
      <div className="card p-4 bg-white space-y-4">
        <div className="flex items-center gap-4">
          <Ring value={72} size={72} stroke={7} label="72%" sublabel="conf." />
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink-900">Confident pattern</p>
            <p className="text-xs text-ink-500 mt-1">54 days of behavior observed.</p>
            <div className="mt-2.5">
              <ConfidenceBar value={72} />
            </div>
          </div>
        </div>
      </div>
    )
    await argosScreenshot('confidence-ring-bar')
  })

  test('section title with stat pills', async () => {
    render(
      <div className="p-2 space-y-4">
        <SectionTitle title="Your financial behavior" hint="Learned signals, updated daily" action={<StatPill tone="positive">Good</StatPill>} />
        <div className="flex flex-wrap gap-2">
          <StatPill tone="positive">Confirmed</StatPill>
          <StatPill tone="watch">Emerging</StatPill>
          <StatPill tone="neutral">Still learning</StatPill>
        </div>
      </div>
    )
    await argosScreenshot('section-title-stat-pills')
  })

  test('charts: area, bar, donut', async () => {
    render(
      <div className="card p-4 bg-white space-y-6">
        <div>
          <SectionTitle title="Income trend" hint="Last 6 months" />
          <AreaChart data={[200000, 320000, 180000, 410000, 260000, 380000]} labels={['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']} tone="brand" valuePrefix="UGX " />
        </div>
        <div>
          <SectionTitle title="Spending by week" hint="See your spending rhythm" />
          <BarChart data={[120000, 98000, 145000, 88000, 152000, 110000]} labels={['W1', 'W2', 'W3', 'W4', 'W5', 'W6']} tone="accent" height={130} />
        </div>
        <div>
          <SectionTitle title="Where your money went" hint="This week" />
          <div className="flex items-center gap-5">
            <DonutSegments
              segments={[
                { label: 'Food', value: 64000, color: '#19bd80' },
                { label: 'Transport', value: 38000, color: '#f27d14' },
                { label: 'Giving', value: 45000, color: '#d4a82a' },
                { label: 'Other', value: 27500, color: '#848fa5' },
              ]}
              size={130}
              stroke={18}
              centerLabel={fmt(174500)}
              centerSub="total"
            />
            <div className="flex-1 space-y-2">
              {[
                { label: 'Food', value: 64000, color: '#19bd80' },
                { label: 'Transport', value: 38000, color: '#f27d14' },
                { label: 'Giving', value: 45000, color: '#d4a82a' },
                { label: 'Other', value: 27500, color: '#848fa5' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="text-xs text-ink-600 flex-1">{s.label}</span>
                  <span className="text-xs font-semibold text-ink-900">{fmt(s.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
    await argosScreenshot('charts-area-bar-donut')
  })

  test('recent transactions list', async () => {
    const txns = [
      { id: 1, type: 'income', label: 'Freelance payment', note: 'Client deposit', amount: 320000, time: 'Today, 9:12 AM' },
      { id: 2, type: 'expense', label: 'Grocery shopping', note: 'Nakasero market', amount: 64000, time: 'Today, 8:40 AM' },
      { id: 3, type: 'expense', label: 'Cell meeting', note: 'Weekly fellowship contribution · commitment', amount: 10000, time: 'Yesterday, 7:30 PM' },
    ]
    render(
      <div>
        <SectionTitle title="Recent activity" hint="Last 7 days" />
        <div className="card divide-y divide-ink-100 bg-white">
          {txns.map((t) => (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  t.type === 'income' ? 'bg-brand-100 text-brand-700' : 'bg-ink-100 text-ink-600'
                }`}
              >
                {t.type === 'income' ? '↑' : '↓'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-900 truncate">{t.label}</p>
                <p className="text-xs text-ink-500 truncate">{t.note}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${t.type === 'income' ? 'text-brand-700' : 'text-ink-900'}`}>
                  {t.type === 'income' ? '+' : '−'}
                  {fmt(t.amount)}
                </p>
                <p className="text-[10px] text-ink-400 mt-0.5">{t.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
    await argosScreenshot('recent-transactions-list')
  })

  test('sparkline', async () => {
    render(
      <Card>
        <SectionTitle title="Savings consistency" hint="Weekly balance movement" />
        <Sparkline data={[20, 45, 30, 65, 50, 80, 72]} tone="brand" />
      </Card>
    )
    await argosScreenshot('sparkline')
    expect(true).toBe(true)
  })
})
import { confidencePhrase, regularityCopy, stateLabel } from './describe'
import { daysBetween, toISODate } from './stats'
import type { BehaviorModel, BrainTransaction } from './types'
import { dailyTotals } from './weekly'

export type ChatContext = {
  name: string
  balance: number
  safeToSpend: number
  upcomingTotal: number
  shortfall: number
  model: BehaviorModel
  transactions: BrainTransaction[]
}

export type ChatReply = {
  text: string
  chart?: { day: string; amount: number }[]
}

export function formatMoney(n: number): string {
  return `UGX ${Math.round(n).toLocaleString()}`
}

function todayIso(): string {
  return toISODate(new Date())
}

function lastIncomeInfo(transactions: BrainTransaction[]): { count: number; daysAgo: number | null } {
  const events = transactions
    .filter((t) => t.type === 'income')
    .sort((a, b) => a.date.localeCompare(b.date))
  if (events.length === 0) return { count: 0, daysAgo: null }
  return { count: events.length, daysAgo: daysBetween(events[events.length - 1].date, todayIso()) }
}

function describeAgo(daysAgo: number): string {
  if (daysAgo === 0) return 'today'
  if (daysAgo === 1) return 'yesterday'
  return `${daysAgo} days ago`
}

export function buildGreeting(ctx: ChatContext): string {
  const name = ctx.name.charAt(0).toUpperCase() + ctx.name.slice(1)
  return `Hi ${name}. I've been looking at your ${ctx.model.dataPoints} financial records \u2014 ${confidencePhrase(
    ctx.model.confidenceTier,
  ).toLowerCase()}. Ask me things like "can I afford lunch today" or "when will I likely get paid next".`
}

export function answerQuestion(question: string, ctx: ChatContext): ChatReply {
  const q = question.toLowerCase()

  if (/(sunday|overspend|weekend|run low|spending pattern|which day)/.test(q)) return weekdayReply(ctx)
  if (/(paid|income|salary|when will|when do|next payment|payday|likely)/.test(q)) return incomeReply(ctx)
  if (/(cell|reliab|commitment|faithful|tithe|offering|missed)/.test(q)) return commitmentReply(ctx)
  if (/(afford|worth|buy|can i|spend|pay\b)/.test(q)) return affordReply(question, ctx)
  return overviewReply(ctx)
}

function affordReply(question: string, ctx: ChatContext): ChatReply {
  const { safeToSpend, upcomingTotal, shortfall, model } = ctx
  const match = question.replace(/,/g, '').match(/\d+(\.\d+)?/)
  const requested = match ? Number(match[0]) : null
  const essentials = model.stateDetail.dailyEssentialCost

  let text: string
  if (requested === null) {
    text = `Today you have about ${formatMoney(safeToSpend)} safe to spend after ${formatMoney(
      upcomingTotal,
    )} of commitments ahead. Essentials run roughly ${formatMoney(essentials)} a day.${
      shortfall > 0 ? ` Note: commitments currently exceed your balance by ${formatMoney(shortfall)}.` : ''
    }`
  } else if (shortfall > 0) {
    text = `That's not possible right now — your commitments (${formatMoney(
      upcomingTotal,
    )}) exceed your balance by ${formatMoney(shortfall)}. Essentials come first; I'd hold off until income arrives.`
  } else if (requested <= safeToSpend) {
    text = `That fits. After your commitments (${formatMoney(
      upcomingTotal,
    )} ahead), you still have about ${formatMoney(safeToSpend)} of room today \u2014 with essentials running roughly ${formatMoney(
      essentials,
    )} a day.`
  } else {
    text = `That's above today's safe-to-spend of ${formatMoney(
      safeToSpend,
    )}. After commitments (${formatMoney(
      upcomingTotal,
    )} ahead) you'd be touching money already owed \u2014 wait a day or two if you can.`
  }
  return { text }
}

function weekdayReply(ctx: ChatContext): ChatReply {
  const points = dailyTotals(ctx.transactions, new Date())
  const chart = points.map((p) => ({ day: p.label, amount: p.spending }))
  const withData = points.filter((p) => p.spending > 0)

  if (withData.length < 3) {
    const n = withData.length
    return {
      text: `I've only seen ${n} day${n === 1 ? '' : 's'} of spending so far, so I can't call a weekly pattern yet. Keep recording \u2014 day-of-week insights sharpen as weeks accumulate.`,
      chart,
    }
  }

  const total = withData.reduce((acc, p) => acc + p.spending, 0)
  const max = withData.reduce((best, p) => (p.spending > best.spending ? p : best), withData[0])
  const average = total / withData.length

  const text =
    max.spending >= average * 1.3
      ? `Across the last 7 days, ${max.label} stood out at ${formatMoney(max.spending)} \u2014 about ${Math.round(
          max.spending / average,
        )}x your daily average. It's a pattern worth watching, not a judgment.`
      : `Your spending is fairly even across the week (daily average ${formatMoney(Math.round(average))}). No single day dominates.`
  return { text, chart }
}

function incomeReply(ctx: ChatContext): ChatReply {
  const { model, transactions } = ctx
  const reg = model.signals.incomeRegularity
  const { count, daysAgo } = lastIncomeInfo(transactions)
  const last = daysAgo !== null ? ` \u2014 the last one ${describeAgo(daysAgo)}` : ''

  if (reg.sampleSize < 2) {
    return {
      text: `I've only seen ${count} income event${count === 1 ? '' : 's'}${last}. I'm still learning your income rhythm, so I won't guess dates yet.`,
    }
  }
  if (reg.confidence < 0.5) {
    return {
      text: `Based on ${reg.sampleSize} events, income looks ${
        reg.value >= 70 ? 'fairly regular' : 'irregular'
      } so far${last}, but I need more weeks before predicting a next payment date.`,
    }
  }
  return {
    text: `${regularityCopy(reg.value)} I'd plan around that rhythm rather than a fixed budget. Last income recorded ${describeAgo(daysAgo ?? 0)}.`,
  }
}

function commitmentReply(ctx: ChatContext): ChatReply {
  const rel = ctx.model.signals.commitmentReliability
  if (rel.sampleSize === 0) {
    return {
      text: "No past commitment outcomes recorded yet. Mark each one Paid or Missed in Life Events, and I'll track your reliability.",
    }
  }
  const pct = Math.round(rel.value)
  const verdict =
    pct >= 80
      ? 'that reliability is a genuine strength'
      : pct >= 60
        ? 'solid \u2014 with room to protect the ones that slip'
        : 'but recent misses matter \u2014 protect the most important commitment first'
  const text =
    rel.confidence >= 0.5
      ? `Based on ${rel.sampleSize} recent outcomes, you've followed through ${pct}% of the time \u2014 ${verdict}.`
      : `Looking at ${rel.sampleSize} past outcome${rel.sampleSize === 1 ? '' : 's'}, you're at ${pct}% so far. Still early signal \u2014 keep marking outcomes and this sharpens.`
  return { text }
}

function overviewReply(ctx: ChatContext): ChatReply {
  const { model, balance, safeToSpend, upcomingTotal, shortfall } = ctx
  return {
    text: `Right now you're ${stateLabel(model.state)} \u2014 ${formatMoney(balance)} on hand, ${formatMoney(
      safeToSpend,
    )} safe to spend after ${formatMoney(upcomingTotal)} of commitments. ${
      model.stateDetail.runwayDays < 999
        ? `Your buffer covers roughly ${model.stateDetail.runwayDays} days of essentials.`
        : ''
    }${
      shortfall > 0
        ? ` ${formatMoney(shortfall)} of upcoming commitments is not yet covered by your balance.`
        : ''
    }`,
  }
}
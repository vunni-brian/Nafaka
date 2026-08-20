import type { BehaviorInsight, BehaviorModel } from './brain/types'
import { generateInsights } from './brain/insights'
import type { Commitment } from './store'

export type AppNotification = {
  id: string
  kind: 'insight' | 'commitment' | 'daily' | 'info'
  title: string
  detail: string
}

type BuildInput = {
  commitments: Commitment[]
  behaviorModel: BehaviorModel
  safeToSpend: number
  notificationsOptIn: boolean | null
}

export function commitmentDueLabel(when: string): string {
  const lower = when.toLowerCase()
  if (lower.includes('tomorrow')) return 'Due tomorrow'
  if (lower.includes('today')) return 'Due today'
  const inDays = lower.match(/\b(\d+)\s+day/i)
  if (inDays && when.toLowerCase().includes('in')) return `Due in ${inDays[1]} days`
  const daysAgo = lower.match(/\b(\d+)\s+week/i)
  if (daysAgo) return `Recurring (${daysAgo[1]} week${daysAgo[1] === '1' ? '' : 's'} cycle)`
  return lowercaseFirst(when)
}

function lowercaseFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function insightToNotification(insight: BehaviorInsight): AppNotification {
  const titles: Record<BehaviorInsight['severity'], string> = {
    info: 'New insight',
    watch: 'Something to watch',
    action: 'Worth acting on',
  }
  return {
    id: `insight-${insight.id}`,
    kind: 'insight',
    title: titles[insight.severity],
    detail: insight.text,
  }
}

export function buildNotifications(input: BuildInput): AppNotification[] {
  const items: AppNotification[] = []

  const insight = generateInsights(input.behaviorModel)[0]
  if (insight) items.push(insightToNotification(insight))

  for (const c of input.commitments) {
    if (c.status !== 'upcoming') continue
    items.push({
      id: `commitment-${c.id}`,
      kind: 'commitment',
      title: `${commitmentDueLabel(c.when)} · ${c.label}`,
      detail: `UGX ${c.amount.toLocaleString()} is coming up. Your safe-to-spend already accounts for it.`,
    })
  }

  if (input.notificationsOptIn) {
    items.push({
      id: 'daily-safe-to-spend',
      kind: 'daily',
      title: 'Good morning',
      detail: `Here's your safe-to-spend for today: UGX ${input.safeToSpend.toLocaleString()}, after protecting upcoming commitments.`,
    })
  }

  return items
}

export function formatUGX(amount: number): string {
  return `UGX ${amount.toLocaleString()}`
}
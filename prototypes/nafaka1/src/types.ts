export type Screen =
  | 'today'
  | 'patterns'
  | 'health'
  | 'review'
  | 'chat'
  | 'events'
  | 'support'
  | 'notifications'
  | 'settings';

export type DemoStage = 'week1' | 'week4' | 'week12';

export type TxnType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TxnType;
  amount: number;
  category: string;
  subcategory?: string;
  note?: string;
  date: string; // ISO
  isCommitment?: boolean;
  isDiscretionary?: boolean;
  isSocialObligation?: boolean;
  source?: 'formal' | 'informal' | 'irregular';
  method?: 'cash' | 'mtn' | 'airtel' | 'bank' | 'sacco';
}

export interface Signal {
  key: string;
  label: string;
  value: number; // 0-100 normalized where relevant
  display: string; // human readable value
  status: 'good' | 'ok' | 'watch';
  trend?: 'up' | 'down' | 'flat';
  description: string;
}

export interface Pattern {
  id: string;
  title: string;
  detail: string;
  status: 'emerging' | 'confirmed';
  confidence: number;
  icon: string;
  tone: 'neutral' | 'positive' | 'watch';
}

export interface Commitment {
  id: string;
  name: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'termly';
  dueDay: string;
  category: string;
  lastPaid: string;
  nextDue: string;
  reliability: number; // %
}

export interface LifeEvent {
  id: string;
  title: string;
  date: string;
  impact: string;
  type: 'income' | 'expense' | 'milestone';
  tone: 'positive' | 'neutral' | 'watch';
}

export interface SupportContact {
  id: string;
  name: string;
  relationship: string;
  direction: 'gives' | 'receives' | 'mutual';
  totalYtd: number;
  lastTransfer: string;
  reliability: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'nafaka';
  text: string;
  ts: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  type: 'insight' | 'reminder' | 'milestone' | 'coach';
  read: boolean;
}

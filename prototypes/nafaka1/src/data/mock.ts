import type {
  Transaction,
  Signal,
  Pattern,
  Commitment,
  LifeEvent,
  SupportContact,
  ChatMessage,
  Notification,
  DemoStage,
} from '@/types';

export const user = {
  name: 'Aisha',
  location: 'Kampala, Uganda',
  joinedDays: 84,
  confidence: 72,
  stage: 'Active coaching' as const,
  currency: 'UGX',
};

export const fmt = (n: number, currency = 'UGX') => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M ${currency}`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}k ${currency}`;
  return `${n} ${currency}`;
};
export const fmtFull = (n: number, currency = 'UGX') =>
  `${n.toLocaleString('en-US')} ${currency}`.replace(/\$/g, '');

export const balance = 1_840_000;
export const daysOfBuffer = 9;

export const thisWeek = {
  income: 1_350_000,
  expenses: 980_000,
  discretionary: 240_000,
  commitments: 620_000,
  social: 130_000,
  deltaPct: 22,
  discretionaryDelta: -8,
};

export const transactions: Transaction[] = [
  { id: 't1', type: 'income', amount: 1350000, category: 'Salary', subcategory: 'Formal', note: 'August salary', date: '2026-08-15', source: 'formal', method: 'bank' },
  { id: 't2', type: 'expense', amount: 450000, category: 'Rent', note: 'August rent', date: '2026-08-16', isCommitment: true, method: 'bank' },
  { id: 't3', type: 'expense', amount: 180000, category: 'Food', subcategory: 'Market', note: 'Owino market run', date: '2026-08-16', isDiscretionary: false, method: 'cash' },
  { id: 't4', type: 'expense', amount: 90000, category: 'Transport', subcategory: 'Boda boda', date: '2026-08-16', isDiscretionary: true, method: 'mtn' },
  { id: 't5', type: 'expense', amount: 70000, category: 'Tithe', note: 'Sunday offering', date: '2026-08-17', isSocialObligation: true, isCommitment: true, method: 'cash' },
  { id: 't6', type: 'expense', amount: 120000, category: 'Airtime & Data', subcategory: 'MTN data bundle', date: '2026-08-14', isDiscretionary: true, method: 'mtn' },
  { id: 't7', type: 'expense', amount: 60000, category: 'Family', note: 'Send to mama', date: '2026-08-15', isSocialObligation: true, method: 'mtn' },
  { id: 't8', type: 'expense', amount: 35000, category: 'Food', subcategory: 'Lunch', date: '2026-08-15', isDiscretionary: true, method: 'cash' },
  { id: 't9', type: 'income', amount: 200000, category: 'Side gig', subcategory: 'Tailoring', note: '3 dresses', date: '2026-08-12', source: 'informal', method: 'cash' },
  { id: 't10', type: 'expense', amount: 50000, category: 'SACCO', note: 'Savings contribution', date: '2026-08-12', isCommitment: true, method: 'sacco' },
];

export const signals: Signal[] = [
  {
    key: 'income_volatility',
    label: 'Income Volatility',
    value: 38,
    display: 'Moderately irregular',
    status: 'ok',
    trend: 'flat',
    description: 'Your income arrives every 2-4 weeks with some variation in amount. Not bad - just worth building a buffer.',
  },
  {
    key: 'post_income_spending',
    label: 'Post-Income Spending',
    value: 28,
    display: '28% within 72h',
    status: 'good',
    trend: 'down',
    description: 'You spend slowly after receiving income. Only 28% moves within 3 days - a sign of deliberate spending.',
  },
  {
    key: 'commitment_reliability',
    label: 'Commitment Reliability',
    value: 100,
    display: '100% on time',
    status: 'good',
    trend: 'up',
    description: 'You have paid every recurring obligation within the expected window. Excellent.',
  },
  {
    key: 'financial_slack',
    label: 'Financial Slack',
    value: 54,
    display: '9 days of buffer',
    status: 'ok',
    trend: 'up',
    description: 'Your current balance covers about 9 days of typical expenses. Aim for 14 for extra resilience.',
  },
  {
    key: 'social_obligation',
    label: 'Social Obligation Load',
    value: 22,
    display: '22% of income',
    status: 'ok',
    trend: 'flat',
    description: 'Family, tithe, and community take about 22% of your income. Within a healthy range for your context.',
  },
  {
    key: 'spending_elasticity',
    label: 'Spending Elasticity',
    value: 41,
    display: 'Low elasticity',
    status: 'good',
    trend: 'flat',
    description: 'When income rises, your discretionary spending rises only slightly. You keep habits stable.',
  },
  {
    key: 'savings_consistency',
    label: 'Savings Consistency',
    value: 67,
    display: '3 of last 4 weeks',
    status: 'good',
    trend: 'up',
    description: 'You saved in 3 of the last 4 weeks, mostly to your SACCO. Building a strong habit.',
  },
  {
    key: 'decision_velocity',
    label: 'Decision Velocity',
    value: 72,
    display: '~2.4 days',
    status: 'ok',
    trend: 'flat',
    description: 'You take about 2 days between income and major expense decisions - thoughtful, not impulsive.',
  },
];

export const patterns: Pattern[] = [
  {
    id: 'p1',
    title: 'You spend 18% more on weekends',
    detail: 'Friday to Sunday spending is consistently higher, mostly on food and transport. Based on 8 weekends.',
    status: 'confirmed',
    confidence: 82,
    icon: 'calendar',
    tone: 'neutral',
  },
  {
    id: 'p2',
    title: 'Rent week is your biggest spend',
    detail: 'The week of the 15th always spikes due to rent. Your discretionary spending actually drops that week.',
    status: 'confirmed',
    confidence: 88,
    icon: 'home',
    tone: 'positive',
  },
  {
    id: 'p3',
    title: 'Income arrives mid-month',
    detail: 'Your salary lands between the 14th and 17th. Side gig income is less predictable.',
    status: 'confirmed',
    confidence: 76,
    icon: 'wallet',
    tone: 'neutral',
  },
  {
    id: 'p4',
    title: 'You send to family right after pay',
    detail: 'Family transfers cluster within 48 hours of income. Emerging pattern over 3 cycles.',
    status: 'emerging',
    confidence: 48,
    icon: 'users',
    tone: 'neutral',
  },
  {
    id: 'p5',
    title: 'SACCO contributions are steady',
    detail: 'Your weekly SACCO deposit has not missed in 6 weeks. Strong habit forming.',
    status: 'emerging',
    confidence: 55,
    icon: 'piggy',
    tone: 'positive',
  },
];

export const commitments: Commitment[] = [
  { id: 'c1', name: 'Rent - Ntinda', amount: 450000, frequency: 'monthly', dueDay: '15th', category: 'Housing', lastPaid: 'Aug 16', nextDue: 'Sep 15', reliability: 100 },
  { id: 'c2', name: 'SACCO savings', amount: 50000, frequency: 'weekly', dueDay: 'Tuesday', category: 'Savings', lastPaid: 'Aug 12', nextDue: 'Aug 19', reliability: 100 },
  { id: 'c3', name: 'School fees - niece', amount: 300000, frequency: 'termly', dueDay: 'Start of term', category: 'Education', lastPaid: 'May 30', nextDue: 'Sep 5', reliability: 92 },
  { id: 'c4', name: 'Tithe', amount: 70000, frequency: 'weekly', dueDay: 'Sunday', category: 'Faith', lastPaid: 'Aug 17', nextDue: 'Aug 24', reliability: 100 },
  { id: 'c5', name: 'Mama (family support)', amount: 120000, frequency: 'monthly', dueDay: 'After pay', category: 'Family', lastPaid: 'Aug 15', nextDue: '~Sep 15', reliability: 95 },
];

export const lifeEvents: LifeEvent[] = [
  { id: 'e1', title: 'School fees due for niece', date: 'Sep 5, 2026', impact: 'UGX 300,000 expense', type: 'expense', tone: 'watch' },
  { id: 'e2', title: 'SACCO payout cycle', date: 'Oct 12, 2026', impact: 'Expected UGX 2.4M savings release', type: 'income', tone: 'positive' },
  { id: 'e3', title: 'Brother wedding contribution', date: 'Nov 2, 2026', impact: 'Community obligation ~UGX 150,000', type: 'expense', tone: 'neutral' },
  { id: 'e4', title: '6 months using Nafaka', date: 'Aug 28, 2026', impact: 'Confidence reaches 90%', type: 'milestone', tone: 'positive' },
  { id: 'e5', title: 'Contract renewal (side gig)', date: 'Sep 20, 2026', impact: 'May shift income pattern', type: 'income', tone: 'neutral' },
];

export const supportContacts: SupportContact[] = [
  { id: 's1', name: 'Mama', relationship: 'Mother', direction: 'gives', totalYtd: 980000, lastTransfer: 'Aug 15', reliability: 95 },
  { id: 's2', name: 'David', relationship: 'Brother', direction: 'mutual', totalYtd: 240000, lastTransfer: 'Jul 30', reliability: 80 },
  { id: 's3', name: 'SACCO Ntinda', relationship: 'Savings group', direction: 'receives', totalYtd: 1200000, lastTransfer: 'Aug 12', reliability: 100 },
  { id: 's4', name: 'Pastor Grace', relationship: 'Church', direction: 'gives', totalYtd: 840000, lastTransfer: 'Aug 17', reliability: 100 },
  { id: 's5', name: 'Auntie Joy', relationship: 'Extended family', direction: 'mutual', totalYtd: 180000, lastTransfer: 'Jul 4', reliability: 70 },
];

export const healthScore = {
  total: 74,
  change: 3,
  dimensions: [
    { label: 'Resilience', score: 68, note: '9 days of buffer', status: 'ok' as const },
    { label: 'Commitments', score: 96, note: '100% on time', status: 'good' as const },
    { label: 'Income stability', score: 62, note: 'Moderately irregular', status: 'ok' as const },
    { label: 'Spending control', score: 78, note: 'Low elasticity', status: 'good' as const },
    { label: 'Savings habit', score: 70, note: '3 of 4 weeks', status: 'good' as const },
    { label: 'Social balance', score: 72, note: '22% of income', status: 'ok' as const },
  ],
};

export const weeklyReview = {
  weekLabel: 'Aug 11 - Aug 17',
  headline: 'You spent 22% more this week, but it was rent week.',
  body: 'Most of the increase came from your rent payment on the 16th. Your discretionary spending actually fell 8% - nothing to correct here.',
  discretionaryDelta: -8,
  totalDelta: 22,
  highlights: [
    { label: 'Income received', value: 'UGX 1.35M', tone: 'positive' as const },
    { label: 'Commitments paid', value: '4 of 4', tone: 'positive' as const },
    { label: 'Saved to SACCO', value: 'UGX 50k', tone: 'positive' as const },
    { label: 'Discretionary change', value: '-8%', tone: 'positive' as const },
  ],
  nextWeek: [
    'School fees for your niece are due Sep 5 - consider setting aside UGX 50k this week.',
    'You are 3 days of buffer away from the 14-day resilience target.',
  ],
};

export const chatSeed: ChatMessage[] = [
  {
    id: 'm1',
    role: 'nafaka',
    text: "Hi Aisha. I have 12 weeks of your behavior now, so my coaching is getting sharper. Ask me anything about your money this week.",
    ts: '8:40 AM',
  },
];

export const chatSuggestions = [
  'Why did I spend more this month?',
  'How is my financial health?',
  'When will I get paid again?',
  'Can I afford school fees in Sep?',
];

export const notifications: Notification[] = [
  { id: 'n1', title: 'Weekly review ready', body: 'You spent 22% more - but it was rent week. Discretionary spending fell 8%.', time: '8:40 AM', type: 'coach', read: false },
  { id: 'n2', title: 'Commitment reminder', body: 'SACCO savings of UGX 50k due tomorrow (Tuesday).', time: '7:15 AM', type: 'reminder', read: false },
  { id: 'n3', title: 'Pattern confirmed', body: 'Rent week spike is now a confirmed pattern. Your discretionary drops that week.', time: 'Yesterday', type: 'insight', read: true },
  { id: 'n4', title: 'Confidence up', body: 'Nafaka now knows you at 72% confidence. Full coaching active.', time: '2 days ago', type: 'milestone', read: true },
  { id: 'n5', title: 'Buffer insight', body: 'You have 9 days of buffer. 5 more days reaches the 14-day resilience target.', time: '3 days ago', type: 'insight', read: true },
];

// ---- Chart data (week12) ----
export const incomeTrend = [820_000, 1_100_000, 950_000, 1_280_000, 1_150_000, 1_350_000];
export const incomeTrendLabels = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
export const weeklySpend = [620_000, 740_000, 880_000, 610_000, 790_000, 980_000];
export const weeklySpendLabels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];
export const spendBreakdown = [
  { label: 'Commitments', value: 620_000, color: '#19bd80' },
  { label: 'Food', value: 215_000, color: '#f27d14' },
  { label: 'Transport', value: 90_000, color: '#65718a' },
  { label: 'Social', value: 130_000, color: '#d4a82a' },
  { label: 'Discretionary', value: 125_000, color: '#b0b7c6' },
];

// ---- Demo stages ----
export type StageProfile = {
  joinedDays: number;
  confidence: number;
  stage: string;
  balance: number;
  txnCount: number;
  hasPatterns: boolean;
  hasHealth: boolean;
  hasReview: boolean;
  greeting: string;
  learningNote: string;
  signals: Signal[];
  patterns: Pattern[];
};

export const stages: Record<DemoStage, StageProfile> = {
  week1: {
    joinedDays: 4,
    confidence: 10,
    stage: 'Still learning you',
    balance: 420_000,
    txnCount: 6,
    hasPatterns: false,
    hasHealth: false,
    hasReview: false,
    greeting: "Welcome to Nafaka. I'm learning how you handle money - no questions asked.",
    learningNote: 'I need about 3 weeks of your activity before I can spot patterns and start coaching. Just log income and expenses as they happen.',
    signals: [],
    patterns: [],
  },
  week4: {
    joinedDays: 26,
    confidence: 40,
    stage: 'Emerging patterns',
    balance: 980_000,
    txnCount: 34,
    hasPatterns: true,
    hasHealth: false,
    hasReview: true,
    greeting: "You're 4 weeks in. I'm starting to see how your money moves.",
    learningNote: 'Some patterns are emerging. They will confirm as I get more data.',
    signals: signals.slice(0, 3).map((s) => ({ ...s, status: 'ok' as const, description: 'Still calculating - emerging signal.' })),
    patterns: [patterns[3], patterns[4]],
  },
  week12: {
    joinedDays: 84,
    confidence: 72,
    stage: 'Active coaching',
    balance: 1_840_000,
    txnCount: 112,
    hasPatterns: true,
    hasHealth: true,
    hasReview: true,
    greeting: 'Good morning, Aisha. Your behavior is clear enough for real coaching now.',
    learningNote: 'Full intelligence active. Patterns confirmed, health score stable, weekly coaching personalized.',
    signals,
    patterns,
  },
};

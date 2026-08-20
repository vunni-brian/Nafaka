import { useEffect } from 'react';

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full sm:max-w-md max-h-[88vh] overflow-y-auto rounded-t-xl2 sm:rounded-xl2 bg-white shadow-card animate-scale-in">
        <div className="sticky top-0 flex items-center justify-between bg-white/90 backdrop-blur px-5 py-4 border-b border-ink-100">
          <h2 className="font-display text-lg font-semibold text-ink-900">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-ink-500 hover:bg-ink-100 transition">
            <span className="block h-5 w-5 relative">
              <span className="absolute left-1/2 top-1/2 h-0.5 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current" />
              <span className="absolute left-1/2 top-1/2 h-0.5 w-4 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-current" />
            </span>
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="sticky bottom-0 bg-white/90 backdrop-blur px-5 py-3 border-t border-ink-100">{footer}</div>}
      </div>
    </div>
  );
}

export function SectionTitle({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-3">
      <div>
        <h3 className="font-display text-base font-semibold text-ink-900">{title}</h3>
        {hint && <p className="text-xs text-ink-500 mt-0.5">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatPill({ tone = 'neutral', children }: { tone?: 'positive' | 'watch' | 'neutral'; children: React.ReactNode }) {
  const tones = {
    positive: 'bg-brand-100 text-brand-700',
    watch: 'bg-accent-100 text-accent-700',
    neutral: 'bg-ink-100 text-ink-600',
  };
  return <span className={`pill ${tones[tone]}`}>{children}</span>;
}

export function Ring({
  value,
  size = 64,
  stroke = 6,
  tone = 'brand',
  label,
  sublabel,
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: 'brand' | 'accent' | 'ink';
  label?: string;
  sublabel?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const colors = {
    brand: '#19bd80',
    accent: '#f27d14',
    ink: '#65718a',
  };
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eceef2" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={colors[tone]}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && <span className="text-sm font-bold text-ink-900 leading-none">{label}</span>}
        {sublabel && <span className="text-[10px] text-ink-500 mt-0.5">{sublabel}</span>}
      </div>
    </div>
  );
}

export function Sparkline({ data, tone = 'brand' }: { data: number[]; tone?: 'brand' | 'accent' | 'ink' }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const h = 32;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  const colors = { brand: '#19bd80', accent: '#f27d14', ink: '#65718a' };
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-8">
      <polyline points={pts} fill="none" stroke={colors[tone]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 rounded-full bg-ink-200 overflow-hidden">
        <div className="h-full rounded-full bg-brand-500" style={{ width: `${value}%`, transition: 'width 0.8s ease' }} />
      </div>
      <span className="text-xs font-semibold text-ink-600">{value}%</span>
    </div>
  );
}

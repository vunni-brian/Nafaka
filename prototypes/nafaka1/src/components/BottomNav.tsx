import {
  Home,
  LineChart,
  HeartPulse,
  Sparkles,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react';
import type { Screen } from '@/types';

const items: { key: Screen; label: string; icon: LucideIcon }[] = [
  { key: 'today', label: 'Today', icon: Home },
  { key: 'patterns', label: 'Patterns', icon: LineChart },
  { key: 'health', label: 'Health', icon: HeartPulse },
  { key: 'review', label: 'Review', icon: Sparkles },
  { key: 'chat', label: 'Chat', icon: MessageCircle },
];

export function BottomNav({ active, onNavigate }: { active: Screen; onNavigate: (s: Screen) => void }) {
  return (
    <nav className="sticky bottom-0 z-30 border-t border-ink-100 bg-white/85 backdrop-blur-lg">
      <div className="mx-auto max-w-md grid grid-cols-5">
        {items.map((it) => {
          const Icon = it.icon;
          const isActive = active === it.key;
          return (
            <button
              key={it.key}
              onClick={() => onNavigate(it.key)}
              className="relative flex flex-col items-center gap-1 py-2.5 transition"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                  isActive ? 'bg-brand-600 text-white shadow-soft' : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                <Icon size={18} strokeWidth={2.2} />
              </span>
              <span className={`text-[10px] font-semibold ${isActive ? 'text-brand-700' : 'text-ink-500'}`}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

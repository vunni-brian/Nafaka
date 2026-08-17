import { Bell, Sparkles, CalendarClock, TrendingUp, Circle } from 'lucide-react';
import { notifications } from '@/data/mock';

const typeIcon = {
  coach: Sparkles,
  reminder: CalendarClock,
  insight: TrendingUp,
  milestone: Bell,
};

export function NotificationsScreen() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Notifications</h1>
        <p className="text-sm text-ink-500 mt-1">Coaching, reminders, and milestones from Nafaka.</p>
      </div>

      <div className="card divide-y divide-ink-100">
        {notifications.map((n) => {
          const Icon = typeIcon[n.type] ?? Bell;
          return (
            <div key={n.id} className={`flex items-start gap-3 px-4 py-3.5 ${n.read ? '' : 'bg-brand-50/40'}`}>
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  n.type === 'coach'
                    ? 'bg-brand-100 text-brand-700'
                    : n.type === 'reminder'
                    ? 'bg-accent-100 text-accent-700'
                    : 'bg-ink-100 text-ink-600'
                }`}
              >
                <Icon size={16} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-ink-900">{n.title}</p>
                  {!n.read && <Circle size={7} className="fill-brand-600 text-brand-600" />}
                </div>
                <p className="text-xs text-ink-600 mt-1 leading-relaxed">{n.body}</p>
                <p className="text-[10px] text-ink-400 mt-1.5">{n.time}</p>
              </div>
            </div>
          );
        })}
      </div>

      <button className="btn-ghost w-full">Mark all as read</button>
    </div>
  );
}

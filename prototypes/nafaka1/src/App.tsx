import { useState } from 'react';
import { Sparkles, Settings as SettingsIcon } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { Onboarding } from '@/components/Onboarding';
import { TodayScreen } from '@/screens/TodayScreen';
import { PatternsScreen } from '@/screens/PatternsScreen';
import { HealthScreen } from '@/screens/HealthScreen';
import { ReviewScreen } from '@/screens/ReviewScreen';
import { ChatScreen } from '@/screens/ChatScreen';
import { EventsScreen } from '@/screens/EventsScreen';
import { SupportScreen } from '@/screens/SupportScreen';
import { NotificationsScreen } from '@/screens/NotificationsScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { stages } from '@/data/mock';
import type { Screen, DemoStage } from '@/types';

const secondaryScreens: Screen[] = ['events', 'support', 'notifications', 'settings'];

export default function App() {
  const [onboarded, setOnboarded] = useState(false);
  const [screen, setScreen] = useState<Screen>('today');
  const [demoStage, setDemoStage] = useState<DemoStage>('week12');

  const stage = stages[demoStage];

  if (!onboarded) {
    return <Onboarding onDone={() => setOnboarded(true)} />;
  }

  const isSecondary = secondaryScreens.includes(screen);
  const isChat = screen === 'chat';

  const navigate = (s: Screen) => setScreen(s);
  const changeStage = (s: DemoStage) => {
    setDemoStage(s);
    navigate('today');
  };

  return (
    <div className="min-h-screen bg-ink-50 flex justify-center">
      <div className="w-full max-w-md flex flex-col bg-ink-50 min-h-screen relative">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-ink-50/85 backdrop-blur-lg border-b border-ink-100">
          <div className="flex items-center justify-between px-5 h-14">
            <button onClick={() => navigate('today')} className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-soft">
                <Sparkles size={17} />
              </span>
              <span className="font-display text-base font-semibold text-ink-900 tracking-tight">Nafaka</span>
            </button>
            <div className="flex items-center gap-1">
              {isSecondary && (
                <button
                  onClick={() => navigate('today')}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-ink-600 hover:bg-ink-100 transition"
                >
                  Back
                </button>
              )}
              <button
                onClick={() => navigate('settings')}
                className={`rounded-lg p-2 transition ${screen === 'settings' ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-100'}`}
              >
                <SettingsIcon size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Screen content */}
        <main className={`flex-1 px-5 pt-4 ${isChat ? 'flex flex-col' : 'pb-6'}`} style={isChat ? { minHeight: 'calc(100vh - 3.5rem - 64px)' } : undefined}>
          {screen === 'today' && <TodayScreen onNavigate={navigate} stage={stage} />}
          {screen === 'patterns' && <PatternsScreen stage={stage} />}
          {screen === 'health' && <HealthScreen stage={stage} />}
          {screen === 'review' && <ReviewScreen onNavigate={navigate} stage={stage} />}
          {screen === 'chat' && <ChatScreen />}
          {screen === 'events' && <EventsScreen />}
          {screen === 'support' && <SupportScreen />}
          {screen === 'notifications' && <NotificationsScreen />}
          {screen === 'settings' && <SettingsScreen onNavigate={navigate} stage={stage} onStageChange={changeStage} />}
        </main>

        {/* Bottom nav (primary screens only) */}
        {!isSecondary && (
          <div className="sticky bottom-0">
            <BottomNav active={isChat ? 'chat' : screen} onNavigate={navigate} />
          </div>
        )}
      </div>
    </div>
  );
}

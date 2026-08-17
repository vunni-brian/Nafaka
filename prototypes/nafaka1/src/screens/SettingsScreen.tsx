import { MapPin, CalendarDays, Sparkles, ShieldCheck, Bell, Globe, Lock, ChevronRight, LogOut, FlaskConical } from 'lucide-react';
import { SectionTitle, ConfidenceBar } from '@/components/ui';
import { user, commitments } from '@/data/mock';
import type { Screen, DemoStage } from '@/types';
import type { StageProfile } from '@/data/mock';

export function SettingsScreen({ onNavigate, stage, onStageChange }: { onNavigate: (s: Screen) => void; stage: StageProfile; onStageChange: (s: DemoStage) => void }) {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Profile</h1>
        <p className="text-sm text-ink-500 mt-1">Your account, behavior model, and preferences.</p>
      </div>

      {/* Profile card */}
      <div className="card p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white font-display text-xl font-semibold">
            {user.name[0]}
          </div>
          <div className="flex-1">
            <p className="font-display text-lg font-semibold text-ink-900">{user.name}</p>
            <p className="text-xs text-ink-500 flex items-center gap-1 mt-0.5">
              <MapPin size={12} /> {user.location}
            </p>
            <p className="text-xs text-ink-500 flex items-center gap-1 mt-0.5">
              <CalendarDays size={12} /> Using Nafaka for {stage.joinedDays} days
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-ink-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-brand-600" />
              <p className="text-sm font-semibold text-ink-900">Behavioral confidence</p>
            </div>
            <ConfidenceBar value={stage.confidence} />
          </div>
          <p className="text-xs text-ink-500 mt-2">{stage.stage}. Full intelligence unlocks at 90%.</p>
        </div>
      </div>

      {/* Commitments */}
      <div>
        <SectionTitle title="Recurring commitments" hint={`${commitments.length} tracked`} />
        <div className="card divide-y divide-ink-100">
          {commitments.map((c) => (
            <div key={c.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-900 truncate">{c.name}</p>
                <p className="text-xs text-ink-500">
                  {c.frequency} · {c.dueDay} · next {c.nextDue}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-ink-900">UGX {(c.amount / 1000).toFixed(0)}k</p>
                <p className="text-[10px] text-brand-700 font-semibold">{c.reliability}% reliable</p>
              </div>
            </div>
          ))}
        </div>
        <button className="btn-ghost w-full mt-3">+ Add commitment</button>
      </div>

      {/* Preferences */}
      <div>
        <SectionTitle title="Preferences" />
        <div className="card divide-y divide-ink-100">
          <Row icon={<Bell size={17} />} label="Notifications" value="On" />
          <Row icon={<Globe size={17} />} label="Region context" value="Uganda" />
          <Row icon={<ShieldCheck size={17} />} label="Judgment filter" value="Always on" />
          <Row icon={<Lock size={17} />} label="Privacy & data" />
        </div>
      </div>

      {/* Demo stage switcher */}
      <div>
        <SectionTitle title="Demo timeline" hint="See how Nafaka evolves over time" />
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <FlaskConical size={15} className="text-brand-600" />
            <p className="text-sm font-semibold text-ink-900">Jump to a stage</p>
          </div>
          <p className="text-xs text-ink-500 mb-3 leading-relaxed">
            Explore how the app changes as Nafaka learns more about you - from day 1 to full coaching.
          </p>
          <div className="grid grid-cols-3 gap-2">
            <StageButton label="Week 1" sub="10% conf" active={stage.confidence < 40} onClick={() => onStageChange('week1')} />
            <StageButton label="Week 4" sub="40% conf" active={stage.confidence >= 40 && stage.confidence < 70} onClick={() => onStageChange('week4')} />
            <StageButton label="Week 12" sub="72% conf" active={stage.confidence >= 70} onClick={() => onStageChange('week12')} />
          </div>
        </div>
      </div>

      {/* Secondary nav */}
      <div>
        <SectionTitle title="More" />
        <div className="card divide-y divide-ink-100">
          <NavRow label="Life events" onClick={() => onNavigate('events')} />
          <NavRow label="Support network" onClick={() => onNavigate('support')} />
          <NavRow label="Notifications" onClick={() => onNavigate('notifications')} />
        </div>
      </div>

      <button className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-accent-700 hover:bg-accent-50 transition">
        <LogOut size={16} /> Sign out
      </button>

      <p className="text-center text-[11px] text-ink-400">Nafaka 2.0 · Behavioral Financial Intelligence</p>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-100 text-ink-600">{icon}</span>
      <p className="text-sm font-medium text-ink-800 flex-1">{label}</p>
      {value && <p className="text-xs font-semibold text-ink-500">{value}</p>}
      <ChevronRight size={16} className="text-ink-300" />
    </div>
  );
}

function NavRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center w-full px-4 py-3.5 hover:bg-ink-50 transition">
      <p className="text-sm font-medium text-ink-800 flex-1 text-left">{label}</p>
      <ChevronRight size={16} className="text-ink-300" />
    </button>
  );
}

function StageButton({ label, sub, active, onClick }: { label: string; sub: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-2 py-3 text-center transition ${
        active ? 'border-brand-500 bg-brand-50 text-brand-800' : 'border-ink-200 text-ink-600 hover:border-ink-300'
      }`}
    >
      <p className="text-sm font-bold">{label}</p>
      <p className="text-[10px] mt-0.5 opacity-70">{sub}</p>
    </button>
  );
}

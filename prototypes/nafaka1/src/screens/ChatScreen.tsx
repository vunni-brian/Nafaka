import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User } from 'lucide-react';
import { ConfidenceBar } from '@/components/ui';
import { chatSeed, chatSuggestions, user } from '@/data/mock';
import type { ChatMessage } from '@/types';

const canned: Record<string, string> = {
  'Why did I spend more this month?':
    "Your spending increased about 15% this month, but most of it came from your rent payment on the 16th and a school fees top-up. Your discretionary spending - food, transport, airtime - actually fell 8%. There is nothing to correct here.",
  'How is my financial health?':
    "Your Financial Health Score is 74 out of 100, up 3 points this month. Your strongest dimension is commitment reliability at 96 - you have paid every recurring obligation on time. Your growth area is resilience: you have 9 days of buffer, and reaching 14 would push your score above 80.",
  'When will I get paid again?':
    "Based on 3 months of data, your salary lands between the 14th and 17th of each month. I expect your next salary around September 15. Your side gig income is less predictable - it has arrived anywhere from the 8th to the 22nd.",
  'Can I afford school fees in Sep?':
    "Your niece's school fees are UGX 300,000 due September 5. Your current balance is UGX 1.84M with 9 days of buffer. You can cover it comfortably, but I would suggest setting aside UGX 50,000 this week so the payment does not eat into your buffer all at once.",
};

export function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>(chatSeed);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: `u${Date.now()}`, role: 'user', text, ts: now() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const reply = canned[text] ?? "I'm still learning that part of your behavior. With a few more weeks of data, I'll be able to give you a precise, contextual answer.";
      setMessages((m) => [...m, { id: `n${Date.now()}`, role: 'nafaka', text: reply, ts: now() }]);
      setTyping(false);
    }, 900);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-ink-100">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Sparkles size={18} />
          </span>
          <div>
            <p className="font-display text-base font-semibold text-ink-900">Nafaka AI</p>
            <p className="text-[11px] text-ink-500">Behavioral coaching · {user.confidence}% confidence</p>
          </div>
        </div>
        <ConfidenceBar value={user.confidence} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                m.role === 'user' ? 'bg-ink-900 text-white' : 'bg-brand-600 text-white'
              }`}
            >
              {m.role === 'user' ? <User size={15} /> : <Sparkles size={15} />}
            </span>
            <div
              className={`max-w-[78%] rounded-xl2 px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === 'user' ? 'bg-ink-900 text-white' : 'bg-white border border-ink-100 text-ink-800 shadow-card'
              }`}
            >
              <p>{m.text}</p>
              <p className={`text-[10px] mt-1.5 ${m.role === 'user' ? 'text-white/50' : 'text-ink-400'}`}>{m.ts}</p>
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Sparkles size={15} />
            </span>
            <div className="bg-white border border-ink-100 rounded-xl2 px-4 py-3 shadow-card">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-ink-300 animate-pulse-soft" />
                <span className="h-1.5 w-1.5 rounded-full bg-ink-300 animate-pulse-soft" style={{ animationDelay: '0.2s' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-ink-300 animate-pulse-soft" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="pb-3">
          <p className="text-xs font-medium text-ink-500 mb-2">Try asking</p>
          <div className="flex flex-wrap gap-2">
            {chatSuggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-brand-400 hover:text-brand-700 transition"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 pt-2 border-t border-ink-100">
        <input
          className="flex-1 rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          placeholder="Ask about your money behavior..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-40 active:scale-95"
        >
          <Send size={17} />
        </button>
      </div>
    </div>
  );
}

function now() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

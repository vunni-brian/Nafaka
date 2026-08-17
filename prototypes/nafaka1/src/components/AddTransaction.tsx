import { useState } from 'react';
import { Check, Plus, Minus } from 'lucide-react';
import { Modal } from '@/components/ui';
import type { TxnType } from '@/types';

const categories = {
  income: ['Salary', 'Side gig', 'SACCO payout', 'Family support received', 'Gift', 'Other income'],
  expense: ['Food', 'Transport', 'Rent', 'Airtime & Data', 'Tithe', 'Family', 'SACCO', 'School fees', 'Health', 'Other'],
};

const methods = [
  { key: 'cash', label: 'Cash' },
  { key: 'mtn', label: 'MTN MoMo' },
  { key: 'airtel', label: 'Airtel Money' },
  { key: 'bank', label: 'Bank' },
  { key: 'sacco', label: 'SACCO' },
];

export function AddTransactionModal({ open, onClose, type: initialType }: { open: boolean; onClose: () => void; type: TxnType }) {
  const [type, setType] = useState<TxnType>(initialType);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [method, setMethod] = useState('cash');
  const [note, setNote] = useState('');
  const [flags, setFlags] = useState({ commitment: false, discretionary: false, social: false });
  const [done, setDone] = useState(false);

  const toggleFlag = (k: keyof typeof flags) => setFlags((f) => ({ ...f, [k]: !f[k] }));

  const submit = () => {
    setDone(true);
    setTimeout(() => {
      setDone(false);
      setAmount('');
      setCategory('');
      setNote('');
      setFlags({ commitment: false, discretionary: false, social: false });
      onClose();
    }, 1100);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={type === 'income' ? 'Add income' : 'Add expense'}
      footer={
        <button className="btn-primary w-full" onClick={submit} disabled={!amount || !category || done}>
          {done ? (
            <>
              <Check size={18} /> Saved
            </>
          ) : (
            'Save transaction'
          )}
        </button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 p-1 bg-ink-100 rounded-xl">
          {(['income', 'expense'] as TxnType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-lg py-2 text-sm font-semibold capitalize transition ${
                type === t ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-500'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div>
          <label className="text-xs font-semibold text-ink-600 mb-1.5 block">Amount (UGX)</label>
          <div className="relative">
            <input
              className="input pl-10 text-lg font-semibold"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 font-medium">UGX</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-ink-600 mb-1.5 block">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories[type].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  category === c ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-ink-600 mb-1.5 block">Payment method</label>
          <div className="grid grid-cols-5 gap-1.5">
            {methods.map((m) => (
              <button
                key={m.key}
                onClick={() => setMethod(m.key)}
                className={`rounded-lg py-2 text-[11px] font-semibold transition ${
                  method === m.key ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-ink-600 mb-1.5 block">Note (optional)</label>
          <input className="input" placeholder="What was this for?" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        {type === 'expense' && (
          <div>
            <label className="text-xs font-semibold text-ink-600 mb-1.5 block">Behavioral tags</label>
            <div className="space-y-1.5">
              <FlagToggle label="Recurring commitment" on={flags.commitment} onClick={() => toggleFlag('commitment')} />
              <FlagToggle label="Discretionary (want, not need)" on={flags.discretionary} onClick={() => toggleFlag('discretionary')} />
              <FlagToggle label="Social / family obligation" on={flags.social} onClick={() => toggleFlag('social')} />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function FlagToggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm transition ${
        on ? 'border-brand-500 bg-brand-50 text-brand-800' : 'border-ink-200 text-ink-600 hover:border-ink-300'
      }`}
    >
      <span className="font-medium">{label}</span>
      <span className={`flex h-5 w-5 items-center justify-center rounded-md ${on ? 'bg-brand-600 text-white' : 'bg-ink-100'}`}>
        {on ? <Check size={13} /> : <Plus size={13} className="text-ink-400" />}
      </span>
    </button>
  );
}

export function QuickAdd({ onPick }: { onPick: (t: TxnType) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button onClick={() => onPick('income')} className="btn-ghost group">
        <Plus size={16} className="text-brand-600" /> Add income
      </button>
      <button onClick={() => onPick('expense')} className="btn-ghost group">
        <Minus size={16} className="text-accent-600" /> Add expense
      </button>
    </div>
  );
}

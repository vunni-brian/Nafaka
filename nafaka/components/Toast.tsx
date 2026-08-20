'use client'

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Check, X } from 'lucide-react'

type ToastKind = 'success' | 'error'
type Toast = { id: number; kind: ToastKind; message: string }

const ToastContext = createContext<{ show: (kind: ToastKind, message: string) => void } | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(
    (kind: ToastKind, message: string) => {
      const id = nextId.current++
      setToasts((prev) => [...prev.slice(-2), { id, kind, message }])
      if (kind === 'success') {
        window.setTimeout(() => dismiss(id), 3500)
      }
    },
    [dismiss],
  )

  const value = useMemo(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-36 z-[90] flex flex-col items-center gap-2 px-4 md:bottom-16">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.kind === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-xl bg-ink-900 px-4 py-3 text-sm text-white shadow-card animate-fade-up"
          >
            {t.kind === 'success' ? (
              <Check size={16} className="shrink-0 text-brand-400" aria-hidden="true" />
            ) : (
              <AlertTriangle size={16} className="shrink-0 text-accent-400" aria-hidden="true" />
            )}
            <span className="flex-1">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="shrink-0 cursor-pointer text-white/60 transition-colors hover:text-white"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
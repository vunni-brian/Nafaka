'use client'

import { FinancialProvider } from '@/lib/store'
import FeedbackButton from '@/components/FeedbackButton'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FinancialProvider>
      {children}
      <FeedbackButton />
    </FinancialProvider>
  )
}

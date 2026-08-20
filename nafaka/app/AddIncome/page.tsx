'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGoogleFont } from '@/lib/fonts'
import AppHeader from '@/components/AppHeader'
import { AddTransactionModal } from '@/components/proto/AddTransaction'

export default function AddIncome() {
  const body = useGoogleFont('Manrope')
  const router = useRouter()
  const [open, setOpen] = useState(true)

  const close = () => {
    setOpen(false)
    router.push('/DailySnapshot')
  }

  return (
    <div className="min-h-screen bg-ink-50 md:pl-64" style={{ fontFamily: body }}>
      <AppHeader />
      <AddTransactionModal open={open} onClose={close} type="income" />
    </div>
  )
}
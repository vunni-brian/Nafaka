'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import { useGoogleFont } from '@/lib/fonts'
import { useFinance } from '@/lib/store'
import { ChevronLeft, ChevronRight, Sparkles, Laptop, Check } from 'lucide-react'

export default function Profile() {
  const display = useGoogleFont('Fraunces')
  const body = useGoogleFont('Manrope')
  const { profile, setProfileName } = useFinance()

  const [editing, setEditing] = useState(false)
  const [nameDraft, setNameDraft] = useState(profile.name)

  const handleSaveName = () => {
    if (nameDraft.trim().length > 0) setProfileName(nameDraft.trim())
    setEditing(false)
  }

  return (
    <div className="min-h-screen bg-background pb-32" style={{ fontFamily: body }}>
      <div className="max-w-sm mx-auto px-6 pt-8">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/DailySnapshot"
            className="cursor-pointer w-9 h-9 rounded-full flex items-center justify-center border border-border text-foreground hover:bg-muted transition-colors"
            aria-label="Back"
          >
            <ChevronLeft size={18} />
          </Link>
          <h1 style={{ fontFamily: display }} className="text-lg text-foreground">
            Profile
          </h1>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-secondary/15 flex items-center justify-center text-secondary text-xl font-semibold shrink-0">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="bg-background border border-border rounded-xl px-3 py-2 text-base text-foreground outline-none focus:border-primary w-40"
                  style={{ fontFamily: display }}
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="cursor-pointer w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
                  aria-label="Save name"
                >
                  <Check size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p style={{ fontFamily: display }} className="text-xl text-foreground">
                  {profile.name.charAt(0).toUpperCase() + profile.name.slice(1)}
                </p>
                <button
                  onClick={() => { setNameDraft(profile.name); setEditing(true) }}
                  className="cursor-pointer text-xs text-primary hover:underline"
                >
                  Edit
                </button>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">Demo account</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
              <Laptop size={15} className="text-primary" />
            </span>
            <p className="text-sm font-semibold text-foreground">Financial archetype</p>
          </div>
          <p className="text-sm text-muted-foreground">{profile.archetype}</p>
        </div>

        {profile.priorities.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-full bg-secondary/15 flex items-center justify-center">
                <Sparkles size={15} className="text-secondary" />
              </span>
              <p className="text-sm font-semibold text-foreground">Priorities</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.priorities.map((p) => (
                <span
                  key={p}
                  className="text-xs font-medium text-foreground bg-accent/50 border border-border rounded-full px-3 py-1.5"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        <Link
          href="/Notifications"
          className="cursor-pointer flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3.5 mb-6 hover:bg-muted transition-colors"
        >
          <span className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-primary" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">View notifications</p>
            <p className="text-xs text-muted-foreground">See recent reminders and insights</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </Link>
      </div>

      <BottomNav active="home" />
    </div>
  )
}

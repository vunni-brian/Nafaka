'use client'

import React, { useState } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import { track } from '@/lib/analytics'

export default function FeedbackButton() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)

  const handleSend = () => {
    if (!text.trim()) return
    track('feedback_submitted', { text: text.trim() })
    setSent(true)
    setTimeout(() => { setOpen(false); setSent(false); setText('') }, 2000)
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-50 w-72 bg-card border border-border rounded-2xl shadow-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-foreground">Send feedback</p>
            <button
              onClick={() => setOpen(false)}
              className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close feedback"
            >
              <X size={15} />
            </button>
          </div>
          {sent ? (
            <p className="text-sm text-secondary text-center py-4">Thanks for the feedback!</p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-3">
                What&rsquo;s working? What&rsquo;s confusing? Your input shapes the next version.
              </p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your feedback..."
                rows={3}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground resize-none transition-colors"
              />
              <button
                disabled={!text.trim()}
                onClick={handleSend}
                className={`cursor-pointer mt-2 w-full flex items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-semibold transition-colors ${
                  text.trim()
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                <Send size={13} />
                Send
              </button>
            </>
          )}
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-20 right-4 z-50 w-12 h-12 rounded-full bg-secondary text-secondary-foreground shadow-lg flex items-center justify-center hover:bg-secondary/90 transition-colors cursor-pointer"
        aria-label="Toggle feedback"
      >
        <MessageCircle size={20} />
      </button>
    </>
  )
}

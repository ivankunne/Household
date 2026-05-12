'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useActivityStore } from '@/shared/store/activityStore'
import { useHouseholdStore } from '@/shared/store/householdStore'
import { MascotCharacter } from '@/features/mascot/MascotCharacter'
import type { MascotMood } from '@/mascot/types'

export function MascotBubble() {
  const { mascotMessages, markMascotRead } = useActivityStore()
  const { household } = useHouseholdStore()
  const [dismissed, setDismissed] = useState<string | null>(null)

  const mascotName = household?.settings.mascotName ?? 'Pebble'
  const latest = mascotMessages.find((m) => !m.isRead && m.id !== dismissed)

  const handleDismiss = async () => {
    if (!latest) return
    setDismissed(latest.id)
    await markMascotRead(latest.id)
  }

  if (!latest) return null

  const mood = (latest.mood as MascotMood) ?? 'happy'

  return (
    <AnimatePresence>
      <motion.div
        key={latest.id}
        initial={{ opacity: 0, y: 32, scale: 0.85 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 180, damping: 24 }}
        className="fixed bottom-24 md:bottom-8 right-4 md:right-6 z-50 flex items-end gap-2 max-w-[320px]"
      >
        {/* The character */}
        <MascotCharacter
          mood={mood}
          size={72}
          wiggle
          className="shrink-0 drop-shadow-md"
        />

        {/* Speech bubble */}
        <div className="relative bg-card border border-border rounded-3xl rounded-bl-md shadow-xl px-4 py-3 pr-9">
          <button
            onClick={handleDismiss}
            className="absolute top-2.5 right-2.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <p className="text-[11px] font-bold text-primary mb-1 tracking-wide uppercase">
            {mascotName}
          </p>
          <p className="text-sm text-foreground leading-snug">{latest.text}</p>

          {/* Tail pointing toward mascot (bottom-left) */}
          <div
            className="absolute -bottom-[9px] left-4 w-4 h-4 bg-card border-b border-l border-border"
            style={{ transform: 'rotate(45deg)', borderRadius: '0 0 0 3px' }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

'use client'

import { motion } from 'framer-motion'
import { useHouseholdStore } from '@/shared/store/householdStore'
import { useTaskStore } from '@/shared/store/taskStore'
import { useRoutineStore } from '@/shared/store/routineStore'
import { useMemo } from 'react'

type Tier = { label: string; tagline: string; bg: string; fill: string; text: string }

function getTier(pct: number): Tier {
  if (pct >= 90) return { label: 'Thriving', tagline: 'Your home is glowing ✨', bg: 'bg-emerald-50 dark:bg-emerald-900/20', fill: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300' }
  if (pct >= 60) return { label: 'Cozy', tagline: "Things are running smoothly", bg: 'bg-sky-50 dark:bg-sky-900/20', fill: 'bg-sky-500', text: 'text-sky-700 dark:text-sky-300' }
  if (pct >= 30) return { label: 'Getting there', tagline: 'A few tasks left to go', bg: 'bg-amber-50 dark:bg-amber-900/20', fill: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300' }
  return { label: 'Needs love', tagline: 'Even one task makes a difference', bg: 'bg-rose-50 dark:bg-rose-900/20', fill: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-300' }
}

export function HouseholdMoodCard() {
  const { household, members } = useHouseholdStore()
  const { tasks } = useTaskStore()
  const { routines } = useRoutineStore()

  const stats = useMemo(() => {
    if (!household) return { donePct: 0, todayDone: 0, todayTotal: 0 }
    const today = new Date()
    const todayTasks = tasks.filter((t) => {
      if (t.householdId !== household.id || !t.dueDate) return false
      const due = new Date(t.dueDate)
      return due.getDate() === today.getDate() && due.getMonth() === today.getMonth()
    })
    const done = todayTasks.filter((t) => t.status === 'done')
    const total = todayTasks.length || 1
    return { donePct: Math.round((done.length / total) * 100), todayDone: done.length, todayTotal: todayTasks.length }
  }, [tasks, routines, household])

  const tier = getTier(stats.donePct)
  const pips = Math.round((stats.donePct / 100) * 5)

  return (
    <div className={`rounded-3xl ${tier.bg} overflow-hidden`}>
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-foreground/40 mb-1">Home status</p>
            <p className={`text-xl font-black tracking-tight ${tier.text}`}>{tier.label}</p>
            <p className="text-sm text-foreground/50 mt-0.5">{tier.tagline}</p>
          </div>
          <div className="text-right">
            <motion.p
              key={stats.donePct}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl font-black text-foreground tabular-nums leading-none"
            >
              {stats.donePct}<span className="text-2xl text-foreground/40">%</span>
            </motion.p>
            <p className="text-xs text-foreground/40 mt-1">{stats.todayDone} of {stats.todayTotal} tasks</p>
          </div>
        </div>

        {/* Pip bar */}
        <div className="flex gap-1.5 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.05 + i * 0.05, duration: 0.25 }}
              className={`h-2 flex-1 rounded-full ${i < pips ? tier.fill : 'bg-black/10 dark:bg-white/10'}`}
            />
          ))}
        </div>
      </div>

      {/* Members */}
      {members.length > 0 && (
        <div className="flex items-center gap-4 px-5 py-3 border-t border-black/[0.06] dark:border-white/[0.06]">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: m.color + '28', color: m.color }}
              >
                {m.emoji}
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground/80">{m.name}</p>
                <p className="text-[10px] font-medium text-amber-500">🔥 {m.stats.currentStreak}d</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

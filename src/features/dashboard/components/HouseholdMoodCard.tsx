'use client'

import { motion } from 'framer-motion'
import { useHouseholdStore } from '@/shared/store/householdStore'
import { useTaskStore } from '@/shared/store/taskStore'
import { useRoutineStore } from '@/shared/store/routineStore'
import { useMemo } from 'react'

type MoodTier = {
  label: string
  tagline: string
  gradient: string
  bar: string
  textColor: string
  subtextColor: string
  xpLabel: string
}

function getMoodTier(pct: number): MoodTier {
  if (pct >= 90)
    return {
      label: 'Thriving ✨',
      tagline: 'The house is absolutely glowing.',
      gradient: 'from-emerald-400/20 via-teal-300/10 to-transparent',
      bar: 'bg-emerald-500',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      subtextColor: 'text-emerald-600/70 dark:text-emerald-400/70',
      xpLabel: 'Home energy',
    }
  if (pct >= 60)
    return {
      label: 'Cozy 😊',
      tagline: "Things are running smoothly.",
      gradient: 'from-sky-400/15 via-blue-200/10 to-transparent',
      bar: 'bg-sky-500',
      textColor: 'text-sky-700 dark:text-sky-300',
      subtextColor: 'text-sky-600/70 dark:text-sky-400/70',
      xpLabel: 'Home energy',
    }
  if (pct >= 30)
    return {
      label: 'Getting there 😌',
      tagline: 'A few more tasks and you\'re golden.',
      gradient: 'from-amber-400/15 via-yellow-200/10 to-transparent',
      bar: 'bg-amber-500',
      textColor: 'text-amber-700 dark:text-amber-300',
      subtextColor: 'text-amber-600/70 dark:text-amber-400/70',
      xpLabel: 'Home energy',
    }
  return {
    label: 'Needs some love 💤',
    tagline: 'Even one task makes a difference.',
    gradient: 'from-rose-400/15 via-pink-200/10 to-transparent',
    bar: 'bg-rose-500',
    textColor: 'text-rose-700 dark:text-rose-300',
    subtextColor: 'text-rose-600/70 dark:text-rose-400/70',
    xpLabel: 'Home energy',
  }
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
      return (
        due.getDate() === today.getDate() &&
        due.getMonth() === today.getMonth()
      )
    })
    const doneTasks = todayTasks.filter((t) => t.status === 'done')
    const total = todayTasks.length || 1
    return {
      donePct: Math.round((doneTasks.length / total) * 100),
      todayDone: doneTasks.length,
      todayTotal: todayTasks.length,
    }
  }, [tasks, routines, household])

  const tier = getMoodTier(stats.donePct)

  // XP-style filled segments (5 pips)
  const filledPips = Math.round((stats.donePct / 100) * 5)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl overflow-hidden border border-border shadow-sm bg-gradient-to-br ${tier.gradient} bg-card`}
    >
      <div className="px-5 pt-5 pb-4">
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">
              Home Status
            </p>
            <p className={`text-lg font-bold ${tier.textColor}`}>{tier.label}</p>
            <p className={`text-xs mt-0.5 ${tier.subtextColor}`}>{tier.tagline}</p>
          </div>

          {/* Big % counter */}
          <div className="text-right">
            <motion.p
              key={stats.donePct}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl font-black text-foreground tabular-nums leading-none"
            >
              {stats.donePct}
              <span className="text-xl font-bold text-muted-foreground">%</span>
            </motion.p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {stats.todayDone}/{stats.todayTotal} tasks
            </p>
          </div>
        </div>

        {/* XP pip bar */}
        <div className="mb-1">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.3, ease: 'easeOut' }}
                className={`h-2.5 flex-1 rounded-full origin-left ${
                  i < filledPips ? tier.bar : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 text-right">
            {tier.xpLabel}
          </p>
        </div>
      </div>

      {/* Member row */}
      {members.length > 0 && (
        <div className="flex items-center gap-4 px-5 py-3 border-t border-border/60 bg-card/40 backdrop-blur-sm">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-2 min-w-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-base font-bold shrink-0"
                style={{
                  backgroundColor: m.color + '25',
                  color: m.color,
                  outline: `2px solid ${m.color}60`,
                  outlineOffset: '2px',
                }}
              >
                {m.emoji}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{m.name}</p>
                <p className="text-[10px] text-amber-500 font-medium">
                  🔥 {m.stats.currentStreak}d
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

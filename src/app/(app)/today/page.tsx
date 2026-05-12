'use client'

import { motion, type Variants } from 'framer-motion'
import { format } from 'date-fns'
import { HouseholdMoodCard } from '@/features/dashboard/components/HouseholdMoodCard'
import { TodayTaskList } from '@/features/dashboard/components/TodayTaskList'
import { UpcomingRoutines } from '@/features/dashboard/components/UpcomingRoutines'
import { QuickActions } from '@/features/dashboard/components/QuickActions'
import { useHouseholdStore } from '@/shared/store/householdStore'
import { GroceryRunningLow } from '@/features/grocery/components/GroceryRunningLow'
import { MascotCharacter } from '@/features/mascot/MascotCharacter'
import { useActivityStore } from '@/shared/store/activityStore'
import type { MascotMood } from '@/mascot/types'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
}

function getGreeting(hour: number): string {
  if (hour < 6) return 'Still up?'
  if (hour < 12) return 'Good morning!'
  if (hour < 17) return 'Good afternoon!'
  if (hour < 21) return 'Good evening!'
  return 'Night owl!'
}

export default function TodayPage() {
  const { household, getCurrentMember } = useHouseholdStore()
  const { mascotMessages } = useActivityStore()
  const member = getCurrentMember()
  const today = new Date()
  const hour = today.getHours()

  const latestMsg = mascotMessages.find((m) => !m.isRead)
  const mascotMood: MascotMood = latestMsg
    ? (latestMsg.mood as MascotMood)
    : hour < 8 ? 'sleepy' : hour < 18 ? 'happy' : 'encouraging'

  const streak = member?.stats.currentStreak ?? 0

  return (
    <div className="max-w-xl mx-auto px-4">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="pt-7 pb-5 flex items-end justify-between"
      >
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.12em] mb-2">
            {format(today, 'EEEE, MMM d')}
          </p>
          <h1 className="text-[2rem] font-black text-foreground leading-none tracking-tight">
            {getGreeting(hour)}
          </h1>
          <p className="text-lg font-semibold text-foreground/70 mt-0.5">
            {member?.name ?? 'friend'}{member?.emoji ? ` ${member.emoji}` : ''}
          </p>
          {household && (
            <p className="text-sm text-muted-foreground mt-1">
              {household.emoji} {household.name}
            </p>
          )}
          {streak > 1 && (
            <div className="inline-flex items-center gap-1.5 mt-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-3 py-1.5 rounded-full text-sm font-semibold">
              🔥 {streak}-day streak
            </div>
          )}
        </div>

        <MascotCharacter
          mood={mascotMood}
          size={100}
          bobbing
          className="shrink-0 mb-1"
        />
      </motion.div>

      {/* ── Content ───────────────────────────────────────────── */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 pb-6">
        <motion.div variants={item}>
          <QuickActions />
        </motion.div>

        <motion.div variants={item}>
          <HouseholdMoodCard />
        </motion.div>

        <motion.div variants={item}>
          <TodayTaskList />
        </motion.div>

        <motion.div variants={item}>
          <UpcomingRoutines />
        </motion.div>

        <motion.div variants={item}>
          <GroceryRunningLow />
        </motion.div>
      </motion.div>
    </div>
  )
}

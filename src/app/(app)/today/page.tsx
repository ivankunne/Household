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
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
}

function getGreeting(hour: number, name: string): string {
  if (hour < 6) return `Still up, ${name}?`
  if (hour < 12) return `Morning, ${name}!`
  if (hour < 17) return `Hey ${name} 👋`
  if (hour < 21) return `Evening, ${name}!`
  return `Night owl, ${name}?`
}

export default function TodayPage() {
  const { household, getCurrentMember } = useHouseholdStore()
  const { mascotMessages } = useActivityStore()
  const member = getCurrentMember()
  const today = new Date()
  const hour = today.getHours()

  // Pick mascot mood from latest unread message, or time-of-day default
  const latestMsg = mascotMessages.find((m) => !m.isRead)
  const mascotMood: MascotMood = latestMsg
    ? (latestMsg.mood as MascotMood)
    : hour < 8
    ? 'sleepy'
    : hour < 18
    ? 'happy'
    : 'encouraging'

  const greeting = getGreeting(hour, member?.name ?? 'friend')

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">

      {/* ── Hero greeting ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-end gap-4 mb-7"
      >
        {/* Mascot */}
        <MascotCharacter
          mood={mascotMood}
          size={88}
          bobbing
          className="shrink-0"
        />

        {/* Text */}
        <div className="pb-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
            {format(today, 'EEEE, MMMM d')}
          </p>
          <h1 className="text-2xl font-bold text-foreground leading-tight">
            {greeting}
          </h1>
          {household && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {household.emoji} {household.name}
              {member && member.stats.currentStreak > 1 && (
                <span className="ml-2 inline-flex items-center gap-1 text-amber-500 font-semibold">
                  🔥 {member.stats.currentStreak}-day streak
                </span>
              )}
            </p>
          )}
        </div>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
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

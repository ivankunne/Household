'use client'

import { motion } from 'framer-motion'
import { useRoutineStore } from '@/shared/store/routineStore'
import { useHouseholdStore } from '@/shared/store/householdStore'
import { isToday, isTomorrow, format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function UpcomingRoutines() {
  const { routines, completeRoutine } = useRoutineStore()
  const { household, getCurrentMember, members } = useHouseholdStore()

  if (!household) return null

  const upcoming = routines
    .filter((r) => r.isActive && r.nextDueAt && r.householdId === household.id)
    .sort((a, b) => new Date(a.nextDueAt!).getTime() - new Date(b.nextDueAt!).getTime())
    .slice(0, 4)

  if (upcoming.length === 0) return null

  const handleComplete = async (routineId: string) => {
    const member = getCurrentMember()
    if (!member) return
    await completeRoutine(routineId, member.id, household.id)
    toast.success('Routine done! 🌟')
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground mb-2.5 px-1">
        Routines
      </p>
      <div className="space-y-2">
        {upcoming.map((routine, i) => {
          const assigneeId = routine.assignedMemberIds[routine.currentAssigneeIndex]
          const assignee = members.find((m) => m.id === assigneeId)
          const isDue = routine.nextDueAt ? new Date(routine.nextDueAt) <= new Date() : false
          const dueLabel = routine.nextDueAt
            ? isToday(parseISO(routine.nextDueAt)) ? 'Today'
            : isTomorrow(parseISO(routine.nextDueAt)) ? 'Tomorrow'
            : format(parseISO(routine.nextDueAt), 'MMM d')
            : 'Ongoing'

          return (
            <motion.div
              key={routine.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl bg-card',
                isDue
                  ? 'shadow-sm shadow-black/[0.05] ring-1 ring-primary/20'
                  : 'border border-border/60',
              )}
            >
              <span className="text-xl shrink-0">{routine.emoji ?? '🔄'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{routine.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn(
                    'text-[11px] font-semibold',
                    isDue ? 'text-primary' : 'text-muted-foreground',
                  )}>
                    {dueLabel}
                  </span>
                  {routine.streak > 0 && (
                    <span className="text-[11px] text-amber-500 font-medium">🔥 {routine.streak}</span>
                  )}
                  {assignee && (
                    <span className="text-[11px] text-muted-foreground">{assignee.emoji}</span>
                  )}
                </div>
              </div>
              {isDue && (
                <button
                  onClick={() => handleComplete(routine.id)}
                  className="text-xs font-bold text-primary-foreground bg-primary px-3 py-1.5 rounded-xl shadow-sm shadow-primary/20 active:scale-95 transition-transform shrink-0"
                >
                  Done
                </button>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

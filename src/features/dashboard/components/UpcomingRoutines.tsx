'use client'

import { motion } from 'framer-motion'
import { useRoutineStore } from '@/shared/store/routineStore'
import { useHouseholdStore } from '@/shared/store/householdStore'
import { isToday, isTomorrow, format, parseISO } from 'date-fns'
import { toast } from 'sonner'

export function UpcomingRoutines() {
  const { routines, completeRoutine } = useRoutineStore()
  const { household, getCurrentMember, members } = useHouseholdStore()

  if (!household) return null

  const upcoming = routines
    .filter((r) => r.isActive && r.nextDueAt && r.householdId === household.id)
    .sort((a, b) => {
      if (!a.nextDueAt || !b.nextDueAt) return 0
      return new Date(a.nextDueAt).getTime() - new Date(b.nextDueAt).getTime()
    })
    .slice(0, 4)

  if (upcoming.length === 0) return null

  const handleComplete = async (routineId: string) => {
    const member = getCurrentMember()
    if (!member) return
    await completeRoutine(routineId, member.id, household.id)
    toast.success('Routine done! 🌟')
  }

  return (
    <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-border">
        <p className="font-semibold text-foreground">Routines</p>
      </div>
      <div className="p-3 space-y-2">
        {upcoming.map((routine, i) => {
          const assigneeIdx = routine.currentAssigneeIndex
          const assigneeId = routine.assignedMemberIds[assigneeIdx]
          const assignee = members.find((m) => m.id === assigneeId)
          const isDue = routine.nextDueAt ? new Date(routine.nextDueAt) <= new Date() : false
          const dueLabel = routine.nextDueAt
            ? isToday(parseISO(routine.nextDueAt))
              ? 'Today'
              : isTomorrow(parseISO(routine.nextDueAt))
              ? 'Tomorrow'
              : format(parseISO(routine.nextDueAt), 'MMM d')
            : 'Ongoing'

          return (
            <motion.div
              key={routine.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/50 transition-colors"
            >
              <span className="text-2xl">{routine.emoji ?? '🔄'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{routine.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[11px] font-medium ${isDue ? 'text-primary' : 'text-muted-foreground'}`}>
                    {dueLabel}
                  </span>
                  <span className="text-[11px] text-amber-500">🔥 {routine.streak}</span>
                  {assignee && (
                    <span className="text-[11px] text-muted-foreground">{assignee.emoji}</span>
                  )}
                </div>
              </div>
              {isDue && (
                <button
                  onClick={() => handleComplete(routine.id)}
                  className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-xl active:scale-95 transition-transform"
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

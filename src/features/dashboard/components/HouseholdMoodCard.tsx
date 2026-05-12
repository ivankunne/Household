'use client'

import { useMemo } from 'react'
import { useHouseholdStore } from '@/shared/store/householdStore'
import { useTaskStore } from '@/shared/store/taskStore'
import { cn } from '@/lib/utils'

function getStatusPhrase(remaining: number, total: number): string {
  if (total === 0)     return 'Nothing on the list today'
  if (remaining === 0) return 'Everything taken care of'
  if (remaining === 1) return 'One small thing left today'
  if (remaining <= 3)  return 'A couple of things on the list'
  return 'A few things to work through today'
}

export function HouseholdMoodCard() {
  const { household, members } = useHouseholdStore()
  const { tasks } = useTaskStore()

  const { remaining, total } = useMemo(() => {
    if (!household) return { remaining: 0, total: 0 }
    const today = new Date()
    const todayTasks = tasks.filter((t) => {
      if (t.householdId !== household.id || !t.dueDate) return false
      const due = new Date(t.dueDate)
      return (
        due.getDate() === today.getDate() &&
        due.getMonth() === today.getMonth() &&
        due.getFullYear() === today.getFullYear()
      )
    })
    const done = todayTasks.filter((t) => t.status === 'done').length
    return { remaining: todayTasks.length - done, total: todayTasks.length }
  }, [tasks, household])

  if (!household) return null

  const phrase = getStatusPhrase(remaining, total)
  const dots = Math.min(total, 6)
  const doneDots = total > 0 ? Math.round(((total - remaining) / total) * dots) : 0

  return (
    <div className="bg-surface-2 border border-border-soft rounded-lg px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Home today</p>
          <p className="text-base font-medium text-foreground leading-snug">{phrase}</p>
          {remaining > 0 && total > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {total - remaining} of {total} done
            </p>
          )}
        </div>

        {/* Soft dot indicator — not a score, just a gentle visual */}
        {dots > 0 && (
          <div className="flex gap-1.5 items-center shrink-0 pt-1">
            {Array.from({ length: dots }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors duration-300',
                  i < doneDots ? 'bg-primary/50' : 'bg-border-strong',
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Members */}
      {members.length > 0 && (
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border-soft">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-1.5">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0"
                style={{ backgroundColor: m.color + '25' }}
              >
                {m.emoji}
              </div>
              <p className="text-xs text-muted-foreground">{m.name}</p>
              {m.stats.currentStreak > 1 && (
                <span className="text-[10px] text-hb-yellow-fg font-medium">
                  {m.stats.currentStreak}d
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

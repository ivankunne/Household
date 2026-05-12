'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useActivityStore } from '@/shared/store/activityStore'
import { useHouseholdStore } from '@/shared/store/householdStore'
import { useTaskStore } from '@/shared/store/taskStore'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { ActivityEvent } from '@/domains/activity/types'

const EVENT_CONFIGS: Partial<Record<ActivityEvent['type'], { emoji: string; dot: string }>> = {
  'task.completed':      { emoji: '✅', dot: 'bg-primary/15 text-hb-green-fg' },
  'task.created':        { emoji: '📋', dot: 'bg-ring/15 text-hb-blue-fg' },
  'routine.completed':   { emoji: '🔄', dot: 'bg-ring/15 text-hb-blue-fg' },
  'routine.missed':      { emoji: '😅', dot: 'bg-destructive/10 text-destructive' },
  'grocery.item_added':  { emoji: '🛒', dot: 'bg-hb-yellow/20 text-hb-yellow-fg' },
  'grocery.item_checked':{ emoji: '✅', dot: 'bg-hb-yellow/20 text-hb-yellow-fg' },
  'expense.added':       { emoji: '💰', dot: 'bg-primary/15 text-hb-green-fg' },
  'streak.milestone':    { emoji: '🔥', dot: 'bg-hb-yellow/20 text-hb-yellow-fg' },
  'member.joined':       { emoji: '👋', dot: 'bg-hb-red-fg/10 text-hb-red-fg' },
}

type Filter = 'all' | 'tasks' | 'routines' | 'grocery' | 'expenses'

const FILTER_TYPES: Record<Filter, ActivityEvent['type'][]> = {
  all:       [],
  tasks:     ['task.completed', 'task.created'],
  routines:  ['routine.completed', 'routine.missed'],
  grocery:   ['grocery.item_added', 'grocery.item_checked'],
  expenses:  ['expense.added'],
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'tasks',    label: 'Tasks' },
  { key: 'routines', label: 'Routines' },
  { key: 'grocery',  label: 'Grocery' },
  { key: 'expenses', label: 'Expenses' },
]

function groupByDate(events: ActivityEvent[]): Array<{ label: string; events: ActivityEvent[] }> {
  const groups: Record<string, ActivityEvent[]> = {}
  for (const event of events) {
    const date = parseISO(event.createdAt)
    const key = isToday(date) ? 'Today' : isYesterday(date) ? 'Yesterday' : format(date, 'EEEE, MMMM d')
    if (!groups[key]) groups[key] = []
    groups[key].push(event)
  }
  return Object.entries(groups).map(([label, events]) => ({ label, events }))
}

export default function TimelinePage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [memberFilter, setMemberFilter] = useState<string | null>(null)

  const { events }          = useActivityStore()
  const { household, members } = useHouseholdStore()
  const { updateTask }      = useTaskStore()

  if (!household) return null

  let filtered = events.filter((e) => e.householdId === household.id)
  if (FILTER_TYPES[filter].length > 0) {
    filtered = filtered.filter((e) => (FILTER_TYPES[filter] as string[]).includes(e.type))
  }
  if (memberFilter) {
    filtered = filtered.filter((e) => e.actorId === memberFilter)
  }

  const grouped = groupByDate(filtered)

  const handleUndo = async (event: ActivityEvent) => {
    if (event.type !== 'task.completed' || !event.targetId) return
    await updateTask(event.targetId, { status: 'todo', completedAt: undefined, completedBy: undefined } as any)
    toast.success('Task marked as not done')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-foreground">Timeline</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Everything that happened at home</p>
      </div>

      {/* Type filter */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
              filter === f.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-surface-2 text-muted-foreground hover:text-foreground border border-border-soft',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Member filter */}
      {members.length > 1 && (
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setMemberFilter(null)}
            className={cn(
              'px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors',
              !memberFilter ? 'bg-border text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Everyone
          </button>
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => setMemberFilter(m.id === memberFilter ? null : m.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors',
                memberFilter === m.id ? 'bg-border text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {m.emoji} {m.name}
            </button>
          ))}
        </div>
      )}

      {grouped.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">🏡</p>
          <p className="font-medium text-foreground">Nothing here yet</p>
          <p className="text-sm text-muted-foreground mt-1">Activity will appear as things happen at home</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ label, events: dayEvents }) => (
            <div key={label}>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                {label}
              </p>
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-px bg-border-soft" />

                <div className="space-y-2.5">
                  {dayEvents.map((event, i) => {
                    const config = EVENT_CONFIGS[event.type] ?? { emoji: '✨', dot: 'bg-muted text-muted-foreground' }
                    const actor  = members.find((m) => m.id === event.actorId)
                    const canUndo = event.type === 'task.completed'

                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.025, duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                        className="flex items-start gap-3 pl-2"
                      >
                        <div className={cn('relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[11px] shrink-0 mt-1', config.dot)}>
                          {event.emoji ?? config.emoji}
                        </div>

                        <div className="flex-1 bg-card border border-border rounded-lg px-4 py-3">
                          <p className="text-sm text-foreground leading-snug">
                            {event.message ?? event.type.replace('.', ' ')}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {actor && (
                              <span className="text-xs text-muted-foreground">{actor.emoji} {actor.name}</span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {format(parseISO(event.createdAt), 'h:mm a')}
                            </span>
                            {event.isHighlight && (
                              <span className="text-[10px] bg-hb-yellow/20 text-hb-yellow-fg px-2 py-0.5 rounded-full">
                                highlight
                              </span>
                            )}
                            {canUndo && (
                              <button
                                onClick={() => handleUndo(event)}
                                className="ml-auto text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                              >
                                undo
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

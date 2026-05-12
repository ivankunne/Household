'use client'

import { motion } from 'framer-motion'
import { useActivityStore } from '@/shared/store/activityStore'
import { useHouseholdStore } from '@/shared/store/householdStore'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import type { ActivityEvent } from '@/domains/activity/types'

const EVENT_CONFIGS: Partial<Record<ActivityEvent['type'], { emoji: string; color: string }>> = {
  'task.completed': { emoji: '✅', color: 'bg-emerald-50 text-emerald-700' },
  'task.created': { emoji: '📋', color: 'bg-blue-50 text-blue-700' },
  'routine.completed': { emoji: '🔄', color: 'bg-purple-50 text-purple-700' },
  'routine.missed': { emoji: '😅', color: 'bg-rose-50 text-rose-700' },
  'grocery.item_added': { emoji: '🛒', color: 'bg-amber-50 text-amber-700' },
  'grocery.item_checked': { emoji: '✅', color: 'bg-amber-50 text-amber-700' },
  'expense.added': { emoji: '💰', color: 'bg-green-50 text-green-700' },
  'streak.milestone': { emoji: '🔥', color: 'bg-orange-50 text-orange-700' },
  'member.joined': { emoji: '👋', color: 'bg-pink-50 text-pink-700' },
}

function groupByDate(events: ActivityEvent[]): Array<{ label: string; events: ActivityEvent[] }> {
  const groups: Record<string, ActivityEvent[]> = {}
  for (const event of events) {
    const date = parseISO(event.createdAt)
    const key = isToday(date)
      ? 'Today'
      : isYesterday(date)
      ? 'Yesterday'
      : format(date, 'EEEE, MMMM d')
    if (!groups[key]) groups[key] = []
    groups[key].push(event)
  }
  return Object.entries(groups).map(([label, events]) => ({ label, events }))
}

export default function TimelinePage() {
  const { events } = useActivityStore()
  const { household, members } = useHouseholdStore()

  if (!household) return null

  const householdEvents = events.filter((e) => e.householdId === household.id)
  const grouped = groupByDate(householdEvents)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Timeline</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Everything that happened in your home</p>
      </div>

      {grouped.length === 0 ? (
        <div className="text-center py-16">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="text-5xl mb-4"
          >
            🏡
          </motion.div>
          <p className="font-semibold text-foreground">Your story is just beginning</p>
          <p className="text-sm text-muted-foreground mt-1">Activity will appear here as things happen</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ label, events: dayEvents }) => (
            <div key={label}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {label}
              </p>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

                <div className="space-y-3">
                  {dayEvents.map((event, i) => {
                    const config = EVENT_CONFIGS[event.type] ?? { emoji: '✨', color: 'bg-muted text-muted-foreground' }
                    const actor = members.find((m) => m.id === event.actorId)

                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-start gap-3 pl-2"
                      >
                        {/* Dot */}
                        <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-1 ${config.color}`}>
                          {event.emoji ?? config.emoji}
                        </div>

                        <div className="flex-1 bg-card border border-border rounded-2xl px-4 py-3">
                          <p className="text-sm text-foreground">{event.message ?? event.type.replace('.', ' ')}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {actor && (
                              <span className="text-xs text-muted-foreground">{actor.emoji} {actor.name}</span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {format(parseISO(event.createdAt), 'h:mm a')}
                            </span>
                            {event.isHighlight && (
                              <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
                                ✨ highlight
                              </span>
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

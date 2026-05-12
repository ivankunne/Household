'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, Clock } from 'lucide-react'
import { useTaskStore } from '@/shared/store/taskStore'
import { useHouseholdStore } from '@/shared/store/householdStore'
import { categoryEmojis } from '@/design-system/tokens'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const priorityBar: Record<string, string> = {
  high:   'bg-destructive/60',
  medium: 'bg-hb-yellow',
  low:    'bg-transparent',
}

export function TodayTaskList() {
  const { tasks, completeTask, getTasksDueToday, getOverdueTasks } = useTaskStore()
  const { household, getCurrentMember, members } = useHouseholdStore()

  if (!household) return null

  const todayTasks  = getTasksDueToday(household.id)
  const overdueTasks = getOverdueTasks(household.id)
  const allTasks = [...overdueTasks.slice(0, 3), ...todayTasks].slice(0, 8)

  const handleComplete = async (taskId: string) => {
    const member = getCurrentMember()
    if (!member) return
    await completeTask(taskId, member.id, household.id)
    toast.success('Done!')
  }

  if (allTasks.length === 0) {
    return (
      <div className="bg-primary/8 rounded-lg p-6 flex items-center gap-4 border border-primary/15">
        <span className="text-3xl select-none">🌿</span>
        <div>
          <p className="font-medium text-hb-green-fg">All clear today</p>
          <p className="text-sm text-muted-foreground mt-0.5">Go enjoy your day.</p>
        </div>
      </div>
    )
  }

  const doneCount = allTasks.filter((t) => t.status === 'done').length

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <p className="font-medium text-foreground">Today</p>
        <p className="text-sm text-muted-foreground tabular-nums">
          {doneCount}<span className="text-muted-foreground/50">/{allTasks.length}</span>
        </p>
      </div>

      {/* Task rows */}
      <ul>
        <AnimatePresence initial={false}>
          {allTasks.map((task, i) => {
            const isDone   = task.status === 'done'
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isDone
            const assignee = members.find((m) => m.id === task.assignedTo)
            const emoji    = task.emoji ?? categoryEmojis[task.category] ?? '📋'

            return (
              <motion.li
                key={task.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
                className={cn(
                  'flex items-center gap-3 px-4 py-3.5 relative',
                  i < allTasks.length - 1 && 'border-b border-border/50',
                  isDone && 'bg-muted/30',
                )}
              >
                {/* Priority indicator */}
                <div className={cn('absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full', priorityBar[task.priority] ?? 'bg-transparent')} />

                {/* Check button */}
                <button
                  onClick={() => !isDone && handleComplete(task.id)}
                  disabled={isDone}
                  className="shrink-0 transition-transform active:scale-90 ml-1"
                >
                  {isDone
                    ? <CheckCircle2 className="w-[22px] h-[22px] text-primary animate-check-pop" />
                    : <Circle className="w-[22px] h-[22px] text-border hover:text-primary transition-colors" />
                  }
                </button>

                <span className="text-xl shrink-0">{emoji}</span>

                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-medium leading-tight',
                    isDone ? 'line-through text-muted-foreground' : 'text-foreground',
                  )}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {task.dueDate && (
                      <span className={cn(
                        'flex items-center gap-1 text-[11px]',
                        isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground',
                      )}>
                        <Clock className="w-3 h-3" />
                        {isOverdue ? 'Overdue' : format(new Date(task.dueDate), 'h:mm a')}
                      </span>
                    )}
                    {assignee && (
                      <span className="text-[11px] text-muted-foreground">{assignee.emoji} {assignee.name}</span>
                    )}
                  </div>
                </div>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>
    </div>
  )
}

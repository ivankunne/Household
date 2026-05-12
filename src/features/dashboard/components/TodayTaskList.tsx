'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, Clock } from 'lucide-react'
import { useTaskStore } from '@/shared/store/taskStore'
import { useHouseholdStore } from '@/shared/store/householdStore'
import { categoryEmojis } from '@/design-system/tokens'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function TodayTaskList() {
  const { tasks, completeTask, getTasksDueToday, getOverdueTasks } = useTaskStore()
  const { household, getCurrentMember, members } = useHouseholdStore()

  if (!household) return null

  const todayTasks = getTasksDueToday(household.id)
  const overdueTasks = getOverdueTasks(household.id)
  const allTasks = [...overdueTasks.slice(0, 3), ...todayTasks].slice(0, 8)

  const handleComplete = async (taskId: string) => {
    const member = getCurrentMember()
    if (!member) return
    await completeTask(taskId, member.id, household.id)
    toast.success('Task done! ✨', { duration: 2000 })
  }

  if (allTasks.length === 0) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl border border-emerald-100 dark:border-emerald-800/40 p-6 flex items-center gap-4">
        <motion.div
          animate={{ rotate: [0, -8, 8, -6, 6, 0] }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="text-4xl shrink-0 select-none"
        >
          🎉
        </motion.div>
        <div>
          <p className="font-bold text-emerald-800 dark:text-emerald-200">All clear for today!</p>
          <p className="text-sm text-emerald-700/70 dark:text-emerald-300/70 mt-0.5">
            Your home is happy. Go enjoy the day.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-border">
        <p className="font-semibold text-foreground">Today&apos;s tasks</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {allTasks.filter(t => t.status === 'done').length} / {allTasks.length} done
        </p>
      </div>

      <ul className="divide-y divide-border">
        <AnimatePresence initial={false}>
          {allTasks.map((task) => {
            const isDone = task.status === 'done'
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() &&
              task.status !== 'done'
            const assignee = members.find((m) => m.id === task.assignedTo)
            const emoji = task.emoji ?? categoryEmojis[task.category] ?? '📋'

            return (
              <motion.li
                key={task.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className={cn('flex items-center gap-3 px-5 py-3.5 transition-colors', isDone && 'bg-muted/40')}
              >
                <button
                  onClick={() => !isDone && handleComplete(task.id)}
                  className="shrink-0 transition-transform active:scale-90"
                  disabled={isDone}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                  )}
                </button>

                <span className="text-lg shrink-0">{emoji}</span>

                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium truncate', isDone && 'line-through text-muted-foreground')}>
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

                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  task.priority === 'high' ? 'bg-rose-50 text-rose-600' :
                  task.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                  'bg-muted text-muted-foreground',
                )}>
                  {task.priority}
                </span>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>
    </div>
  )
}

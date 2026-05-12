'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, CheckCircle2, Circle, Flame } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useTaskStore } from '@/shared/store/taskStore'
import { useRoutineStore } from '@/shared/store/routineStore'
import { useHouseholdStore } from '@/shared/store/householdStore'
import { categoryEmojis } from '@/design-system/tokens'
import { format, isToday, isTomorrow, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Task } from '@/domains/task/types'
import type { Routine } from '@/domains/routine/types'

const priorityBar: Record<string, string> = {
  high: 'bg-rose-400',
  medium: 'bg-amber-400',
  low: 'bg-border',
}

function TaskItem({ task, onComplete }: { task: Task; onComplete: (id: string) => void }) {
  const { members } = useHouseholdStore()
  const isDone = task.status === 'done'
  const assignee = members.find((m) => m.id === task.assignedTo)
  const emoji = task.emoji ?? categoryEmojis[task.category] ?? '📋'
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isDone

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-center gap-3 px-4 py-3.5 relative bg-card rounded-2xl overflow-hidden',
        isDone && 'opacity-50',
      )}
    >
      {/* Priority bar */}
      <div className={cn(
        'absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full',
        priorityBar[task.priority] ?? 'bg-transparent',
      )} />

      <button
        onClick={() => !isDone && onComplete(task.id)}
        disabled={isDone}
        className="shrink-0 ml-1 transition-transform active:scale-90"
      >
        {isDone
          ? <CheckCircle2 className="w-[22px] h-[22px] text-primary" />
          : <Circle className="w-[22px] h-[22px] text-border hover:text-primary transition-colors" />
        }
      </button>

      <span className="text-xl">{emoji}</span>

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', isDone && 'line-through text-muted-foreground')}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {task.dueDate && !isDone && (
            <span className={cn(
              'text-[11px]',
              isOverdue ? 'text-rose-500 font-medium' : 'text-muted-foreground',
            )}>
              {isOverdue ? 'Overdue' : isToday(parseISO(task.dueDate)) ? 'Today'
                : isTomorrow(parseISO(task.dueDate)) ? 'Tomorrow'
                : format(parseISO(task.dueDate), 'MMM d')}
            </span>
          )}
          {assignee && (
            <span className="text-[11px] text-muted-foreground">{assignee.emoji} {assignee.name}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function RoutineItem({ routine, onComplete }: { routine: Routine; onComplete: (id: string) => void }) {
  const { members } = useHouseholdStore()
  const isDue = routine.nextDueAt ? new Date(routine.nextDueAt) <= new Date() : false
  const assigneeId = routine.assignedMemberIds[routine.currentAssigneeIndex]
  const assignee = members.find((m) => m.id === assigneeId)

  const dueLabel = routine.nextDueAt
    ? isToday(parseISO(routine.nextDueAt)) ? 'Due today'
    : isTomorrow(parseISO(routine.nextDueAt)) ? 'Due tomorrow'
    : `Due ${format(parseISO(routine.nextDueAt), 'MMM d')}`
    : 'Ongoing'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-center gap-3 px-4 py-3.5 bg-card rounded-2xl',
        isDue && 'ring-1 ring-primary/25 shadow-sm shadow-primary/10',
      )}
    >
      <span className="text-xl">{routine.emoji ?? '🔄'}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground">{routine.title}</p>
          {routine.streak > 0 && (
            <span className="flex items-center gap-0.5 text-[11px] text-amber-500 font-semibold">
              <Flame className="w-3 h-3" />{routine.streak}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className={cn('text-[11px] font-medium', isDue ? 'text-primary' : 'text-muted-foreground')}>
            {dueLabel}
          </span>
          <span className="text-[11px] text-muted-foreground capitalize">{routine.recurrence.type}</span>
          {assignee && (
            <span className="text-[11px] text-muted-foreground">{assignee.emoji} {assignee.name}</span>
          )}
        </div>
      </div>
      {isDue && (
        <button
          onClick={() => onComplete(routine.id)}
          className="text-xs font-bold text-primary-foreground bg-primary px-3 py-1.5 rounded-xl shadow-sm shadow-primary/20 active:scale-95 transition-transform shrink-0"
        >
          Done
        </button>
      )}
    </motion.div>
  )
}

function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="text-center py-16">
      <p className="text-5xl mb-4">{icon}</p>
      <p className="font-bold text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    </div>
  )
}

export default function ChoresPage() {
  const [addOpen, setAddOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const { tasks, completeTask, addTask } = useTaskStore()
  const { routines, completeRoutine } = useRoutineStore()
  const { household, getCurrentMember } = useHouseholdStore()

  if (!household) return null

  const householdTasks = tasks.filter((t) => t.householdId === household.id)
  const todo = householdTasks.filter((t) => t.status === 'todo')
  const done = householdTasks.filter((t) => t.status === 'done').slice(0, 10)
  const hRoutines = routines.filter((r) => r.householdId === household.id && r.isActive)
  const dueRoutines = hRoutines.filter((r) => r.nextDueAt && new Date(r.nextDueAt) <= new Date())

  const handleCompleteTask = async (id: string) => {
    const member = getCurrentMember()
    if (!member) return
    await completeTask(id, member.id, household.id)
    toast.success('Task done!')
  }

  const handleCompleteRoutine = async (id: string) => {
    const member = getCurrentMember()
    if (!member) return
    await completeRoutine(id, member.id, household.id)
    toast.success('Routine complete!')
  }

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return
    const member = getCurrentMember()
    if (!member) return
    await addTask({ title: newTaskTitle.trim() }, household.id, member.id)
    setNewTaskTitle('')
    setAddOpen(false)
    toast.success('Task added!')
  }

  return (
    <div className="max-w-xl mx-auto px-4">
      {/* Header */}
      <div className="pt-7 pb-5 flex items-end justify-between">
        <div>
          <h1 className="text-[2rem] font-black tracking-tight text-foreground leading-none">Chores</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {todo.length} to do{dueRoutines.length > 0 ? ` · ${dueRoutines.length} routines due` : ''}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-primary/25"
        >
          <Plus className="w-4 h-4" />
          Add task
        </motion.button>
      </div>

      <Tabs defaultValue="tasks">
        <TabsList className="rounded-xl mb-4 w-full">
          <TabsTrigger value="tasks" className="flex-1 rounded-lg">Tasks ({todo.length})</TabsTrigger>
          <TabsTrigger value="routines" className="flex-1 rounded-lg">Routines ({hRoutines.length})</TabsTrigger>
          <TabsTrigger value="done" className="flex-1 rounded-lg">Done</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          {todo.length === 0
            ? <EmptyState icon="🎉" title="All tasks done!" subtitle="You're crushing it today" />
            : (
              <AnimatePresence>
                <div className="space-y-2">
                  {todo.map((task) => (
                    <TaskItem key={task.id} task={task} onComplete={handleCompleteTask} />
                  ))}
                </div>
              </AnimatePresence>
            )}
        </TabsContent>

        <TabsContent value="routines">
          {hRoutines.length === 0
            ? <EmptyState icon="🔄" title="No routines yet" subtitle="Add recurring tasks to build great habits" />
            : (
              <div className="space-y-2">
                {hRoutines.map((routine) => (
                  <RoutineItem key={routine.id} routine={routine} onComplete={handleCompleteRoutine} />
                ))}
              </div>
            )}
        </TabsContent>

        <TabsContent value="done">
          {done.length === 0
            ? <EmptyState icon="✅" title="Nothing done yet" subtitle="Complete tasks to see them here" />
            : (
              <div className="space-y-2">
                {done.map((task) => (
                  <TaskItem key={task.id} task={task} onComplete={() => {}} />
                ))}
              </div>
            )}
        </TabsContent>
      </Tabs>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">📋 New task</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <Input
              autoFocus
              placeholder="e.g. Clean the bathroom"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              className="rounded-xl h-11 text-base"
            />
            <button
              onClick={handleAddTask}
              disabled={!newTaskTitle.trim()}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add task
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

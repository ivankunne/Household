'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, CheckCircle2, Circle } from 'lucide-react'
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
import { v4 as uuid } from 'uuid'
import type { Task } from '@/domains/task/types'
import type { Routine } from '@/domains/routine/types'

const priorityBar: Record<string, string> = {
  high:   'bg-destructive/60',
  medium: 'bg-hb-yellow',
  low:    'bg-transparent',
}

const RECURRENCE_OPTIONS = [
  { value: 'daily',    label: 'Daily' },
  { value: 'weekly',   label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly',  label: 'Monthly' },
] as const

function TaskItem({ task, onComplete }: { task: Task; onComplete: (id: string) => void }) {
  const { members } = useHouseholdStore()
  const isDone    = task.status === 'done'
  const assignee  = members.find((m) => m.id === task.assignedTo)
  const emoji     = task.emoji ?? categoryEmojis[task.category] ?? '📋'
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isDone

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
      className={cn(
        'flex items-center gap-3 px-4 py-3.5 relative bg-card rounded-lg border border-border overflow-hidden',
        isDone && 'opacity-50',
      )}
    >
      <div className={cn('absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full', priorityBar[task.priority] ?? 'bg-transparent')} />

      <button onClick={() => !isDone && onComplete(task.id)} disabled={isDone} className="shrink-0 ml-1 transition-transform active:scale-90">
        {isDone
          ? <CheckCircle2 className="w-[22px] h-[22px] text-primary" />
          : <Circle className="w-[22px] h-[22px] text-border hover:text-primary transition-colors" />
        }
      </button>

      <span className="text-xl">{emoji}</span>

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', isDone && 'line-through text-muted-foreground')}>{task.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {task.dueDate && !isDone && (
            <span className={cn('text-[11px]', isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground')}>
              {isOverdue ? 'Overdue' : isToday(parseISO(task.dueDate)) ? 'Today'
                : isTomorrow(parseISO(task.dueDate)) ? 'Tomorrow'
                : format(parseISO(task.dueDate), 'MMM d')}
            </span>
          )}
          {assignee && <span className="text-[11px] text-muted-foreground">{assignee.emoji} {assignee.name}</span>}
        </div>
      </div>
    </motion.div>
  )
}

function RoutineItem({ routine, onComplete }: { routine: Routine; onComplete: (id: string) => void }) {
  const { members } = useHouseholdStore()
  const isDue      = routine.nextDueAt ? new Date(routine.nextDueAt) <= new Date() : false
  const assigneeId = routine.assignedMemberIds[routine.currentAssigneeIndex]
  const assignee   = members.find((m) => m.id === assigneeId)
  const dueLabel   = routine.nextDueAt
    ? isToday(parseISO(routine.nextDueAt))    ? 'Due today'
    : isTomorrow(parseISO(routine.nextDueAt)) ? 'Due tomorrow'
    : `Due ${format(parseISO(routine.nextDueAt), 'MMM d')}`
    : 'Ongoing'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
      className={cn(
        'flex items-center gap-3 px-4 py-3.5 bg-card rounded-lg border',
        isDue ? 'border-primary/20 shadow-sm' : 'border-border',
      )}
    >
      <span className="text-xl">{routine.emoji ?? '🔄'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{routine.title}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className={cn('text-[11px] font-medium', isDue ? 'text-primary' : 'text-muted-foreground')}>{dueLabel}</span>
          <span className="text-[11px] text-muted-foreground capitalize">{routine.recurrence.type}</span>
          {routine.streak > 0 && <span className="text-[11px] text-hb-yellow-fg font-medium">{routine.streak}d</span>}
          {assignee && <span className="text-[11px] text-muted-foreground">{assignee.emoji} {assignee.name}</span>}
        </div>
      </div>
      {isDue && (
        <button
          onClick={() => onComplete(routine.id)}
          className="text-xs font-medium text-primary-foreground bg-primary px-3 py-1.5 rounded-md shadow-sm active:scale-95 transition-transform shrink-0"
        >
          Done
        </button>
      )}
    </motion.div>
  )
}

function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="text-center py-14">
      <p className="text-4xl mb-3">{icon}</p>
      <p className="font-medium text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    </div>
  )
}

type AddMode = 'task' | 'routine' | null

export default function ChoresPage() {
  const [addMode, setAddMode]         = useState<AddMode>(null)
  const [taskTitle, setTaskTitle]     = useState('')
  const [routineTitle, setRoutineTitle] = useState('')
  const [recurrence, setRecurrence]   = useState<'daily' | 'weekly' | 'biweekly' | 'monthly'>('weekly')

  const { tasks, completeTask, addTask }        = useTaskStore()
  const { routines, completeRoutine, addRoutine } = useRoutineStore()
  const { household, getCurrentMember }          = useHouseholdStore()

  if (!household) return null

  const householdTasks = tasks.filter((t) => t.householdId === household.id)
  const todo           = householdTasks.filter((t) => t.status === 'todo')
  const done           = householdTasks.filter((t) => t.status === 'done').slice(0, 10)
  const hRoutines      = routines.filter((r) => r.householdId === household.id && r.isActive)
  const dueRoutines    = hRoutines.filter((r) => r.nextDueAt && new Date(r.nextDueAt) <= new Date())

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
    toast.success('Routine done!')
  }

  const handleAddTask = async () => {
    if (!taskTitle.trim()) return
    const member = getCurrentMember()
    if (!member) return
    await addTask({ title: taskTitle.trim() }, household.id, member.id)
    setTaskTitle('')
    setAddMode(null)
    toast.success('Task added')
  }

  const handleAddRoutine = async () => {
    if (!routineTitle.trim()) return
    const member = getCurrentMember()
    if (!member) return
    const now = new Date().toISOString()
    await addRoutine({
      householdId:          household.id,
      title:                routineTitle.trim(),
      category:             'other',
      recurrence:           { type: recurrence, interval: 1 },
      rotationStrategy:     'round_robin',
      assignedMemberIds:    [member.id],
      currentAssigneeIndex: 0,
      streak:               0,
      isActive:             true,
      tags:                 [],
      nextDueAt:            now,
    })
    setRoutineTitle('')
    setAddMode(null)
    toast.success('Routine added')
  }

  return (
    <div className="max-w-xl mx-auto px-4">
      {/* Header */}
      <div className="pt-7 pb-5 flex items-end justify-between">
        <div>
          <h1 className="text-[1.75rem] font-semibold tracking-tight text-foreground leading-none">Chores</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {todo.length} to do{dueRoutines.length > 0 ? ` · ${dueRoutines.length} routines due` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => setAddMode('routine')}
            className="flex items-center gap-1.5 bg-card border border-border text-foreground px-3 py-2.5 rounded-md text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Routine
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => setAddMode('task')}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2.5 rounded-md text-sm font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Task
          </motion.button>
        </div>
      </div>

      <Tabs defaultValue="tasks">
        <TabsList className="rounded-lg mb-4 w-full">
          <TabsTrigger value="tasks"    className="flex-1 rounded-md">Tasks ({todo.length})</TabsTrigger>
          <TabsTrigger value="routines" className="flex-1 rounded-md">Routines ({hRoutines.length})</TabsTrigger>
          <TabsTrigger value="done"     className="flex-1 rounded-md">Done</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          {todo.length === 0
            ? <EmptyState icon="🌿" title="All tasks done" subtitle="Nothing left on the list" />
            : (
              <AnimatePresence>
                <div className="space-y-2">
                  {todo.map((task) => <TaskItem key={task.id} task={task} onComplete={handleCompleteTask} />)}
                </div>
              </AnimatePresence>
            )}
        </TabsContent>

        <TabsContent value="routines">
          {hRoutines.length === 0
            ? <EmptyState icon="🔄" title="No routines yet" subtitle="Add routines to keep things running" />
            : (
              <div className="space-y-2">
                {hRoutines.map((r) => <RoutineItem key={r.id} routine={r} onComplete={handleCompleteRoutine} />)}
              </div>
            )}
        </TabsContent>

        <TabsContent value="done">
          {done.length === 0
            ? <EmptyState icon="✅" title="Nothing done yet" subtitle="Completed tasks will show up here" />
            : (
              <div className="space-y-2">
                {done.map((task) => <TaskItem key={task.id} task={task} onComplete={() => {}} />)}
              </div>
            )}
        </TabsContent>
      </Tabs>

      {/* Add Task dialog */}
      <Dialog open={addMode === 'task'} onOpenChange={(v) => !v && setAddMode(null)}>
        <DialogContent className="rounded-xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">New task</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <Input
              autoFocus
              placeholder="e.g. Clean the bathroom"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              className="rounded-md h-11 text-base"
            />
            <button
              onClick={handleAddTask}
              disabled={!taskTitle.trim()}
              className="w-full py-2.5 rounded-md bg-primary text-primary-foreground font-medium text-sm disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add task
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Routine dialog */}
      <Dialog open={addMode === 'routine'} onOpenChange={(v) => !v && setAddMode(null)}>
        <DialogContent className="rounded-xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">New routine</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <Input
              autoFocus
              placeholder="e.g. Vacuum living room"
              value={routineTitle}
              onChange={(e) => setRoutineTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddRoutine()}
              className="rounded-md h-11 text-base"
            />
            <div>
              <p className="text-xs text-muted-foreground mb-2">How often?</p>
              <div className="grid grid-cols-2 gap-2">
                {RECURRENCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setRecurrence(opt.value)}
                    className={cn(
                      'py-2 rounded-md text-sm font-medium transition-colors',
                      recurrence === opt.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-surface-2 text-muted-foreground hover:text-foreground border border-border-soft',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleAddRoutine}
              disabled={!routineTitle.trim()}
              className="w-full py-2.5 rounded-md bg-primary text-primary-foreground font-medium text-sm disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add routine
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

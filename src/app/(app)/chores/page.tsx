'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, CheckCircle2, Circle, RotateCcw, Flame } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useTaskStore } from '@/shared/store/taskStore'
import { useRoutineStore } from '@/shared/store/routineStore'
import { useHouseholdStore } from '@/shared/store/householdStore'
import { categoryEmojis } from '@/design-system/tokens'
import { format, isToday, isTomorrow, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Task } from '@/domains/task/types'
import type { Routine } from '@/domains/routine/types'

const container = {
  show: { transition: { staggerChildren: 0.04 } },
}
const itemAnim = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
}

function TaskItem({ task, onComplete }: { task: Task; onComplete: (id: string) => void }) {
  const { members } = useHouseholdStore()
  const isDone = task.status === 'done'
  const assignee = members.find((m) => m.id === task.assignedTo)
  const emoji = task.emoji ?? categoryEmojis[task.category] ?? '📋'

  return (
    <motion.div
      variants={itemAnim}
      layout
      className={cn(
        'flex items-center gap-3 p-4 rounded-2xl border border-border bg-card transition-colors',
        isDone && 'opacity-60',
      )}
    >
      <button
        onClick={() => !isDone && onComplete(task.id)}
        disabled={isDone}
        className="shrink-0 transition-transform active:scale-90"
      >
        {isDone ? (
          <CheckCircle2 className="w-5 h-5 text-primary" />
        ) : (
          <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
        )}
      </button>
      <span className="text-xl">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', isDone && 'line-through text-muted-foreground')}>
          {task.title}
        </p>
        {assignee && (
          <p className="text-xs text-muted-foreground mt-0.5">{assignee.emoji} {assignee.name}</p>
        )}
      </div>
      {task.dueDate && !isDone && (
        <span className={cn(
          'text-xs px-2 py-1 rounded-full',
          new Date(task.dueDate) < new Date()
            ? 'bg-rose-50 text-rose-600'
            : 'bg-muted text-muted-foreground',
        )}>
          {isToday(parseISO(task.dueDate))
            ? 'Today'
            : isTomorrow(parseISO(task.dueDate))
            ? 'Tomorrow'
            : format(parseISO(task.dueDate), 'MMM d')}
        </span>
      )}
    </motion.div>
  )
}

function RoutineItem({ routine, onComplete }: { routine: Routine; onComplete: (id: string) => void }) {
  const { members } = useHouseholdStore()
  const isDue = routine.nextDueAt ? new Date(routine.nextDueAt) <= new Date() : false
  const assigneeId = routine.assignedMemberIds[routine.currentAssigneeIndex]
  const assignee = members.find((m) => m.id === assigneeId)

  const dueLabel = routine.nextDueAt
    ? isToday(parseISO(routine.nextDueAt))
      ? 'Due today'
      : isTomorrow(parseISO(routine.nextDueAt))
      ? 'Due tomorrow'
      : `Due ${format(parseISO(routine.nextDueAt), 'MMM d')}`
    : 'Ongoing'

  return (
    <motion.div
      variants={itemAnim}
      layout
      className="p-4 rounded-2xl border border-border bg-card"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">{routine.emoji ?? '🔄'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-foreground">{routine.title}</p>
            {routine.streak > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-amber-500 font-medium">
                <Flame className="w-3 h-3" />
                {routine.streak}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={cn(
              'text-xs font-medium',
              isDue ? 'text-primary' : 'text-muted-foreground',
            )}>
              {dueLabel}
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground capitalize">{routine.recurrence.type}</span>
            {assignee && (
              <>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{assignee.emoji} {assignee.name}&apos;s turn</span>
              </>
            )}
          </div>
        </div>
        {isDue && (
          <button
            onClick={() => onComplete(routine.id)}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-xl active:scale-95 transition-transform shrink-0"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Done
          </button>
        )}
      </div>
    </motion.div>
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

  const handleCompleteTask = async (id: string) => {
    const member = getCurrentMember()
    if (!member) return
    await completeTask(id, member.id, household.id)
    toast.success('Task done! ✨')
  }

  const handleCompleteRoutine = async (id: string) => {
    const member = getCurrentMember()
    if (!member) return
    await completeRoutine(id, member.id, household.id)
    toast.success('Routine complete! 🌟')
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
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chores & Routines</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {todo.length} to do · {hRoutines.filter(r => r.nextDueAt && new Date(r.nextDueAt) <= new Date()).length} routines due
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl text-sm font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add
        </motion.button>
      </div>

      <Tabs defaultValue="tasks">
        <TabsList className="rounded-2xl mb-4">
          <TabsTrigger value="tasks" className="rounded-xl">Tasks ({todo.length})</TabsTrigger>
          <TabsTrigger value="routines" className="rounded-xl">Routines ({hRoutines.length})</TabsTrigger>
          <TabsTrigger value="done" className="rounded-xl">Done</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          {todo.length === 0 ? (
            <EmptyState icon="🎉" title="All tasks done!" subtitle="You're crushing it today" />
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
              {todo.map((task) => (
                <TaskItem key={task.id} task={task} onComplete={handleCompleteTask} />
              ))}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="routines">
          {hRoutines.length === 0 ? (
            <EmptyState icon="🔄" title="No routines yet" subtitle="Add recurring tasks to build great habits" />
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
              {hRoutines.map((routine) => (
                <RoutineItem key={routine.id} routine={routine} onComplete={handleCompleteRoutine} />
              ))}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="done">
          {done.length === 0 ? (
            <EmptyState icon="✅" title="Nothing done yet" subtitle="Complete some tasks to see them here" />
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
              {done.map((task) => (
                <TaskItem key={task.id} task={task} onComplete={() => {}} />
              ))}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle>📋 Add a task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              autoFocus
              placeholder="e.g. Clean the bathroom"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              className="rounded-2xl"
            />
            <Button onClick={handleAddTask} disabled={!newTaskTitle.trim()} className="w-full rounded-2xl">
              <Plus className="w-4 h-4 mr-2" /> Add task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="text-center py-16">
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="text-5xl mb-4"
      >
        {icon}
      </motion.div>
      <p className="font-semibold text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    </div>
  )
}

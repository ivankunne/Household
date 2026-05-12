import { create } from 'zustand'
import { LocalTaskRepository } from '@/persistence/local/LocalTaskRepository'
import { emitActivity } from '@/events/ActivityEngine'
import type { Task, CreateTaskInput } from '@/domains/task/types'

const repo = new LocalTaskRepository()

interface TaskState {
  tasks: Task[]
  isLoading: boolean

  loadTasks: (householdId: string) => Promise<void>
  addTask: (input: CreateTaskInput, householdId: string, memberId: string) => Promise<Task>
  completeTask: (id: string, memberId: string, householdId: string) => Promise<void>
  skipTask: (id: string) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  updateTask: (id: string, patch: Partial<Task>) => Promise<void>
  getTasksDueToday: (householdId: string) => Task[]
  getOverdueTasks: (householdId: string) => Task[]
}

export const useTaskStore = create<TaskState>()((set, get) => ({
  tasks: [],
  isLoading: false,

  loadTasks: async (householdId) => {
    set({ isLoading: true })
    const tasks = await repo.findAll(householdId)
    set({ tasks, isLoading: false })
  },

  addTask: async (input, householdId, memberId) => {
    const task = await repo.create({ ...input, householdId, createdBy: memberId })
    set((s) => ({ tasks: [task, ...s.tasks] }))
    await emitActivity({
      householdId,
      type: 'task.created',
      actorId: memberId,
      targetId: task.id,
      targetType: 'task',
      message: `Added task: ${task.title}`,
      emoji: task.emoji ?? '📋',
    })
    return task
  },

  completeTask: async (id, memberId, householdId) => {
    const task = await repo.completeTask(id, memberId)
    if (!task) return
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? task : t)) }))
    await emitActivity({
      householdId,
      type: 'task.completed',
      actorId: memberId,
      targetId: id,
      targetType: 'task',
      message: `Completed: ${task.title}`,
      emoji: '✅',
      isHighlight: true,
    })
  },

  skipTask: async (id) => {
    const task = await repo.update(id, { status: 'skipped' })
    if (!task) return
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? task : t)) }))
  },

  deleteTask: async (id) => {
    await repo.delete(id)
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
  },

  updateTask: async (id, patch) => {
    const task = await repo.update(id, patch)
    if (!task) return
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? task : t)) }))
  },

  getTasksDueToday: (householdId) => {
    const now = new Date()
    return get().tasks.filter((t) => {
      if (t.householdId !== householdId || t.status === 'done') return false
      if (!t.dueDate) return false
      const due = new Date(t.dueDate)
      return (
        due.getDate() === now.getDate() &&
        due.getMonth() === now.getMonth() &&
        due.getFullYear() === now.getFullYear()
      )
    })
  },

  getOverdueTasks: (householdId) => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return get().tasks.filter((t) => {
      if (t.householdId !== householdId || t.status !== 'todo') return false
      if (!t.dueDate) return false
      return new Date(t.dueDate) < now
    })
  },
}))

import { isToday, isPast, parseISO } from 'date-fns'
import { BaseLocalRepository } from './BaseLocalRepository'
import type { ITaskRepository } from '../interfaces/ITaskRepository'
import type { Task, CreateTaskInput } from '@/domains/task/types'

export class LocalTaskRepository extends BaseLocalRepository<Task> implements ITaskRepository {
  constructor() {
    super('tasks')
  }

  async create(input: CreateTaskInput): Promise<Task> {
    const now = this.now()
    const task: Task = {
      id: this.newId(),
      status: 'todo',
      tags: input.tags ?? [],
      category: input.category ?? 'other',
      priority: input.priority ?? 'medium',
      householdId: input.householdId ?? '',
      createdBy: input.createdBy ?? '',
      createdAt: now,
      updatedAt: now,
      ...input,
    }
    return this.store.set(task)
  }

  async findByStatus(householdId: string, status: Task['status']): Promise<Task[]> {
    return this.findWhere((t) => t.householdId === householdId && t.status === status)
  }

  async findByAssignee(memberId: string): Promise<Task[]> {
    return this.findWhere((t) => t.assignedTo === memberId)
  }

  async findDueToday(householdId: string): Promise<Task[]> {
    return this.findWhere(
      (t) =>
        t.householdId === householdId &&
        t.status !== 'done' &&
        t.dueDate != null &&
        isToday(parseISO(t.dueDate)),
    )
  }

  async findOverdue(householdId: string): Promise<Task[]> {
    return this.findWhere(
      (t) =>
        t.householdId === householdId &&
        t.status === 'todo' &&
        t.dueDate != null &&
        isPast(parseISO(t.dueDate)) &&
        !isToday(parseISO(t.dueDate)),
    )
  }

  async completeTask(id: string, memberId: string): Promise<Task | null> {
    return this.update(id, {
      status: 'done',
      completedAt: this.now(),
      completedBy: memberId,
    })
  }
}

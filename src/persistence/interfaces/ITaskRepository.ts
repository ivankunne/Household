import type { Task, CreateTaskInput } from '@/domains/task/types'
import type { IRepository } from './IRepository'

export interface ITaskRepository extends IRepository<Task, CreateTaskInput> {
  findByStatus(householdId: string, status: Task['status']): Promise<Task[]>
  findByAssignee(memberId: string): Promise<Task[]>
  findDueToday(householdId: string): Promise<Task[]>
  findOverdue(householdId: string): Promise<Task[]>
  completeTask(id: string, memberId: string): Promise<Task | null>
}

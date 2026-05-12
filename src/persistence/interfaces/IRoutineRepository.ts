import type { Routine } from '@/domains/routine/types'
import type { IRepository } from './IRepository'

export interface IRoutineRepository extends IRepository<Routine> {
  findDue(householdId: string): Promise<Routine[]>
  findByAssignee(memberId: string): Promise<Routine[]>
  completeRoutine(id: string, memberId: string): Promise<Routine | null>
  advanceRotation(id: string): Promise<Routine | null>
}

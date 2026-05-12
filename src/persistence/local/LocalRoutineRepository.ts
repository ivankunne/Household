import { isPast, parseISO, addDays, addWeeks, addMonths } from 'date-fns'
import { BaseLocalRepository } from './BaseLocalRepository'
import type { IRoutineRepository } from '../interfaces/IRoutineRepository'
import type { Routine } from '@/domains/routine/types'

function calcNextDue(routine: Routine): string {
  const base = routine.lastCompletedAt ? parseISO(routine.lastCompletedAt) : new Date()
  const { type, interval } = routine.recurrence
  switch (type) {
    case 'daily': return addDays(base, interval).toISOString()
    case 'weekly': return addWeeks(base, interval).toISOString()
    case 'biweekly': return addWeeks(base, 2).toISOString()
    case 'monthly': return addMonths(base, interval).toISOString()
    default: return addDays(base, interval).toISOString()
  }
}

export class LocalRoutineRepository extends BaseLocalRepository<Routine> implements IRoutineRepository {
  constructor() {
    super('routines')
  }

  async findDue(householdId: string): Promise<Routine[]> {
    return this.findWhere(
      (r) =>
        r.householdId === householdId &&
        r.isActive &&
        r.nextDueAt != null &&
        isPast(parseISO(r.nextDueAt)),
    )
  }

  async findByAssignee(memberId: string): Promise<Routine[]> {
    return this.findWhere((r) => r.assignedMemberIds.includes(memberId))
  }

  async completeRoutine(id: string, memberId: string): Promise<Routine | null> {
    const routine = await this.findById(id)
    if (!routine) return null
    const now = this.now()
    return this.update(id, {
      lastCompletedAt: now,
      lastCompletedBy: memberId,
      nextDueAt: calcNextDue({ ...routine, lastCompletedAt: now }),
      streak: (routine.streak ?? 0) + 1,
    })
  }

  async advanceRotation(id: string): Promise<Routine | null> {
    const routine = await this.findById(id)
    if (!routine || routine.assignedMemberIds.length === 0) return null
    const nextIndex = (routine.currentAssigneeIndex + 1) % routine.assignedMemberIds.length
    return this.update(id, { currentAssigneeIndex: nextIndex })
  }
}

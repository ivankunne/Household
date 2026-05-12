import type { ActivityEvent, MascotMessage } from '@/domains/activity/types'
import type { IRepository } from './IRepository'

export interface IActivityRepository extends IRepository<ActivityEvent> {
  findRecent(householdId: string, limit?: number): Promise<ActivityEvent[]>
  findByType(householdId: string, type: ActivityEvent['type']): Promise<ActivityEvent[]>
  findHighlights(householdId: string): Promise<ActivityEvent[]>
}

export interface IMascotRepository extends IRepository<MascotMessage> {
  findUnread(householdId: string): Promise<MascotMessage[]>
  markAllRead(householdId: string): Promise<void>
  findLatest(householdId: string): Promise<MascotMessage | null>
}

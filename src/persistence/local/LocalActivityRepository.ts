import { BaseLocalRepository } from './BaseLocalRepository'
import type { IActivityRepository, IMascotRepository } from '../interfaces/IActivityRepository'
import type { ActivityEvent, MascotMessage } from '@/domains/activity/types'

export class LocalActivityRepository extends BaseLocalRepository<ActivityEvent> implements IActivityRepository {
  constructor() {
    super('activity_events')
  }

  async findRecent(householdId: string, limit = 50): Promise<ActivityEvent[]> {
    const all = await this.findAll(householdId)
    return [...all]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  }

  async findByType(householdId: string, type: ActivityEvent['type']): Promise<ActivityEvent[]> {
    return this.findWhere((e) => e.householdId === householdId && e.type === type)
  }

  async findHighlights(householdId: string): Promise<ActivityEvent[]> {
    return this.findWhere((e) => e.householdId === householdId && e.isHighlight)
  }
}

export class LocalMascotRepository extends BaseLocalRepository<MascotMessage> implements IMascotRepository {
  constructor() {
    super('mascot_messages')
  }

  async findUnread(householdId: string): Promise<MascotMessage[]> {
    return this.findWhere((m) => m.householdId === householdId && !m.isRead)
  }

  async markAllRead(householdId: string): Promise<void> {
    const unread = await this.findUnread(householdId)
    await Promise.all(unread.map((m) => this.update(m.id, { isRead: true })))
  }

  async findLatest(householdId: string): Promise<MascotMessage | null> {
    const all = await this.findAll(householdId)
    if (all.length === 0) return null
    return [...all].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
  }
}

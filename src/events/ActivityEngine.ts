import { v4 as uuid } from 'uuid'
import { eventBus } from './EventBus'
import { LocalActivityRepository } from '@/persistence/local/LocalActivityRepository'
import type { ActivityEvent, ActivityEventType } from '@/domains/activity/types'

const activityRepo = new LocalActivityRepository()

export interface EmitActivityOptions {
  householdId: string
  type: ActivityEventType
  actorId?: string
  targetId?: string
  targetType?: string
  payload?: Record<string, unknown>
  message?: string
  emoji?: string
  isHighlight?: boolean
}

export async function emitActivity(opts: EmitActivityOptions): Promise<ActivityEvent> {
  const event: ActivityEvent = {
    id: uuid(),
    householdId: opts.householdId,
    type: opts.type,
    actorId: opts.actorId,
    targetId: opts.targetId,
    targetType: opts.targetType,
    payload: opts.payload ?? {},
    message: opts.message,
    emoji: opts.emoji,
    isHighlight: opts.isHighlight ?? false,
    createdAt: new Date().toISOString(),
  }

  // Persist the event
  await activityRepo.store.set(event)

  // Broadcast to all listeners
  await eventBus.emit(event)

  return event
}

export function onActivity(
  type: ActivityEventType | '*',
  handler: (event: ActivityEvent) => void | Promise<void>,
): () => void {
  return eventBus.on(type, handler)
}

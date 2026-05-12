'use client'

import { v4 as uuid } from 'uuid'
import { pickMessage } from '../messages/templates'
import { LocalMascotRepository } from '@/persistence/local/LocalActivityRepository'
import { onActivity } from '@/events/ActivityEngine'
import type { MascotTrigger } from '../types'
import type { ActivityEvent } from '@/domains/activity/types'
import type { MascotMessage } from '@/domains/activity/types'

const mascotRepo = new LocalMascotRepository()

// Maps activity types to mascot triggers
const triggerMap: Partial<Record<ActivityEvent['type'], MascotTrigger>> = {
  'task.completed': 'task_completed',
  'routine.completed': 'routine_completed',
  'routine.missed': 'routine_missed',
  'grocery.session_completed': 'grocery_session_done',
  'streak.milestone': 'streak_milestone',
}

export async function createMascotMessage(
  householdId: string,
  trigger: MascotTrigger,
): Promise<MascotMessage> {
  const { text, mood, emoji } = pickMessage(trigger)
  const msg: MascotMessage = {
    id: uuid(),
    householdId,
    text,
    emoji,
    mood: mood as MascotMessage['mood'],
    triggerType: trigger,
    isRead: false,
    createdAt: new Date().toISOString(),
  }
  return mascotRepo.store.set(msg)
}

export function initMascotEngine(householdId: string): () => void {
  const unsub = onActivity('*', async (event) => {
    const trigger = triggerMap[event.type]
    if (trigger && event.householdId === householdId) {
      await createMascotMessage(householdId, trigger)
    }
  })
  return unsub
}

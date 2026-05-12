import { z } from 'zod'

export const ActivityEventTypeSchema = z.enum([
  'task.created', 'task.completed', 'task.skipped', 'task.assigned',
  'routine.completed', 'routine.missed', 'routine.created',
  'grocery.item_added', 'grocery.item_checked', 'grocery.session_started', 'grocery.session_completed',
  'expense.added', 'expense.settled', 'subscription.added', 'subscription.renewed',
  'object.added', 'object.maintenance_completed',
  'document.uploaded',
  'member.joined', 'member.left',
  'household.updated',
  'streak.milestone',
])

export type ActivityEventType = z.infer<typeof ActivityEventTypeSchema>

export const ActivityEventSchema = z.object({
  id: z.string(),
  householdId: z.string(),
  type: ActivityEventTypeSchema,
  actorId: z.string().optional(),
  targetId: z.string().optional(),
  targetType: z.string().optional(),
  payload: z.record(z.string(), z.unknown()).default({}),
  message: z.string().optional(),
  emoji: z.string().optional(),
  isHighlight: z.boolean().default(false),
  createdAt: z.string().datetime(),
})

export type ActivityEvent = z.infer<typeof ActivityEventSchema>

export const MascotMessageSchema = z.object({
  id: z.string(),
  householdId: z.string(),
  text: z.string(),
  emoji: z.string().optional(),
  mood: z.enum(['happy', 'excited', 'sleepy', 'curious', 'encouraging', 'celebrating', 'concerned', 'neutral']),
  triggerType: z.string().optional(),
  relatedActivityId: z.string().uuid().optional(),
  isRead: z.boolean().default(false),
  expiresAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
})

export type MascotMessage = z.infer<typeof MascotMessageSchema>

import { z } from 'zod'

export const NotificationTypeSchema = z.enum([
  'task_due', 'task_completed', 'routine_due', 'routine_missed',
  'grocery_low', 'expense_added', 'subscription_due', 'maintenance_due',
  'mascot_message', 'member_joined', 'streak_milestone', 'weekly_summary',
])

export type NotificationType = z.infer<typeof NotificationTypeSchema>

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  householdId: z.string().uuid(),
  type: NotificationTypeSchema,
  title: z.string(),
  body: z.string(),
  emoji: z.string().optional(),
  recipientId: z.string().uuid().optional(),
  relatedEntityId: z.string().uuid().optional(),
  relatedEntityType: z.string().optional(),
  isRead: z.boolean().default(false),
  readAt: z.string().datetime().optional(),
  scheduledFor: z.string().datetime().optional(),
  sentAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
})

export type Notification = z.infer<typeof NotificationSchema>

import { z } from 'zod'

export const CalendarEventSchema = z.object({
  id: z.string().uuid(),
  householdId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  emoji: z.string().optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime().optional(),
  isAllDay: z.boolean().default(false),
  location: z.string().optional(),
  attendeeIds: z.array(z.string().uuid()).default([]),
  relatedTaskId: z.string().uuid().optional(),
  relatedObjectId: z.string().uuid().optional(),
  category: z.enum(['appointment', 'social', 'maintenance', 'delivery', 'travel', 'other']).default('other'),
  isRecurring: z.boolean().default(false),
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type CalendarEvent = z.infer<typeof CalendarEventSchema>

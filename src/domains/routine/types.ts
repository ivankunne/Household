import { z } from 'zod'

export const RecurrenceSchema = z.object({
  type: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'custom']),
  interval: z.number().default(1),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  dayOfMonth: z.number().min(1).max(31).optional(),
})

export type Recurrence = z.infer<typeof RecurrenceSchema>

export const RotationStrategySchema = z.enum(['fixed', 'round_robin', 'random', 'volunteer'])
export type RotationStrategy = z.infer<typeof RotationStrategySchema>

export const RoutineSchema = z.object({
  id: z.string().uuid(),
  householdId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  emoji: z.string().optional(),
  category: z.enum([
    'cleaning', 'cooking', 'laundry', 'shopping', 'maintenance',
    'admin', 'pets', 'garden', 'childcare', 'other',
  ]).default('other'),
  recurrence: RecurrenceSchema,
  rotationStrategy: RotationStrategySchema.default('round_robin'),
  assignedMemberIds: z.array(z.string().uuid()).default([]),
  currentAssigneeIndex: z.number().default(0),
  estimatedMinutes: z.number().optional(),
  lastCompletedAt: z.string().datetime().optional(),
  lastCompletedBy: z.string().uuid().optional(),
  nextDueAt: z.string().datetime().optional(),
  streak: z.number().default(0),
  isActive: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Routine = z.infer<typeof RoutineSchema>

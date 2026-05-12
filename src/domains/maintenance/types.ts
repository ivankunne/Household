import { z } from 'zod'

export const MaintenanceStatusSchema = z.enum(['upcoming', 'due', 'overdue', 'done', 'skipped'])
export type MaintenanceStatus = z.infer<typeof MaintenanceStatusSchema>

export const MaintenanceTaskSchema = z.object({
  id: z.string().uuid(),
  householdId: z.string().uuid(),
  householdObjectId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  emoji: z.string().optional(),
  status: MaintenanceStatusSchema.default('upcoming'),
  intervalDays: z.number().optional(),
  lastServicedAt: z.string().datetime().optional(),
  nextDueAt: z.string().datetime().optional(),
  estimatedCost: z.number().optional(),
  actualCost: z.number().optional(),
  serviceProvider: z.string().optional(),
  notes: z.string().optional(),
  completedAt: z.string().datetime().optional(),
  completedBy: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type MaintenanceTask = z.infer<typeof MaintenanceTaskSchema>

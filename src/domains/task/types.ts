import { z } from 'zod'

export const TaskPrioritySchema = z.enum(['low', 'medium', 'high'])
export const TaskStatusSchema = z.enum(['todo', 'in_progress', 'done', 'skipped'])
export const TaskCategorySchema = z.enum([
  'cleaning', 'cooking', 'laundry', 'shopping', 'maintenance',
  'admin', 'pets', 'garden', 'childcare', 'other',
])

export type TaskPriority = z.infer<typeof TaskPrioritySchema>
export type TaskStatus = z.infer<typeof TaskStatusSchema>
export type TaskCategory = z.infer<typeof TaskCategorySchema>

export const TaskSchema = z.object({
  id: z.string().uuid(),
  householdId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  emoji: z.string().optional(),
  category: TaskCategorySchema.default('other'),
  priority: TaskPrioritySchema.default('medium'),
  status: TaskStatusSchema.default('todo'),
  assignedTo: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  completedBy: z.string().uuid().optional(),
  estimatedMinutes: z.number().optional(),
  routineId: z.string().uuid().optional(),
  householdObjectId: z.string().uuid().optional(),
  tags: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
})

export type Task = z.infer<typeof TaskSchema>

export const CreateTaskInputSchema = TaskSchema.omit({
  id: true, createdAt: true, updatedAt: true,
  completedAt: true, completedBy: true,
  status: true,
}).partial({ householdId: true, createdBy: true, category: true, priority: true, tags: true })

export type CreateTaskInput = z.infer<typeof CreateTaskInputSchema>

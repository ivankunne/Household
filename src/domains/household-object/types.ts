import { z } from 'zod'

export const HouseholdObjectTypeSchema = z.enum([
  'appliance', 'vehicle', 'pet', 'electronics', 'furniture',
  'tool', 'subscription_service', 'other',
])

export type HouseholdObjectType = z.infer<typeof HouseholdObjectTypeSchema>

export const HouseholdObjectSchema = z.object({
  id: z.string().uuid(),
  householdId: z.string().uuid(),
  name: z.string().min(1).max(200),
  emoji: z.string().optional(),
  type: HouseholdObjectTypeSchema.default('other'),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().datetime().optional(),
  purchasePrice: z.number().optional(),
  warrantyExpiresAt: z.string().datetime().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  manualUrl: z.string().url().optional(),
  documentIds: z.array(z.string().uuid()).default([]),
  maintenanceTaskIds: z.array(z.string().uuid()).default([]),
  expenseIds: z.array(z.string().uuid()).default([]),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type HouseholdObject = z.infer<typeof HouseholdObjectSchema>

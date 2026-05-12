import { z } from 'zod'

export const HouseholdSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  emoji: z.string().default('🏠'),
  theme: z.enum(['cozy', 'minimal', 'vibrant', 'forest', 'ocean']).default('cozy'),
  timezone: z.string().default('UTC'),
  currency: z.string().default('USD'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  memberIds: z.array(z.string().uuid()),
  settings: z.object({
    weekStartsOn: z.number().min(0).max(6).default(1),
    notificationsEnabled: z.boolean().default(true),
    mascotEnabled: z.boolean().default(true),
    mascotName: z.string().default('Pebble'),
    choreRotationEnabled: z.boolean().default(true),
  }),
})

export type Household = z.infer<typeof HouseholdSchema>
export type HouseholdSettings = Household['settings']

import { z } from 'zod'

export const GroceryUnitSchema = z.enum([
  'item', 'pack', 'bag', 'box', 'bottle', 'can', 'jar',
  'kg', 'g', 'lb', 'oz', 'L', 'ml', 'dozen',
])

export type GroceryUnit = z.infer<typeof GroceryUnitSchema>

export const GroceryCategorySchema = z.enum([
  'produce', 'dairy', 'meat', 'bakery', 'frozen', 'pantry',
  'beverages', 'snacks', 'cleaning', 'personal_care', 'pet', 'other',
])

export type GroceryCategory = z.infer<typeof GroceryCategorySchema>

export const GroceryItemSchema = z.object({
  id: z.string().uuid(),
  householdId: z.string().uuid(),
  name: z.string().min(1).max(200),
  emoji: z.string().optional(),
  category: GroceryCategorySchema.default('other'),
  quantity: z.number().min(0).default(1),
  unit: GroceryUnitSchema.default('item'),
  note: z.string().optional(),
  brand: z.string().optional(),
  isChecked: z.boolean().default(false),
  isRunningLow: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  addedBy: z.string().uuid(),
  checkedBy: z.string().uuid().optional(),
  checkedAt: z.string().datetime().optional(),
  sessionId: z.string().uuid().optional(),
  estimatedPrice: z.number().optional(),
  actualPrice: z.number().optional(),
  tags: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type GroceryItem = z.infer<typeof GroceryItemSchema>

export const ShoppingSessionSchema = z.object({
  id: z.string(),
  householdId: z.string(),
  createdAt: z.string().datetime(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  startedBy: z.string(),
  store: z.string().optional(),
  totalSpent: z.number().optional(),
  itemCount: z.number().default(0),
  itemIds: z.array(z.string()).default([]),
})

export type ShoppingSession = z.infer<typeof ShoppingSessionSchema>

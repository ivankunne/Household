import { z } from 'zod'

export const ExpenseCategorySchema = z.enum([
  'rent', 'utilities', 'groceries', 'dining', 'entertainment',
  'transport', 'health', 'household', 'subscriptions', 'insurance',
  'maintenance', 'pets', 'childcare', 'clothing', 'other',
])

export type ExpenseCategory = z.infer<typeof ExpenseCategorySchema>

export const ExpenseSplitSchema = z.object({
  memberId: z.string().uuid(),
  amount: z.number(),
  isPaid: z.boolean().default(false),
  paidAt: z.string().datetime().optional(),
})

export type ExpenseSplit = z.infer<typeof ExpenseSplitSchema>

export const ExpenseSchema = z.object({
  id: z.string().uuid(),
  householdId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  emoji: z.string().optional(),
  category: ExpenseCategorySchema.default('other'),
  amount: z.number().min(0),
  currency: z.string().default('USD'),
  paidBy: z.string().uuid(),
  splits: z.array(ExpenseSplitSchema).default([]),
  date: z.string().datetime(),
  receiptUrl: z.string().url().optional(),
  shoppingSessionId: z.string().uuid().optional(),
  householdObjectId: z.string().uuid().optional(),
  tags: z.array(z.string()).default([]),
  isSettled: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Expense = z.infer<typeof ExpenseSchema>

export const SubscriptionFrequencySchema = z.enum(['weekly', 'monthly', 'quarterly', 'yearly'])
export type SubscriptionFrequency = z.infer<typeof SubscriptionFrequencySchema>

export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  householdId: z.string().uuid(),
  name: z.string().min(1).max(200),
  emoji: z.string().optional(),
  category: ExpenseCategorySchema.default('subscriptions'),
  amount: z.number().min(0),
  currency: z.string().default('USD'),
  frequency: SubscriptionFrequencySchema.default('monthly'),
  nextBillingDate: z.string().datetime(),
  paidBy: z.string().uuid(),
  isShared: z.boolean().default(false),
  isActive: z.boolean().default(true),
  url: z.string().url().optional(),
  notes: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Subscription = z.infer<typeof SubscriptionSchema>

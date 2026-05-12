import { z } from 'zod'

export const DocumentSchema = z.object({
  id: z.string().uuid(),
  householdId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  emoji: z.string().optional(),
  category: z.enum([
    'warranty', 'manual', 'insurance', 'contract', 'receipt',
    'medical', 'financial', 'legal', 'other',
  ]).default('other'),
  fileUrl: z.string().optional(),
  fileType: z.string().optional(),
  fileSize: z.number().optional(),
  content: z.string().optional(),
  householdObjectId: z.string().uuid().optional(),
  memberId: z.string().uuid().optional(),
  expiresAt: z.string().datetime().optional(),
  tags: z.array(z.string()).default([]),
  uploadedBy: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Document = z.infer<typeof DocumentSchema>

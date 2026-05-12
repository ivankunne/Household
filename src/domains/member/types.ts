import { z } from 'zod'

export const MemberRoleSchema = z.enum(['owner', 'admin', 'member'])
export type MemberRole = z.infer<typeof MemberRoleSchema>

export const MemberSchema = z.object({
  id: z.string().uuid(),
  householdId: z.string().uuid(),
  name: z.string().min(1).max(80),
  emoji: z.string().default('😊'),
  color: z.string().default('#A8DADC'),
  role: MemberRoleSchema.default('member'),
  isCurrentUser: z.boolean().default(false),
  joinedAt: z.string().datetime(),
  stats: z.object({
    tasksCompleted: z.number().default(0),
    currentStreak: z.number().default(0),
    longestStreak: z.number().default(0),
    points: z.number().default(0),
  }),
})

export type Member = z.infer<typeof MemberSchema>
export type MemberStats = Member['stats']

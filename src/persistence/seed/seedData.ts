import { v4 as uuid } from 'uuid'
import type { Household } from '@/domains/household/types'
import type { Member } from '@/domains/member/types'
import type { Task } from '@/domains/task/types'
import type { Routine } from '@/domains/routine/types'
import type { GroceryItem } from '@/domains/grocery/types'
import type { Expense, Subscription } from '@/domains/expense/types'
import type { HouseholdObject } from '@/domains/household-object/types'
import type { ActivityEvent } from '@/domains/activity/types'
import type { MascotMessage } from '@/domains/activity/types'

const now = new Date().toISOString()
const yesterday = new Date(Date.now() - 86400000).toISOString()
const tomorrow = new Date(Date.now() + 86400000).toISOString()
const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString()
const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString()

export const HOUSEHOLD_ID = 'seed-household-001'
export const MEMBER_1_ID = 'seed-member-001'
export const MEMBER_2_ID = 'seed-member-002'

export const seedHousehold: Household = {
  id: HOUSEHOLD_ID,
  name: 'The Cozy Den',
  emoji: '🏡',
  theme: 'cozy',
  timezone: 'America/New_York',
  currency: 'USD',
  createdAt: lastWeek,
  updatedAt: now,
  memberIds: [MEMBER_1_ID, MEMBER_2_ID],
  settings: {
    weekStartsOn: 1,
    notificationsEnabled: true,
    mascotEnabled: true,
    mascotName: 'Pebble',
    choreRotationEnabled: true,
  },
}

export const seedMembers: Member[] = [
  {
    id: MEMBER_1_ID,
    householdId: HOUSEHOLD_ID,
    name: 'Alex',
    emoji: '🌿',
    color: '#7CB9A8',
    role: 'owner',
    isCurrentUser: true,
    joinedAt: lastWeek,
    stats: {
      tasksCompleted: 23,
      currentStreak: 5,
      longestStreak: 12,
      points: 340,
    },
  },
  {
    id: MEMBER_2_ID,
    householdId: HOUSEHOLD_ID,
    name: 'Jordan',
    emoji: '☀️',
    color: '#F4A261',
    role: 'member',
    isCurrentUser: false,
    joinedAt: lastWeek,
    stats: {
      tasksCompleted: 19,
      currentStreak: 3,
      longestStreak: 8,
      points: 285,
    },
  },
]

export const seedTasks: Task[] = [
  {
    id: uuid(),
    householdId: HOUSEHOLD_ID,
    title: 'Take out the recycling',
    emoji: '♻️',
    category: 'cleaning',
    priority: 'medium',
    status: 'todo',
    assignedTo: MEMBER_1_ID,
    dueDate: now,
    estimatedMinutes: 5,
    tags: ['outside'],
    createdAt: yesterday,
    updatedAt: yesterday,
    createdBy: MEMBER_1_ID,
  },
  {
    id: uuid(),
    householdId: HOUSEHOLD_ID,
    title: 'Clean the bathroom',
    emoji: '🚿',
    category: 'cleaning',
    priority: 'high',
    status: 'todo',
    assignedTo: MEMBER_2_ID,
    dueDate: tomorrow,
    estimatedMinutes: 30,
    tags: ['cleaning'],
    createdAt: yesterday,
    updatedAt: yesterday,
    createdBy: MEMBER_1_ID,
  },
  {
    id: uuid(),
    householdId: HOUSEHOLD_ID,
    title: 'Pay electricity bill',
    emoji: '⚡',
    category: 'admin',
    priority: 'high',
    status: 'todo',
    assignedTo: MEMBER_1_ID,
    dueDate: tomorrow,
    estimatedMinutes: 10,
    tags: ['bills'],
    createdAt: yesterday,
    updatedAt: yesterday,
    createdBy: MEMBER_2_ID,
  },
  {
    id: uuid(),
    householdId: HOUSEHOLD_ID,
    title: 'Vacuum living room',
    emoji: '🧹',
    category: 'cleaning',
    priority: 'low',
    status: 'done',
    assignedTo: MEMBER_2_ID,
    completedAt: yesterday,
    completedBy: MEMBER_2_ID,
    estimatedMinutes: 20,
    tags: [],
    createdAt: lastWeek,
    updatedAt: yesterday,
    createdBy: MEMBER_1_ID,
  },
  {
    id: uuid(),
    householdId: HOUSEHOLD_ID,
    title: 'Call the plumber',
    emoji: '🔧',
    category: 'maintenance',
    priority: 'high',
    status: 'todo',
    dueDate: nextWeek,
    estimatedMinutes: 15,
    tags: ['maintenance'],
    createdAt: yesterday,
    updatedAt: yesterday,
    createdBy: MEMBER_2_ID,
  },
]

export const seedRoutines: Routine[] = [
  {
    id: uuid(),
    householdId: HOUSEHOLD_ID,
    title: 'Take out trash',
    emoji: '🗑️',
    category: 'cleaning',
    recurrence: { type: 'weekly', interval: 1, daysOfWeek: [1] },
    rotationStrategy: 'round_robin',
    assignedMemberIds: [MEMBER_1_ID, MEMBER_2_ID],
    currentAssigneeIndex: 0,
    estimatedMinutes: 10,
    lastCompletedAt: yesterday,
    nextDueAt: nextWeek,
    streak: 8,
    isActive: true,
    tags: [],
    createdAt: lastWeek,
    updatedAt: yesterday,
  },
  {
    id: uuid(),
    householdId: HOUSEHOLD_ID,
    title: 'Grocery run',
    emoji: '🛒',
    category: 'shopping',
    recurrence: { type: 'weekly', interval: 1, daysOfWeek: [6] },
    rotationStrategy: 'round_robin',
    assignedMemberIds: [MEMBER_1_ID, MEMBER_2_ID],
    currentAssigneeIndex: 1,
    estimatedMinutes: 60,
    lastCompletedAt: lastWeek,
    nextDueAt: tomorrow,
    streak: 4,
    isActive: true,
    tags: [],
    createdAt: lastWeek,
    updatedAt: lastWeek,
  },
  {
    id: uuid(),
    householdId: HOUSEHOLD_ID,
    title: 'Clean the kitchen',
    emoji: '🍳',
    category: 'cleaning',
    recurrence: { type: 'daily', interval: 1 },
    rotationStrategy: 'round_robin',
    assignedMemberIds: [MEMBER_1_ID, MEMBER_2_ID],
    currentAssigneeIndex: 0,
    estimatedMinutes: 15,
    lastCompletedAt: yesterday,
    nextDueAt: now,
    streak: 12,
    isActive: true,
    tags: ['kitchen'],
    createdAt: lastWeek,
    updatedAt: yesterday,
  },
  {
    id: uuid(),
    householdId: HOUSEHOLD_ID,
    title: 'Water the plants',
    emoji: '🌱',
    category: 'garden',
    recurrence: { type: 'biweekly', interval: 2 },
    rotationStrategy: 'fixed',
    assignedMemberIds: [MEMBER_1_ID],
    currentAssigneeIndex: 0,
    estimatedMinutes: 10,
    lastCompletedAt: lastWeek,
    nextDueAt: tomorrow,
    streak: 3,
    isActive: true,
    tags: ['plants'],
    createdAt: lastWeek,
    updatedAt: lastWeek,
  },
]

export const seedGroceryItems: GroceryItem[] = [
  {
    id: uuid(), householdId: HOUSEHOLD_ID, name: 'Oat milk', emoji: '🥛',
    category: 'dairy', quantity: 2, unit: 'item', isChecked: false,
    isRunningLow: true, isPinned: false, addedBy: MEMBER_1_ID, tags: [],
    createdAt: yesterday, updatedAt: yesterday,
  },
  {
    id: uuid(), householdId: HOUSEHOLD_ID, name: 'Sourdough bread', emoji: '🍞',
    category: 'bakery', quantity: 1, unit: 'item', isChecked: false,
    isRunningLow: false, isPinned: false, addedBy: MEMBER_2_ID, tags: [],
    createdAt: yesterday, updatedAt: yesterday,
  },
  {
    id: uuid(), householdId: HOUSEHOLD_ID, name: 'Eggs', emoji: '🥚',
    category: 'dairy', quantity: 1, unit: 'dozen', isChecked: false,
    isRunningLow: true, isPinned: true, addedBy: MEMBER_1_ID, tags: [],
    createdAt: yesterday, updatedAt: yesterday,
  },
  {
    id: uuid(), householdId: HOUSEHOLD_ID, name: 'Avocados', emoji: '🥑',
    category: 'produce', quantity: 3, unit: 'item', isChecked: false,
    isRunningLow: false, isPinned: false, addedBy: MEMBER_2_ID, tags: [],
    createdAt: now, updatedAt: now,
  },
  {
    id: uuid(), householdId: HOUSEHOLD_ID, name: 'Coffee beans', emoji: '☕',
    category: 'beverages', quantity: 1, unit: 'bag', isChecked: false,
    isRunningLow: true, isPinned: true, addedBy: MEMBER_1_ID, tags: ['morning'],
    createdAt: yesterday, updatedAt: yesterday,
  },
  {
    id: uuid(), householdId: HOUSEHOLD_ID, name: 'Dish soap', emoji: '🧴',
    category: 'cleaning', quantity: 1, unit: 'bottle', isChecked: false,
    isRunningLow: true, isPinned: false, addedBy: MEMBER_2_ID, tags: [],
    createdAt: yesterday, updatedAt: yesterday,
  },
  {
    id: uuid(), householdId: HOUSEHOLD_ID, name: 'Greek yogurt', emoji: '🫙',
    category: 'dairy', quantity: 2, unit: 'item', isChecked: true,
    isRunningLow: false, isPinned: false, addedBy: MEMBER_1_ID,
    checkedBy: MEMBER_2_ID, checkedAt: now,
    tags: [], createdAt: lastWeek, updatedAt: now,
  },
]

export const seedExpenses: Expense[] = [
  {
    id: uuid(),
    householdId: HOUSEHOLD_ID,
    title: 'Weekly groceries',
    emoji: '🛒',
    category: 'groceries',
    amount: 127.50,
    currency: 'USD',
    paidBy: MEMBER_1_ID,
    splits: [
      { memberId: MEMBER_1_ID, amount: 63.75, isPaid: true },
      { memberId: MEMBER_2_ID, amount: 63.75, isPaid: false },
    ],
    date: yesterday,
    isSettled: false,
    tags: [],
    createdAt: yesterday,
    updatedAt: yesterday,
  },
  {
    id: uuid(),
    householdId: HOUSEHOLD_ID,
    title: 'Dinner at Pasta Palace',
    emoji: '🍝',
    category: 'dining',
    amount: 78.00,
    currency: 'USD',
    paidBy: MEMBER_2_ID,
    splits: [
      { memberId: MEMBER_1_ID, amount: 39.00, isPaid: false },
      { memberId: MEMBER_2_ID, amount: 39.00, isPaid: true },
    ],
    date: lastWeek,
    isSettled: false,
    tags: ['dining'],
    createdAt: lastWeek,
    updatedAt: lastWeek,
  },
]

export const seedSubscriptions: Subscription[] = [
  {
    id: uuid(), householdId: HOUSEHOLD_ID, name: 'Netflix', emoji: '🎬',
    category: 'subscriptions', amount: 15.99, currency: 'USD',
    frequency: 'monthly', nextBillingDate: nextWeek,
    paidBy: MEMBER_1_ID, isShared: true, isActive: true,
    url: 'https://netflix.com', createdAt: lastWeek, updatedAt: lastWeek,
  },
  {
    id: uuid(), householdId: HOUSEHOLD_ID, name: 'Spotify Family', emoji: '🎵',
    category: 'subscriptions', amount: 16.99, currency: 'USD',
    frequency: 'monthly', nextBillingDate: nextWeek,
    paidBy: MEMBER_2_ID, isShared: true, isActive: true,
    url: 'https://spotify.com', createdAt: lastWeek, updatedAt: lastWeek,
  },
  {
    id: uuid(), householdId: HOUSEHOLD_ID, name: 'iCloud Storage', emoji: '☁️',
    category: 'subscriptions', amount: 2.99, currency: 'USD',
    frequency: 'monthly', nextBillingDate: tomorrow,
    paidBy: MEMBER_1_ID, isShared: false, isActive: true,
    createdAt: lastWeek, updatedAt: lastWeek,
  },
]

export const seedHouseholdObjects: HouseholdObject[] = [
  {
    id: uuid(), householdId: HOUSEHOLD_ID, name: 'Dishwasher', emoji: '🫧',
    type: 'appliance', brand: 'Bosch', model: 'SMS46KI01E',
    purchaseDate: lastWeek, purchasePrice: 649,
    warrantyExpiresAt: new Date(Date.now() + 365 * 2 * 86400000).toISOString(),
    location: 'Kitchen',
    documentIds: [], maintenanceTaskIds: [], expenseIds: [],
    tags: ['kitchen'], isActive: true,
    createdAt: lastWeek, updatedAt: lastWeek,
  },
  {
    id: uuid(), householdId: HOUSEHOLD_ID, name: 'Honda Civic 2021', emoji: '🚗',
    type: 'vehicle', brand: 'Honda', model: 'Civic',
    notes: 'Next service: 50,000 miles',
    documentIds: [], maintenanceTaskIds: [], expenseIds: [],
    tags: ['vehicle'], isActive: true,
    createdAt: lastWeek, updatedAt: lastWeek,
  },
  {
    id: uuid(), householdId: HOUSEHOLD_ID, name: 'Mochi', emoji: '🐱',
    type: 'pet',
    notes: 'Indoor cat. Vet: Dr. Chen at Paw Clinic',
    documentIds: [], maintenanceTaskIds: [], expenseIds: [],
    tags: ['pet', 'cat'], isActive: true,
    createdAt: lastWeek, updatedAt: lastWeek,
  },
  {
    id: uuid(), householdId: HOUSEHOLD_ID, name: 'MacBook Pro 14"', emoji: '💻',
    type: 'electronics', brand: 'Apple', model: 'MacBook Pro 14" M3',
    purchaseDate: lastWeek, purchasePrice: 1999,
    warrantyExpiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
    location: 'Home Office',
    documentIds: [], maintenanceTaskIds: [], expenseIds: [],
    tags: ['electronics', 'work'], isActive: true,
    createdAt: lastWeek, updatedAt: lastWeek,
  },
]

export const seedActivityEvents: ActivityEvent[] = [
  {
    id: uuid(), householdId: HOUSEHOLD_ID,
    type: 'task.completed', actorId: MEMBER_2_ID, targetType: 'task',
    message: 'Completed: Vacuum living room', emoji: '✅',
    payload: {}, isHighlight: false, createdAt: yesterday,
  },
  {
    id: uuid(), householdId: HOUSEHOLD_ID,
    type: 'grocery.item_added', actorId: MEMBER_1_ID, targetType: 'grocery_item',
    message: 'Added Coffee beans to the list', emoji: '☕',
    payload: {}, isHighlight: false, createdAt: yesterday,
  },
  {
    id: uuid(), householdId: HOUSEHOLD_ID,
    type: 'routine.completed', actorId: MEMBER_1_ID, targetType: 'routine',
    message: 'Completed routine: Take out trash', emoji: '🗑️',
    payload: {}, isHighlight: false, createdAt: yesterday,
  },
  {
    id: uuid(), householdId: HOUSEHOLD_ID,
    type: 'expense.added', actorId: MEMBER_1_ID, targetType: 'expense',
    message: 'Added expense: Weekly groceries ($127.50)', emoji: '🛒',
    payload: {}, isHighlight: false, createdAt: yesterday,
  },
  {
    id: uuid(), householdId: HOUSEHOLD_ID,
    type: 'streak.milestone', actorId: MEMBER_1_ID,
    message: 'Kitchen clean streak: 12 days!', emoji: '🔥',
    payload: { streak: 12, routineName: 'Clean the kitchen' }, isHighlight: true, createdAt: yesterday,
  },
]

export const seedMascotMessages: MascotMessage[] = [
  {
    id: uuid(), householdId: HOUSEHOLD_ID,
    text: "Good morning! Your home is rooting for you today ☀️",
    emoji: '☀️', mood: 'happy', triggerType: 'morning_greeting',
    isRead: false, createdAt: now,
  },
  {
    id: uuid(), householdId: HOUSEHOLD_ID,
    text: "Kitchen clean streak: 12 days! You two are on fire 🔥",
    emoji: '🔥', mood: 'excited', triggerType: 'streak_milestone',
    isRead: true, createdAt: yesterday,
  },
]

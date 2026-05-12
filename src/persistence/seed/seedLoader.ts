'use client'

import { LocalCollectionStore } from '../local/LocalStorageAdapter'
import {
  seedHousehold, seedMembers, seedTasks, seedRoutines,
  seedGroceryItems, seedExpenses, seedSubscriptions,
  seedHouseholdObjects, seedActivityEvents, seedMascotMessages,
} from './seedData'
import type { Household } from '@/domains/household/types'

export async function loadSeedData(): Promise<void> {
  const householdStore = new LocalCollectionStore<Household>('households')
  const existing = await householdStore.getById(seedHousehold.id)
  if (existing) return // Already seeded

  await householdStore.set(seedHousehold)

  const memberStore = new LocalCollectionStore('members')
  for (const m of seedMembers) await memberStore.set(m)

  const taskStore = new LocalCollectionStore('tasks')
  for (const t of seedTasks) await taskStore.set(t)

  const routineStore = new LocalCollectionStore('routines')
  for (const r of seedRoutines) await routineStore.set(r)

  const groceryStore = new LocalCollectionStore('grocery_items')
  for (const g of seedGroceryItems) await groceryStore.set(g)

  const expenseStore = new LocalCollectionStore('expenses')
  for (const e of seedExpenses) await expenseStore.set(e)

  const subStore = new LocalCollectionStore('subscriptions')
  for (const s of seedSubscriptions) await subStore.set(s)

  const objectStore = new LocalCollectionStore('household_objects')
  for (const o of seedHouseholdObjects) await objectStore.set(o)

  const activityStore = new LocalCollectionStore('activity_events')
  for (const a of seedActivityEvents) await activityStore.set(a)

  const mascotStore = new LocalCollectionStore('mascot_messages')
  for (const m of seedMascotMessages) await mascotStore.set(m)
}

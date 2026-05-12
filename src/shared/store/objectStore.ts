import { create } from 'zustand'
import { LocalCollectionStore } from '@/persistence/local/LocalStorageAdapter'
import { v4 as uuid } from 'uuid'
import type { HouseholdObject } from '@/domains/household-object/types'

const store = new LocalCollectionStore<HouseholdObject>('household_objects')

interface ObjectState {
  objects: HouseholdObject[]
  isLoading: boolean

  loadObjects: (householdId: string) => Promise<void>
  addObject: (input: Omit<HouseholdObject, 'id' | 'createdAt' | 'updatedAt'>) => Promise<HouseholdObject>
  updateObject: (id: string, patch: Partial<HouseholdObject>) => Promise<void>
  deleteObject: (id: string) => Promise<void>
}

export const useObjectStore = create<ObjectState>()((set) => ({
  objects: [],
  isLoading: false,

  loadObjects: async (householdId) => {
    set({ isLoading: true })
    const all = await store.getAll()
    set({ objects: all.filter((o) => o.householdId === householdId), isLoading: false })
  },

  addObject: async (input) => {
    const now = new Date().toISOString()
    const obj: HouseholdObject = { ...input, id: uuid(), createdAt: now, updatedAt: now }
    await store.set(obj)
    set((s) => ({ objects: [obj, ...s.objects] }))
    return obj
  },

  updateObject: async (id, patch) => {
    const existing = await store.getById(id)
    if (!existing) return
    const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() }
    await store.set(updated)
    set((s) => ({ objects: s.objects.map((o) => (o.id === id ? updated : o)) }))
  },

  deleteObject: async (id) => {
    await store.remove(id)
    set((s) => ({ objects: s.objects.filter((o) => o.id !== id) }))
  },
}))

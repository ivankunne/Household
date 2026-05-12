import { create } from 'zustand'
import { LocalGroceryRepository } from '@/persistence/local/LocalGroceryRepository'
import { emitActivity } from '@/events/ActivityEngine'
import type { GroceryItem } from '@/domains/grocery/types'

const repo = new LocalGroceryRepository()

interface GroceryState {
  items: GroceryItem[]
  isLoading: boolean
  searchQuery: string

  loadItems: (householdId: string) => Promise<void>
  addItem: (
    name: string,
    opts: Partial<GroceryItem>,
    householdId: string,
    memberId: string,
  ) => Promise<GroceryItem>
  checkItem: (id: string, memberId: string, householdId: string) => Promise<void>
  uncheckItem: (id: string) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  clearChecked: (householdId: string) => Promise<void>
  updateItem: (id: string, patch: Partial<GroceryItem>) => Promise<void>
  setSearch: (q: string) => void
  getFiltered: () => GroceryItem[]
  getByCategory: () => Record<string, GroceryItem[]>
}

export const useGroceryStore = create<GroceryState>()((set, get) => ({
  items: [],
  isLoading: false,
  searchQuery: '',

  loadItems: async (householdId) => {
    set({ isLoading: true })
    const items = await repo.findAll(householdId)
    set({ items, isLoading: false })
  },

  addItem: async (name, opts, householdId, memberId) => {
    const item = await repo.create({
      name,
      householdId,
      addedBy: memberId,
      isChecked: false,
      isRunningLow: false,
      isPinned: false,
      quantity: 1,
      unit: 'item',
      category: 'other',
      tags: [],
      updatedAt: new Date().toISOString(),
      ...opts,
    } as Omit<GroceryItem, 'id' | 'createdAt'>)
    set((s) => ({ items: [item, ...s.items] }))
    await emitActivity({
      householdId,
      type: 'grocery.item_added',
      actorId: memberId,
      targetId: item.id,
      targetType: 'grocery_item',
      message: `Added ${name} to the list`,
      emoji: item.emoji ?? '🛒',
    })
    return item
  },

  checkItem: async (id, memberId, householdId) => {
    const item = await repo.checkItem(id, memberId)
    if (!item) return
    set((s) => ({ items: s.items.map((i) => (i.id === id ? item : i)) }))
    await emitActivity({
      householdId,
      type: 'grocery.item_checked',
      actorId: memberId,
      targetId: id,
      targetType: 'grocery_item',
      message: `Got ${item.name}`,
      emoji: '✅',
    })
  },

  uncheckItem: async (id) => {
    const item = await repo.uncheckItem(id)
    if (!item) return
    set((s) => ({ items: s.items.map((i) => (i.id === id ? item : i)) }))
  },

  deleteItem: async (id) => {
    await repo.delete(id)
    set((s) => ({ items: s.items.filter((i) => i.id !== id) }))
  },

  clearChecked: async (householdId) => {
    await repo.clearChecked(householdId)
    set((s) => ({ items: s.items.filter((i) => !i.isChecked) }))
  },

  updateItem: async (id, patch) => {
    const item = await repo.update(id, patch)
    if (!item) return
    set((s) => ({ items: s.items.map((i) => (i.id === id ? item : i)) }))
  },

  setSearch: (q) => set({ searchQuery: q }),

  getFiltered: () => {
    const { items, searchQuery } = get()
    if (!searchQuery) return items
    return items.filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
  },

  getByCategory: () => {
    const { items } = get()
    return items.reduce<Record<string, GroceryItem[]>>((acc, item) => {
      const cat = item.category ?? 'other'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(item)
      return acc
    }, {})
  },
}))

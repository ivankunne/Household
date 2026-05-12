import { create } from 'zustand'
import { LocalActivityRepository, LocalMascotRepository } from '@/persistence/local/LocalActivityRepository'
import type { ActivityEvent, MascotMessage } from '@/domains/activity/types'

const activityRepo = new LocalActivityRepository()
const mascotRepo = new LocalMascotRepository()

interface ActivityState {
  events: ActivityEvent[]
  mascotMessages: MascotMessage[]
  isLoading: boolean

  loadActivity: (householdId: string) => Promise<void>
  loadMascotMessages: (householdId: string) => Promise<void>
  markMascotRead: (id: string) => Promise<void>
  addEvent: (event: ActivityEvent) => void
  addMascotMessage: (msg: MascotMessage) => void
}

export const useActivityStore = create<ActivityState>()((set) => ({
  events: [],
  mascotMessages: [],
  isLoading: false,

  loadActivity: async (householdId) => {
    set({ isLoading: true })
    const events = await activityRepo.findRecent(householdId, 100)
    set({ events, isLoading: false })
  },

  loadMascotMessages: async (householdId) => {
    const msgs = await mascotRepo.findAll(householdId)
    const sorted = [...msgs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    set({ mascotMessages: sorted })
  },

  markMascotRead: async (id) => {
    await mascotRepo.update(id, { isRead: true })
    set((s) => ({
      mascotMessages: s.mascotMessages.map((m) => (m.id === id ? { ...m, isRead: true } : m)),
    }))
  },

  addEvent: (event) =>
    set((s) => ({ events: [event, ...s.events].slice(0, 100) })),

  addMascotMessage: (msg) =>
    set((s) => ({ mascotMessages: [msg, ...s.mascotMessages] })),
}))

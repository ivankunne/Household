import { create } from 'zustand'
import { LocalRoutineRepository } from '@/persistence/local/LocalRoutineRepository'
import { emitActivity } from '@/events/ActivityEngine'
import type { Routine } from '@/domains/routine/types'

const repo = new LocalRoutineRepository()

interface RoutineState {
  routines: Routine[]
  isLoading: boolean

  loadRoutines: (householdId: string) => Promise<void>
  addRoutine: (routine: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Routine>
  completeRoutine: (id: string, memberId: string, householdId: string) => Promise<void>
  updateRoutine: (id: string, patch: Partial<Routine>) => Promise<void>
  deleteRoutine: (id: string) => Promise<void>
}

export const useRoutineStore = create<RoutineState>()((set) => ({
  routines: [],
  isLoading: false,

  loadRoutines: async (householdId) => {
    set({ isLoading: true })
    const routines = await repo.findAll(householdId)
    set({ routines, isLoading: false })
  },

  addRoutine: async (input) => {
    const routine = await repo.create({ ...input, updatedAt: new Date().toISOString() } as Omit<Routine, 'id' | 'createdAt'>)
    set((s) => ({ routines: [routine, ...s.routines] }))
    return routine
  },

  completeRoutine: async (id, memberId, householdId) => {
    const routine = await repo.completeRoutine(id, memberId)
    if (!routine) return
    // Advance rotation if round robin
    if (routine.rotationStrategy === 'round_robin') {
      await repo.advanceRotation(id)
    }
    set((s) => ({ routines: s.routines.map((r) => (r.id === id ? routine : r)) }))
    await emitActivity({
      householdId,
      type: 'routine.completed',
      actorId: memberId,
      targetId: id,
      targetType: 'routine',
      message: `Completed routine: ${routine.title}`,
      emoji: routine.emoji ?? '🔄',
      isHighlight: routine.streak > 0 && routine.streak % 7 === 0,
    })
  },

  updateRoutine: async (id, patch) => {
    const routine = await repo.update(id, patch)
    if (!routine) return
    set((s) => ({ routines: s.routines.map((r) => (r.id === id ? routine : r)) }))
  },

  deleteRoutine: async (id) => {
    await repo.delete(id)
    set((s) => ({ routines: s.routines.filter((r) => r.id !== id) }))
  },
}))

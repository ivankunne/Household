import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Household } from '@/domains/household/types'
import type { Member } from '@/domains/member/types'

interface HouseholdState {
  household: Household | null
  members: Member[]
  currentMemberId: string | null

  setHousehold: (h: Household) => void
  updateHousehold: (patch: Partial<Household>) => void
  setMembers: (members: Member[]) => void
  addMember: (member: Member) => void
  setCurrentMember: (id: string) => void
  getCurrentMember: () => Member | null
}

export const useHouseholdStore = create<HouseholdState>()(
  persist(
    (set, get) => ({
      household: null,
      members: [],
      currentMemberId: null,

      setHousehold: (household) => set({ household }),

      updateHousehold: (patch) =>
        set((s) => ({
          household: s.household ? { ...s.household, ...patch, updatedAt: new Date().toISOString() } : null,
        })),

      setMembers: (members) => set({ members }),

      addMember: (member) =>
        set((s) => ({ members: [...s.members, member] })),

      setCurrentMember: (id) => set({ currentMemberId: id }),

      getCurrentMember: () => {
        const { members, currentMemberId } = get()
        return members.find((m) => m.id === currentMemberId) ?? null
      },
    }),
    { name: 'household-store' },
  ),
)

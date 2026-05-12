'use client'

import { useEffect } from 'react'
import { loadSeedData } from '@/persistence/seed/seedLoader'
import { useHouseholdStore } from '@/shared/store/householdStore'
import { useTaskStore } from '@/shared/store/taskStore'
import { useGroceryStore } from '@/shared/store/groceryStore'
import { useRoutineStore } from '@/shared/store/routineStore'
import { useActivityStore } from '@/shared/store/activityStore'
import { useExpenseStore } from '@/shared/store/expenseStore'
import { LocalCollectionStore } from '@/persistence/local/LocalStorageAdapter'
import { seedMembers, HOUSEHOLD_ID } from '@/persistence/seed/seedData'
import type { Household } from '@/domains/household/types'
import type { Member } from '@/domains/member/types'
import { onActivity } from '@/events/ActivityEngine'

export function AppProviders({ children }: { children: React.ReactNode }) {
  const { setHousehold, setMembers, setCurrentMember } = useHouseholdStore()
  const { loadTasks } = useTaskStore()
  const { loadItems } = useGroceryStore()
  const { loadRoutines } = useRoutineStore()
  const { loadActivity, loadMascotMessages } = useActivityStore()
  const { loadExpenses, loadSubscriptions } = useExpenseStore()
  const { addEvent } = useActivityStore()

  useEffect(() => {
    async function init() {
      await loadSeedData()

      const householdStore = new LocalCollectionStore<Household>('households')
      const memberStore = new LocalCollectionStore<Member>('members')

      const household = await householdStore.getById(HOUSEHOLD_ID)
      if (household) {
        setHousehold(household)
        const members = await memberStore.getAll()
        setMembers(members.length > 0 ? members : seedMembers)
        const currentUser = members.find((m) => m.isCurrentUser)
        if (currentUser) setCurrentMember(currentUser.id)

        await Promise.all([
          loadTasks(household.id),
          loadItems(household.id),
          loadRoutines(household.id),
          loadActivity(household.id),
          loadMascotMessages(household.id),
          loadExpenses(household.id),
          loadSubscriptions(household.id),
        ])
      }
    }

    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Live-sync activity events into the store
  useEffect(() => {
    const unsub = onActivity('*', (event) => {
      addEvent(event)
    })
    return unsub
  }, [addEvent])

  return <>{children}</>
}

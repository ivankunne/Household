'use client'

import { useGroceryStore } from '@/shared/store/groceryStore'
import { useHouseholdStore } from '@/shared/store/householdStore'
import Link from 'next/link'

export function GroceryRunningLow() {
  const { items } = useGroceryStore()
  const { household } = useHouseholdStore()

  if (!household) return null

  const lowItems = items.filter((i) => i.householdId === household.id && i.isRunningLow && !i.isChecked)

  if (lowItems.length === 0) return null

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-3xl border border-amber-100 dark:border-amber-800 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">👀</span>
          <p className="font-semibold text-sm text-amber-900 dark:text-amber-100">Running low</p>
        </div>
        <Link href="/grocery" className="text-xs font-medium text-amber-700 dark:text-amber-300 hover:underline">
          View list →
        </Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {lowItems.map((item) => (
          <span
            key={item.id}
            className="inline-flex items-center gap-1 text-xs bg-white/60 dark:bg-white/10 text-amber-800 dark:text-amber-200 px-3 py-1.5 rounded-full border border-amber-200/60"
          >
            {item.emoji ?? '📦'} {item.name}
          </span>
        ))}
      </div>
    </div>
  )
}

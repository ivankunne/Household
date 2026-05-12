import type { GroceryItem, ShoppingSession } from '@/domains/grocery/types'
import type { IRepository } from './IRepository'

export interface IGroceryRepository extends IRepository<GroceryItem> {
  findUnchecked(householdId: string): Promise<GroceryItem[]>
  findRunningLow(householdId: string): Promise<GroceryItem[]>
  checkItem(id: string, memberId: string): Promise<GroceryItem | null>
  uncheckItem(id: string): Promise<GroceryItem | null>
  clearChecked(householdId: string): Promise<void>
}

export interface IShoppingSessionRepository extends IRepository<ShoppingSession> {
  findActive(householdId: string): Promise<ShoppingSession | null>
  completeSession(id: string, totalSpent?: number): Promise<ShoppingSession | null>
}

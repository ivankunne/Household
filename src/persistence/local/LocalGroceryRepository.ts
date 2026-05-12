import { BaseLocalRepository } from './BaseLocalRepository'
import type { IGroceryRepository, IShoppingSessionRepository } from '../interfaces/IGroceryRepository'
import type { GroceryItem, ShoppingSession } from '@/domains/grocery/types'

export class LocalGroceryRepository extends BaseLocalRepository<GroceryItem> implements IGroceryRepository {
  constructor() {
    super('grocery_items')
  }

  async findUnchecked(householdId: string): Promise<GroceryItem[]> {
    return this.findWhere((i) => i.householdId === householdId && !i.isChecked)
  }

  async findRunningLow(householdId: string): Promise<GroceryItem[]> {
    return this.findWhere((i) => i.householdId === householdId && i.isRunningLow)
  }

  async checkItem(id: string, memberId: string): Promise<GroceryItem | null> {
    return this.update(id, {
      isChecked: true,
      checkedBy: memberId,
      checkedAt: this.now(),
    })
  }

  async uncheckItem(id: string): Promise<GroceryItem | null> {
    return this.update(id, { isChecked: false, checkedBy: undefined, checkedAt: undefined })
  }

  async clearChecked(householdId: string): Promise<void> {
    const checked = await this.findWhere((i) => i.householdId === householdId && i.isChecked)
    await Promise.all(checked.map((i) => this.delete(i.id)))
  }
}

export class LocalShoppingSessionRepository
  extends BaseLocalRepository<ShoppingSession>
  implements IShoppingSessionRepository {
  constructor() {
    super('shopping_sessions')
  }

  async findActive(householdId: string): Promise<ShoppingSession | null> {
    const sessions = await this.findWhere(
      (s) => s.householdId === householdId && s.completedAt == null,
    )
    return sessions[0] ?? null
  }

  async completeSession(id: string, totalSpent?: number): Promise<ShoppingSession | null> {
    return this.update(id, { completedAt: this.now(), totalSpent })
  }
}

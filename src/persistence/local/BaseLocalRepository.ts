import { v4 as uuid } from 'uuid'
import { LocalCollectionStore } from './LocalStorageAdapter'
import type { IRepository } from '../interfaces/IRepository'

export abstract class BaseLocalRepository<T extends { id: string; createdAt: string; householdId?: string }>
  implements IRepository<T> {
  public store: LocalCollectionStore<T>

  constructor(collection: string) {
    this.store = new LocalCollectionStore<T>(collection)
  }

  protected newId(): string {
    return uuid()
  }

  protected now(): string {
    return new Date().toISOString()
  }

  async findById(id: string): Promise<T | null> {
    return this.store.getById(id)
  }

  async findAll(householdId?: string): Promise<T[]> {
    const all = await this.store.getAll()
    if (!householdId) return all
    return all.filter((item) => (item as { householdId?: string }).householdId === householdId)
  }

  async findWhere(predicate: (item: T) => boolean): Promise<T[]> {
    const all = await this.store.getAll()
    return all.filter(predicate)
  }

  async create(input: Omit<T, 'id' | 'createdAt'>): Promise<T> {
    const now = this.now()
    const item = {
      ...input,
      id: this.newId(),
      createdAt: now,
    } as unknown as T
    return this.store.set(item)
  }

  async update(id: string, patch: Partial<T>): Promise<T | null> {
    const existing = await this.store.getById(id)
    if (!existing) return null
    const updated = { ...existing, ...patch }
    return this.store.set(updated)
  }

  async delete(id: string): Promise<boolean> {
    return this.store.remove(id)
  }

  async deleteAll(householdId: string): Promise<void> {
    const items = await this.findAll(householdId)
    await Promise.all(items.map((item) => this.store.remove(item.id)))
  }
}

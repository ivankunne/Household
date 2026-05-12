import localforage from 'localforage'

// One store per entity collection
const stores: Record<string, LocalForage> = {}

function getStore(collection: string): LocalForage {
  if (!stores[collection]) {
    stores[collection] = localforage.createInstance({
      name: 'household-os',
      storeName: collection,
      driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE],
    })
  }
  return stores[collection]
}

export class LocalCollectionStore<T extends { id: string }> {
  private store: LocalForage

  constructor(collection: string) {
    this.store = getStore(collection)
  }

  async getAll(): Promise<T[]> {
    const items: T[] = []
    await this.store.iterate<T, void>((value) => {
      items.push(value)
    })
    return items
  }

  async getById(id: string): Promise<T | null> {
    return await this.store.getItem<T>(id)
  }

  async set(item: T): Promise<T> {
    await this.store.setItem(item.id, item)
    return item
  }

  async remove(id: string): Promise<boolean> {
    const exists = await this.store.getItem(id)
    if (!exists) return false
    await this.store.removeItem(id)
    return true
  }

  async clear(): Promise<void> {
    await this.store.clear()
  }

  async count(): Promise<number> {
    return await this.store.length()
  }
}

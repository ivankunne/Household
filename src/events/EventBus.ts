import type { ActivityEvent, ActivityEventType } from '@/domains/activity/types'

type EventHandler<T = ActivityEvent> = (event: T) => void | Promise<void>

class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map()

  on(type: ActivityEventType | '*', handler: EventHandler): () => void {
    const key = type
    if (!this.handlers.has(key)) this.handlers.set(key, [])
    this.handlers.get(key)!.push(handler)
    return () => this.off(type, handler)
  }

  off(type: ActivityEventType | '*', handler: EventHandler): void {
    const handlers = this.handlers.get(type) ?? []
    this.handlers.set(type, handlers.filter((h) => h !== handler))
  }

  async emit(event: ActivityEvent): Promise<void> {
    const specific = this.handlers.get(event.type) ?? []
    const wildcard = this.handlers.get('*') ?? []
    const all = [...specific, ...wildcard]
    await Promise.allSettled(all.map((h) => h(event)))
  }
}

// Singleton bus
export const eventBus = new EventBus()

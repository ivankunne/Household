export interface IRepository<T, CreateInput = Omit<T, 'id' | 'createdAt'>> {
  findById(id: string): Promise<T | null>
  findAll(householdId?: string): Promise<T[]>
  findWhere(predicate: (item: T) => boolean): Promise<T[]>
  create(input: CreateInput): Promise<T>
  update(id: string, patch: Partial<T>): Promise<T | null>
  delete(id: string): Promise<boolean>
  deleteAll(householdId: string): Promise<void>
}

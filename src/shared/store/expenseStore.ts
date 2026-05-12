import { create } from 'zustand'
import { LocalCollectionStore } from '@/persistence/local/LocalStorageAdapter'
import { v4 as uuid } from 'uuid'
import type { Expense, Subscription } from '@/domains/expense/types'

const expenseStore = new LocalCollectionStore<Expense>('expenses')
const subStore = new LocalCollectionStore<Subscription>('subscriptions')

interface ExpenseState {
  expenses: Expense[]
  subscriptions: Subscription[]
  isLoading: boolean

  loadExpenses: (householdId: string) => Promise<void>
  addExpense: (input: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Expense>
  settleExpense: (id: string) => Promise<void>
  deleteExpense: (id: string) => Promise<void>

  loadSubscriptions: (householdId: string) => Promise<void>
  addSubscription: (input: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Subscription>
  deleteSubscription: (id: string) => Promise<void>

  getTotalOwed: (memberId: string) => number
  getMonthlyTotal: (householdId: string) => number
}

export const useExpenseStore = create<ExpenseState>()((set, get) => ({
  expenses: [],
  subscriptions: [],
  isLoading: false,

  loadExpenses: async (householdId) => {
    const all = await expenseStore.getAll()
    set({ expenses: all.filter((e) => e.householdId === householdId) })
  },

  addExpense: async (input) => {
    const now = new Date().toISOString()
    const expense: Expense = { ...input, id: uuid(), createdAt: now, updatedAt: now }
    await expenseStore.set(expense)
    set((s) => ({ expenses: [expense, ...s.expenses] }))
    return expense
  },

  settleExpense: async (id) => {
    const exp = await expenseStore.getById(id)
    if (!exp) return
    const updated: Expense = { ...exp, isSettled: true, updatedAt: new Date().toISOString() }
    await expenseStore.set(updated)
    set((s) => ({ expenses: s.expenses.map((e) => (e.id === id ? updated : e)) }))
  },

  deleteExpense: async (id) => {
    await expenseStore.remove(id)
    set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }))
  },

  loadSubscriptions: async (householdId) => {
    const all = await subStore.getAll()
    set({ subscriptions: all.filter((s) => s.householdId === householdId) })
  },

  addSubscription: async (input) => {
    const now = new Date().toISOString()
    const sub: Subscription = { ...input, id: uuid(), createdAt: now, updatedAt: now }
    await subStore.set(sub)
    set((s) => ({ subscriptions: [sub, ...s.subscriptions] }))
    return sub
  },

  deleteSubscription: async (id) => {
    await subStore.remove(id)
    set((s) => ({ subscriptions: s.subscriptions.filter((s) => s.id !== id) }))
  },

  getTotalOwed: (memberId) => {
    const { expenses } = get()
    return expenses
      .filter((e) => !e.isSettled)
      .reduce((total, expense) => {
        const split = expense.splits.find((s) => s.memberId === memberId && !s.isPaid)
        return total + (split?.amount ?? 0)
      }, 0)
  },

  getMonthlyTotal: (householdId) => {
    const { subscriptions } = get()
    return subscriptions
      .filter((s) => s.householdId === householdId && s.isActive)
      .reduce((total, sub) => {
        switch (sub.frequency) {
          case 'weekly': return total + sub.amount * 4.33
          case 'monthly': return total + sub.amount
          case 'quarterly': return total + sub.amount / 3
          case 'yearly': return total + sub.amount / 12
          default: return total + sub.amount
        }
      }, 0)
  },
}))

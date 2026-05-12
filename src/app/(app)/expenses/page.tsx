'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, TrendingUp, RotateCcw } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useExpenseStore } from '@/shared/store/expenseStore'
import { useHouseholdStore } from '@/shared/store/householdStore'
import { expenseCategoryEmojis } from '@/design-system/tokens'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { ExpenseCategory } from '@/domains/expense/types'

const container = { show: { transition: { staggerChildren: 0.05 } } }
const item      = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }

const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'groceries',     label: 'Groceries' },
  { value: 'utilities',     label: 'Utilities' },
  { value: 'dining',        label: 'Dining out' },
  { value: 'household',     label: 'Household' },
  { value: 'transport',     label: 'Transport' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'health',        label: 'Health' },
  { value: 'other',         label: 'Other' },
]

function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="text-center py-16">
      <p className="text-5xl mb-4">{icon}</p>
      <p className="font-medium text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    </div>
  )
}

export default function ExpensesPage() {
  const [addOpen, setAddOpen]       = useState(false)
  const [title, setTitle]           = useState('')
  const [amount, setAmount]         = useState('')
  const [category, setCategory]     = useState<ExpenseCategory>('other')
  const [payerId, setPayerId]       = useState<string>('')

  const { expenses, subscriptions, settleExpense, getMonthlyTotal, getTotalOwed, addExpense } = useExpenseStore()
  const { household, members, getCurrentMember } = useHouseholdStore()

  if (!household) return null

  const member      = getCurrentMember()
  const hExpenses   = expenses.filter((e) => e.householdId === household.id)
  const hSubs       = subscriptions.filter((s) => s.householdId === household.id)
  const monthlyTotal = getMonthlyTotal(household.id)
  const owed        = member ? getTotalOwed(member.id) : 0

  const openAdd = () => {
    setTitle('')
    setAmount('')
    setCategory('other')
    setPayerId(member?.id ?? members[0]?.id ?? '')
    setAddOpen(true)
  }

  const handleAdd = async () => {
    const parsed = parseFloat(amount)
    if (!title.trim() || isNaN(parsed) || parsed <= 0 || !payerId) return
    const perPerson = members.length > 0 ? parsed / members.length : parsed
    const splits = members.map((m) => ({
      memberId: m.id,
      amount:   perPerson,
      isPaid:   m.id === payerId,
    }))
    await addExpense({
      householdId: household.id,
      title:       title.trim(),
      category,
      amount:      parsed,
      currency:    household.currency ?? 'USD',
      paidBy:      payerId,
      splits,
      date:        new Date().toISOString(),
      tags:        [],
      isSettled:   false,
    })
    setAddOpen(false)
    toast.success('Expense added')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[1.75rem] font-semibold tracking-tight text-foreground leading-none">Expenses</h1>
          <p className="text-sm text-muted-foreground mt-1">Shared finances, simplified</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add expense
        </motion.button>
      </div>

      {/* Summary cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 mb-6"
      >
        <motion.div variants={item} className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Monthly subs</p>
          </div>
          <p className="text-2xl font-semibold text-foreground">${monthlyTotal.toFixed(0)}</p>
        </motion.div>

        <motion.div variants={item} className={cn(
          'rounded-xl border p-4',
          owed > 0 ? 'bg-destructive/10 border-destructive/20' : 'bg-primary/10 border-primary/20',
        )}>
          <div className="flex items-center gap-2 mb-2">
            <RotateCcw className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">You owe</p>
          </div>
          <p className={cn('text-2xl font-semibold', owed > 0 ? 'text-destructive' : 'text-hb-green-fg')}>
            ${owed.toFixed(2)}
          </p>
        </motion.div>
      </motion.div>

      <Tabs defaultValue="expenses">
        <TabsList className="rounded-lg mb-4 w-full">
          <TabsTrigger value="expenses"      className="flex-1 rounded-md">Expenses ({hExpenses.length})</TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex-1 rounded-md">Subscriptions ({hSubs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses">
          {hExpenses.length === 0 ? (
            <EmptyState icon="💰" title="No expenses yet" subtitle="Add shared expenses to split with your household" />
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
              {hExpenses.map((expense) => {
                const paidBy  = members.find((m) => m.id === expense.paidBy)
                const myShare = member ? expense.splits.find((s) => s.memberId === member.id) : null

                return (
                  <motion.div
                    key={expense.id}
                    variants={item}
                    className={cn(
                      'bg-card rounded-xl border border-border p-4',
                      expense.isSettled && 'opacity-60',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{expense.emoji ?? expenseCategoryEmojis[expense.category] ?? '💰'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-sm text-foreground">{expense.title}</p>
                          <p className="font-semibold text-foreground shrink-0">${expense.amount.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {paidBy?.emoji} {paidBy?.name} paid
                          </span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">
                            {format(parseISO(expense.date), 'MMM d')}
                          </span>
                        </div>
                        {myShare && !myShare.isPaid && (
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                            <span className="text-xs font-medium text-destructive">
                              Your share: ${myShare.amount.toFixed(2)}
                            </span>
                            <button
                              onClick={() => settleExpense(expense.id)}
                              className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full"
                            >
                              Mark paid
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="subscriptions">
          {hSubs.length === 0 ? (
            <EmptyState icon="📱" title="No subscriptions yet" subtitle="Track shared subscriptions here" />
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
              {hSubs.map((sub) => {
                const nextBilling = new Date(sub.nextBillingDate)
                const daysUntil   = Math.ceil((nextBilling.getTime() - Date.now()) / 86400000)

                return (
                  <motion.div
                    key={sub.id}
                    variants={item}
                    className="bg-card rounded-xl border border-border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{sub.emoji ?? '📱'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm text-foreground">{sub.name}</p>
                          <p className="font-semibold text-foreground">${sub.amount.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground capitalize">{sub.frequency}</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className={cn(
                            'text-xs font-medium',
                            daysUntil <= 3 ? 'text-hb-yellow-fg' : 'text-muted-foreground',
                          )}>
                            {daysUntil <= 0 ? 'Due today' : `Due in ${daysUntil}d`}
                          </span>
                          {sub.isShared && (
                            <>
                              <span className="text-xs text-muted-foreground">·</span>
                              <span className="text-xs text-primary">Shared</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}

              <div className="mt-2 p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Total per month</p>
                <p className="font-semibold text-foreground">${monthlyTotal.toFixed(2)}</p>
              </div>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Expense dialog */}
      <Dialog open={addOpen} onOpenChange={(v) => !v && setAddOpen(false)}>
        <DialogContent className="rounded-xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">New expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <Input
              autoFocus
              placeholder="What was it for?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="rounded-md h-11 text-base"
            />
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="rounded-md h-11 pl-7 text-base"
                min="0"
                step="0.01"
              />
            </div>

            {/* Category */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Category</p>
              <div className="grid grid-cols-4 gap-1.5">
                {EXPENSE_CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setCategory(c.value)}
                    className={cn(
                      'py-1.5 px-2 rounded-md text-xs font-medium transition-colors text-center',
                      category === c.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-surface-2 text-muted-foreground hover:text-foreground border border-border-soft',
                    )}
                  >
                    {expenseCategoryEmojis[c.value] ?? '💰'} {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Who paid */}
            {members.length > 1 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Who paid?</p>
                <div className="flex gap-2 flex-wrap">
                  {members.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setPayerId(m.id)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors',
                        payerId === m.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-surface-2 text-muted-foreground hover:text-foreground border border-border-soft',
                      )}
                    >
                      {m.emoji} {m.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {members.length > 1 && (
              <p className="text-xs text-muted-foreground">
                Split equally — {members.length} people × ${(parseFloat(amount || '0') / members.length).toFixed(2)} each
              </p>
            )}

            <button
              onClick={handleAdd}
              disabled={!title.trim() || !amount || parseFloat(amount) <= 0}
              className="w-full py-2.5 rounded-md bg-primary text-primary-foreground font-medium text-sm disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add expense
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

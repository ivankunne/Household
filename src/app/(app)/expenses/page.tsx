'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, TrendingUp, CreditCard, RotateCcw } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useExpenseStore } from '@/shared/store/expenseStore'
import { useHouseholdStore } from '@/shared/store/householdStore'
import { expenseCategoryEmojis } from '@/design-system/tokens'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

const container = { show: { transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }

export default function ExpensesPage() {
  const { expenses, subscriptions, settleExpense, getMonthlyTotal, getTotalOwed } = useExpenseStore()
  const { household, members, getCurrentMember } = useHouseholdStore()

  if (!household) return null

  const member = getCurrentMember()
  const hExpenses = expenses.filter((e) => e.householdId === household.id)
  const hSubs = subscriptions.filter((s) => s.householdId === household.id)
  const monthlyTotal = getMonthlyTotal(household.id)
  const owed = member ? getTotalOwed(member.id) : 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Shared finances, simplified</p>
        </div>
      </div>

      {/* Summary cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 mb-6"
      >
        <motion.div variants={item} className="bg-card rounded-3xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Monthly subs</p>
          </div>
          <p className="text-2xl font-bold text-foreground">${monthlyTotal.toFixed(0)}</p>
        </motion.div>

        <motion.div variants={item} className={cn(
          'rounded-3xl border p-4',
          owed > 0 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100',
        )}>
          <div className="flex items-center gap-2 mb-2">
            <RotateCcw className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">You owe</p>
          </div>
          <p className={cn('text-2xl font-bold', owed > 0 ? 'text-rose-600' : 'text-emerald-600')}>
            ${owed.toFixed(2)}
          </p>
        </motion.div>
      </motion.div>

      <Tabs defaultValue="expenses">
        <TabsList className="rounded-2xl mb-4">
          <TabsTrigger value="expenses" className="rounded-xl">Expenses ({hExpenses.length})</TabsTrigger>
          <TabsTrigger value="subscriptions" className="rounded-xl">Subscriptions ({hSubs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses">
          {hExpenses.length === 0 ? (
            <EmptyState icon="💰" title="No expenses yet" subtitle="Add shared expenses to split with your household" />
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
              {hExpenses.map((expense) => {
                const paidBy = members.find((m) => m.id === expense.paidBy)
                const myShare = member ? expense.splits.find((s) => s.memberId === member.id) : null

                return (
                  <motion.div
                    key={expense.id}
                    variants={item}
                    className={cn(
                      'bg-card rounded-3xl border border-border p-4',
                      expense.isSettled && 'opacity-60',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{expense.emoji ?? expenseCategoryEmojis[expense.category] ?? '💰'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-sm text-foreground">{expense.title}</p>
                          <p className="font-bold text-foreground shrink-0">${expense.amount.toFixed(2)}</p>
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
                            <span className="text-xs font-medium text-rose-600">
                              Your share: ${myShare.amount.toFixed(2)}
                            </span>
                            <button
                              onClick={() => settleExpense(expense.id)}
                              className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full"
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
                const paidBy = members.find((m) => m.id === sub.paidBy)
                const nextBilling = new Date(sub.nextBillingDate)
                const daysUntil = Math.ceil((nextBilling.getTime() - Date.now()) / 86400000)

                return (
                  <motion.div
                    key={sub.id}
                    variants={item}
                    className="bg-card rounded-3xl border border-border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{sub.emoji ?? '📱'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm text-foreground">{sub.name}</p>
                          <p className="font-bold text-foreground">${sub.amount.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground capitalize">{sub.frequency}</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className={cn(
                            'text-xs font-medium',
                            daysUntil <= 3 ? 'text-amber-600' : 'text-muted-foreground',
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

              <div className="mt-2 p-4 rounded-3xl bg-muted/50 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Total per month</p>
                <p className="font-bold text-foreground">${monthlyTotal.toFixed(2)}</p>
              </div>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="text-center py-16">
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="text-5xl mb-4"
      >
        {icon}
      </motion.div>
      <p className="font-semibold text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    </div>
  )
}

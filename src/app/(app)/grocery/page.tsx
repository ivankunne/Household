'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, CheckCircle2, Circle, Trash2, ShoppingCart, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useGroceryStore } from '@/shared/store/groceryStore'
import { useHouseholdStore } from '@/shared/store/householdStore'
import { groceryCategoryEmojis } from '@/design-system/tokens'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { GroceryItem } from '@/domains/grocery/types'

const CATEGORY_ORDER = [
  'produce', 'dairy', 'meat', 'bakery', 'beverages',
  'pantry', 'frozen', 'snacks', 'cleaning', 'personal_care', 'pet', 'other',
]

function GroceryItemRow({ item, onCheck, onDelete, large = false }: {
  item: GroceryItem
  onCheck: (id: string) => void
  onDelete: (id: string) => void
  large?: boolean
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: item.isChecked ? 0.45 : 1 }}
      exit={{ opacity: 0, height: 0 }}
      className={cn('flex items-center gap-3 group', large ? 'py-4' : 'py-3')}
    >
      <button onClick={() => onCheck(item.id)} className="shrink-0 active:scale-90 transition-transform">
        {item.isChecked
          ? <CheckCircle2 className={cn('text-primary', large ? 'w-6 h-6' : 'w-5 h-5')} />
          : <Circle className={cn('text-border group-hover:text-primary transition-colors', large ? 'w-6 h-6' : 'w-5 h-5')} />
        }
      </button>

      <span className={cn('shrink-0', large ? 'text-2xl' : 'text-lg')}>{item.emoji ?? groceryCategoryEmojis[item.category] ?? '📦'}</span>

      <div className="flex-1 min-w-0">
        <p className={cn('font-medium', item.isChecked && 'line-through text-muted-foreground', large ? 'text-base' : 'text-sm')}>
          {item.name}
        </p>
        {item.quantity > 1 && (
          <p className="text-xs text-muted-foreground">{item.quantity} {item.unit}</p>
        )}
      </div>

      {item.isRunningLow && !item.isChecked && (
        <span className="text-[10px] font-medium text-hb-yellow-fg bg-hb-yellow/20 px-2 py-0.5 rounded-full">
          Low
        </span>
      )}

      {!large && (
        <button
          onClick={() => onDelete(item.id)}
          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </motion.div>
  )
}

export default function GroceryPage() {
  const [addOpen, setAddOpen]     = useState(false)
  const [newItem, setNewItem]     = useState('')
  const [shopping, setShopping]   = useState(false)

  const {
    items, checkItem, uncheckItem, deleteItem, clearChecked,
    addItem, setSearch, getFiltered, searchQuery,
  } = useGroceryStore()
  const { household, getCurrentMember } = useHouseholdStore()

  if (!household) return null

  const filtered = getFiltered()
  const householdItems = items.filter((i) => i.householdId === household.id)
  const byCategory = filtered.reduce<Record<string, GroceryItem[]>>((acc, item) => {
    if (item.householdId !== household.id) return acc
    const cat = item.category ?? 'other'
    acc[cat] = acc[cat] ?? []
    acc[cat].push(item)
    return acc
  }, {})

  const checkedCount  = householdItems.filter((i) => i.isChecked).length
  const totalCount    = householdItems.length
  const pct           = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0
  const orderedCategories = CATEGORY_ORDER.filter((c) => byCategory[c]?.length > 0)
  const uncheckedItems = householdItems.filter((i) => !i.isChecked)
  const shoppingList   = householdItems.filter((i) => !i.isChecked || i.isChecked)

  const handleCheck = async (id: string) => {
    const item = items.find((i) => i.id === id)
    if (!item) return
    const member = getCurrentMember()
    if (!member) return
    item.isChecked ? await uncheckItem(id) : await checkItem(id, member.id, household.id)
  }

  const handleAdd = async () => {
    if (!newItem.trim()) return
    const member = getCurrentMember()
    if (!member) return
    await addItem(newItem.trim(), {}, household.id, member.id)
    setNewItem('')
    setAddOpen(false)
    toast.success(`Added ${newItem} 🛒`)
  }

  /* ── Shopping mode ──────────────────────────────────────── */
  if (shopping) {
    const sortedItems = [...householdItems].sort((a, b) => {
      if (a.isChecked === b.isChecked) return 0
      return a.isChecked ? 1 : -1
    })

    return (
      <div className="max-w-xl mx-auto px-4">
        <div className="pt-7 pb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.12em] mb-1">
              Shopping mode
            </p>
            <h1 className="text-[1.75rem] font-semibold tracking-tight text-foreground leading-none">
              {checkedCount} of {totalCount}
            </h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => setShopping(false)}
            className="flex items-center gap-2 bg-card border border-border text-foreground px-4 py-2.5 rounded-md text-sm font-medium"
          >
            <X className="w-4 h-4" />
            Done shopping
          </motion.button>
        </div>

        {/* Progress bar */}
        <div className="mb-5 h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-primary rounded-full"
          />
        </div>

        {sortedItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🎉</p>
            <p className="font-medium text-foreground">All done!</p>
            <p className="text-sm text-muted-foreground mt-1">Your cart is full.</p>
          </div>
        ) : (
          <div className="bg-card rounded-lg border border-border px-4 divide-y divide-border/50">
            <AnimatePresence>
              {sortedItems.map((item) => (
                <GroceryItemRow
                  key={item.id}
                  item={item}
                  onCheck={handleCheck}
                  onDelete={deleteItem}
                  large
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    )
  }

  /* ── Normal mode ────────────────────────────────────────── */
  return (
    <div className="max-w-xl mx-auto px-4">
      {/* Header */}
      <div className="pt-7 pb-5 flex items-end justify-between">
        <div>
          <h1 className="text-[1.75rem] font-semibold tracking-tight text-foreground leading-none">Grocery</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {checkedCount} of {totalCount} items
          </p>
        </div>
        <div className="flex gap-2">
          {totalCount > 0 && (
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => setShopping(true)}
              className="flex items-center gap-1.5 bg-card border border-border text-foreground px-3 py-2.5 rounded-md text-sm font-medium"
            >
              <ShoppingCart className="w-4 h-4" />
              Shop
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add item
          </motion.button>
        </div>
      </div>

      {/* Progress strip */}
      {totalCount > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">{pct}% done</span>
            {checkedCount > 0 && (
              <button
                onClick={() => clearChecked(household.id).then(() => toast.success('Cleared!'))}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Clear {checkedCount} checked
              </button>
            )}
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-primary rounded-full"
            />
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search items…"
          value={searchQuery}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-md h-11"
        />
      </div>

      {/* Items */}
      {orderedCategories.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🛒</p>
          <p className="font-medium text-foreground">Your list is empty</p>
          <p className="text-sm text-muted-foreground mt-1">Add the first item to get started.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {orderedCategories.map((cat) => {
            const catItems  = byCategory[cat]
            const unchecked = catItems.filter((i) => !i.isChecked)
            const checked   = catItems.filter((i) => i.isChecked)

            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{groceryCategoryEmojis[cat] ?? '📦'}</span>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground capitalize">
                    {cat.replace('_', ' ')}
                  </p>
                  <span className="text-xs text-muted-foreground/60 ml-auto">{catItems.length}</span>
                </div>
                <div className="bg-card rounded-lg border border-border px-4 divide-y divide-border/50">
                  <AnimatePresence>
                    {[...unchecked, ...checked].map((item) => (
                      <GroceryItemRow
                        key={item.id}
                        item={item}
                        onCheck={handleCheck}
                        onDelete={deleteItem}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="rounded-xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Add to grocery list</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <Input
              autoFocus
              placeholder="e.g. Oat milk, eggs…"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="rounded-md h-11 text-base"
            />
            <button
              onClick={handleAdd}
              disabled={!newItem.trim()}
              className="w-full py-2.5 rounded-md bg-primary text-primary-foreground font-medium text-sm disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add to list
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, CheckCircle2, Circle, Trash2 } from 'lucide-react'
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

function GroceryItemRow({ item, onCheck, onDelete }: {
  item: GroceryItem
  onCheck: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: item.isChecked ? 0.45 : 1 }}
      exit={{ opacity: 0, height: 0 }}
      className="flex items-center gap-3 py-3 group"
    >
      <button onClick={() => onCheck(item.id)} className="shrink-0 active:scale-90 transition-transform">
        {item.isChecked
          ? <CheckCircle2 className="w-5 h-5 text-primary" />
          : <Circle className="w-5 h-5 text-border group-hover:text-primary transition-colors" />
        }
      </button>

      <span className="text-lg shrink-0">{item.emoji ?? groceryCategoryEmojis[item.category] ?? '📦'}</span>

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', item.isChecked && 'line-through text-muted-foreground')}>
          {item.name}
        </p>
        {item.quantity > 1 && (
          <p className="text-xs text-muted-foreground">{item.quantity} {item.unit}</p>
        )}
      </div>

      {item.isRunningLow && !item.isChecked && (
        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
          Low
        </span>
      )}

      <button
        onClick={() => onDelete(item.id)}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}

export default function GroceryPage() {
  const [addOpen, setAddOpen] = useState(false)
  const [newItem, setNewItem] = useState('')
  const {
    items, checkItem, uncheckItem, deleteItem, clearChecked,
    addItem, setSearch, getFiltered, searchQuery,
  } = useGroceryStore()
  const { household, getCurrentMember } = useHouseholdStore()

  if (!household) return null

  const filtered = getFiltered()
  const byCategory = filtered.reduce<Record<string, GroceryItem[]>>((acc, item) => {
    if (item.householdId !== household.id) return acc
    const cat = item.category ?? 'other'
    acc[cat] = acc[cat] ?? []
    acc[cat].push(item)
    return acc
  }, {})

  const checkedCount = items.filter((i) => i.householdId === household.id && i.isChecked).length
  const totalCount = items.filter((i) => i.householdId === household.id).length
  const pct = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0
  const orderedCategories = CATEGORY_ORDER.filter((c) => byCategory[c]?.length > 0)

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

  return (
    <div className="max-w-xl mx-auto px-4">
      {/* Header */}
      <div className="pt-7 pb-5 flex items-end justify-between">
        <div>
          <h1 className="text-[2rem] font-black tracking-tight text-foreground leading-none">Grocery</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {checkedCount} of {totalCount} items got
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-primary/25"
        >
          <Plus className="w-4 h-4" />
          Add item
        </motion.button>
      </div>

      {/* Progress strip */}
      {totalCount > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">{pct}% done</span>
            {checkedCount > 0 && (
              <button
                onClick={() => clearChecked(household.id).then(() => toast.success('Cleared!'))}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Clear {checkedCount} checked
              </button>
            )}
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
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
          className="pl-10 rounded-xl h-11"
        />
      </div>

      {/* Items */}
      {orderedCategories.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🛒</p>
          <p className="font-bold text-foreground">Your list is empty</p>
          <p className="text-sm text-muted-foreground mt-1">Add the first item!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {orderedCategories.map((cat) => {
            const catItems = byCategory[cat]
            const unchecked = catItems.filter((i) => !i.isChecked)
            const checked = catItems.filter((i) => i.isChecked)

            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{groceryCategoryEmojis[cat] ?? '📦'}</span>
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground capitalize">
                    {cat.replace('_', ' ')}
                  </p>
                  <span className="text-xs text-muted-foreground/60 ml-auto">{catItems.length}</span>
                </div>
                <div className="bg-card rounded-2xl px-4 divide-y divide-border/50">
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
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">🛒 Add to grocery</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <Input
              autoFocus
              placeholder="e.g. Oat milk, eggs…"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="rounded-xl h-11 text-base"
            />
            <button
              onClick={handleAdd}
              disabled={!newItem.trim()}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add to list
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

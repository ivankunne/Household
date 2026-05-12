'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, CheckCircle2, Circle, Trash2, ScanLine } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
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

function GroceryItemRow({
  item,
  onCheck,
  onDelete,
}: {
  item: GroceryItem
  onCheck: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: item.isChecked ? 0.5 : 1, x: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className={cn(
        'flex items-center gap-3 py-3 px-1 group',
        item.isChecked && 'opacity-50',
      )}
    >
      <button
        onClick={() => onCheck(item.id)}
        className="shrink-0 transition-transform active:scale-90"
      >
        {item.isChecked ? (
          <CheckCircle2 className="w-5 h-5 text-primary" />
        ) : (
          <Circle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        )}
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
        <Badge variant="secondary" className="text-xs bg-amber-50 text-amber-600 border-amber-200">
          Low
        </Badge>
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
    addItem, setSearch, getFiltered, getByCategory, searchQuery,
  } = useGroceryStore()
  const { household, getCurrentMember } = useHouseholdStore()

  if (!household) return null

  const filtered = getFiltered()
  const byCategory = filtered.reduce<Record<string, GroceryItem[]>>((acc, item) => {
    if (item.householdId !== household.id) return acc
    const cat = item.category ?? 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  const checkedCount = items.filter((i) => i.householdId === household.id && i.isChecked).length
  const totalCount = items.filter((i) => i.householdId === household.id).length
  const lowCount = items.filter((i) => i.householdId === household.id && i.isRunningLow && !i.isChecked).length

  const handleCheck = async (id: string) => {
    const item = items.find((i) => i.id === id)
    if (!item) return
    const member = getCurrentMember()
    if (!member) return
    if (item.isChecked) {
      await uncheckItem(id)
    } else {
      await checkItem(id, member.id, household.id)
    }
  }

  const handleAdd = async () => {
    if (!newItem.trim()) return
    const member = getCurrentMember()
    if (!member) return
    await addItem(newItem.trim(), {}, household.id, member.id)
    setNewItem('')
    setAddOpen(false)
    toast.success(`Added ${newItem} to the list! 🛒`)
  }

  const handleClearChecked = async () => {
    await clearChecked(household.id)
    toast.success('Cleared checked items ✨')
  }

  const orderedCategories = CATEGORY_ORDER.filter((c) => byCategory[c]?.length > 0)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Grocery List</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {checkedCount} / {totalCount} got
            {lowCount > 0 && ` · ${lowCount} running low`}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl text-sm font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add
        </motion.button>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="mb-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(checkedCount / totalCount) * 100}%` }}
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
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-2xl"
        />
      </div>

      {/* Actions */}
      {checkedCount > 0 && (
        <div className="flex justify-end mb-3">
          <button
            onClick={handleClearChecked}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Clear {checkedCount} checked items
          </button>
        </div>
      )}

      {/* Items by category */}
      {orderedCategories.length === 0 ? (
        <div className="text-center py-16">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl mb-4"
          >
            🛒
          </motion.div>
          <p className="font-semibold text-foreground">Your list is empty</p>
          <p className="text-sm text-muted-foreground mt-1">Add the first item!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orderedCategories.map((cat) => {
            const catItems = byCategory[cat]
            const unchecked = catItems.filter((i) => !i.isChecked)
            const checked = catItems.filter((i) => i.isChecked)

            return (
              <div key={cat} className="bg-card rounded-3xl border border-border overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                  <span>{groceryCategoryEmojis[cat] ?? '📦'}</span>
                  <span className="text-sm font-semibold capitalize text-foreground">{cat.replace('_', ' ')}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{catItems.length}</span>
                </div>
                <div className="px-4 divide-y divide-border/50">
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

      {/* Voice input placeholder */}
      <div className="mt-6 p-4 rounded-3xl bg-muted/50 border border-dashed border-border flex items-center gap-3">
        <ScanLine className="w-5 h-5 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">Voice input coming soon</p>
          <p className="text-xs text-muted-foreground">Say &quot;add milk and eggs&quot; to add items</p>
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle>🛒 Add to grocery list</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              autoFocus
              placeholder="e.g. Oat milk, eggs..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="rounded-2xl"
            />
            <Button onClick={handleAdd} disabled={!newItem.trim()} className="w-full rounded-2xl">
              <Plus className="w-4 h-4 mr-2" /> Add to list
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Plus, ShoppingCart, CheckSquare } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useTaskStore } from '@/shared/store/taskStore'
import { useGroceryStore } from '@/shared/store/groceryStore'
import { useHouseholdStore } from '@/shared/store/householdStore'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

type QuickAction = 'task' | 'grocery' | null

export function QuickActions() {
  const [open, setOpen] = useState<QuickAction>(null)
  const [input, setInput] = useState('')
  const { addTask } = useTaskStore()
  const { addItem } = useGroceryStore()
  const { household, getCurrentMember } = useHouseholdStore()

  const handleSubmit = async () => {
    if (!input.trim() || !household) return
    const member = getCurrentMember()
    if (!member) return

    if (open === 'task') {
      await addTask({ title: input.trim() }, household.id, member.id)
      toast.success('Task added!')
    } else if (open === 'grocery') {
      await addItem(input.trim(), {}, household.id, member.id)
      toast.success('Added to grocery list!')
    }

    setInput('')
    setOpen(null)
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setOpen('task')}
          className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/25 font-semibold text-sm transition-shadow hover:shadow-lg hover:shadow-primary/30"
        >
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <CheckSquare className="w-4 h-4" />
          </div>
          <span>Add task</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setOpen('grocery')}
          className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-card text-foreground shadow-sm border border-border font-semibold text-sm transition-all hover:shadow-md"
        >
          <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0">
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
          </div>
          <span>Add grocery</span>
        </motion.button>
      </div>

      <Dialog open={open !== null} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="rounded-3xl max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {open === 'task' ? '📋 New task' : '🛒 Add to grocery'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <Input
              autoFocus
              placeholder={open === 'task' ? 'e.g. Clean the bathroom' : 'e.g. Oat milk'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="rounded-xl h-11 text-base"
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-40 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              {open === 'task' ? 'Add task' : 'Add to list'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, ShoppingCart, CheckSquare, Wallet } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useTaskStore } from '@/shared/store/taskStore'
import { useGroceryStore } from '@/shared/store/groceryStore'
import { useHouseholdStore } from '@/shared/store/householdStore'
import { toast } from 'sonner'

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
      toast.success('Task added! ✅')
    } else if (open === 'grocery') {
      await addItem(input.trim(), {}, household.id, member.id)
      toast.success('Added to grocery list! 🛒')
    }

    setInput('')
    setOpen(null)
  }

  const actions = [
    { id: 'task' as const, icon: CheckSquare, label: 'Add task', color: 'bg-primary/10 text-primary' },
    { id: 'grocery' as const, icon: ShoppingCart, label: 'Add grocery', color: 'bg-amber-50 text-amber-600' },
  ]

  return (
    <>
      <div className="flex items-center gap-2">
        {actions.map((action, i) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setOpen(action.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all active:scale-95 ${action.color}`}
          >
            <action.icon className="w-4 h-4" />
            {action.label}
          </motion.button>
        ))}
      </div>

      <Dialog open={open !== null} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="rounded-3xl max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>
              {open === 'task' ? '📋 Add a task' : '🛒 Add to grocery list'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              autoFocus
              placeholder={open === 'task' ? 'e.g. Clean the bathroom' : 'e.g. Oat milk'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="rounded-2xl"
            />
            <Button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="w-full rounded-2xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

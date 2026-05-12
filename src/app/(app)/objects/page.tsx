'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useObjectStore } from '@/shared/store/objectStore'
import { useHouseholdStore } from '@/shared/store/householdStore'
import { format, parseISO, isAfter, isBefore } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { HouseholdObjectType } from '@/domains/household-object/types'

const TYPE_EMOJIS: Record<string, string> = {
  appliance:            '🏠',
  vehicle:              '🚗',
  pet:                  '🐾',
  electronics:          '💻',
  furniture:            '🪑',
  tool:                 '🔧',
  subscription_service: '📱',
  other:                '📦',
}

const TYPE_OPTIONS: { value: HouseholdObjectType; label: string }[] = [
  { value: 'appliance',            label: 'Appliance' },
  { value: 'electronics',          label: 'Electronics' },
  { value: 'vehicle',              label: 'Vehicle' },
  { value: 'furniture',            label: 'Furniture' },
  { value: 'tool',                 label: 'Tool' },
  { value: 'pet',                  label: 'Pet' },
  { value: 'subscription_service', label: 'Subscription' },
  { value: 'other',                label: 'Other' },
]

const container = { show: { transition: { staggerChildren: 0.06 } } }
const itemAnim  = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }

export default function ObjectsPage() {
  const [addOpen, setAddOpen]   = useState(false)
  const [name, setName]         = useState('')
  const [type, setType]         = useState<HouseholdObjectType>('other')
  const [brand, setBrand]       = useState('')
  const [model, setModel]       = useState('')
  const [location, setLocation] = useState('')

  const { objects, loadObjects, addObject } = useObjectStore()
  const { household }                       = useHouseholdStore()

  useEffect(() => {
    if (household) loadObjects(household.id)
  }, [household?.id])

  if (!household) return null

  const active = objects.filter((o) => o.isActive)
  const soon   = new Date(Date.now() + 30 * 86400000)

  const byType = active.reduce<Record<string, typeof objects>>((acc, obj) => {
    if (!acc[obj.type]) acc[obj.type] = []
    acc[obj.type].push(obj)
    return acc
  }, {})

  const openAdd = () => {
    setName('')
    setType('other')
    setBrand('')
    setModel('')
    setLocation('')
    setAddOpen(true)
  }

  const handleAdd = async () => {
    if (!name.trim()) return
    await addObject({
      householdId:       household.id,
      name:              name.trim(),
      type,
      brand:             brand.trim() || undefined,
      model:             model.trim() || undefined,
      location:          location.trim() || undefined,
      tags:              [],
      documentIds:       [],
      maintenanceTaskIds:[],
      expenseIds:        [],
      isActive:          true,
    })
    setAddOpen(false)
    toast.success(`${name} added`)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[1.75rem] font-semibold tracking-tight text-foreground leading-none">Objects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {active.length} items tracked
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add object
        </motion.button>
      </div>

      {active.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">📦</p>
          <p className="font-medium text-foreground">No objects tracked yet</p>
          <p className="text-sm text-muted-foreground mt-1">Add your appliances, vehicles, and more</p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
          {Object.entries(byType).map(([type, objs]) => (
            <div key={type}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{TYPE_EMOJIS[type] ?? '📦'}</span>
                <h2 className="font-medium capitalize text-foreground">{type.replace('_', ' ')}</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {objs.map((obj) => {
                  const warrantyExpiring = obj.warrantyExpiresAt &&
                    isBefore(parseISO(obj.warrantyExpiresAt), soon) &&
                    isAfter(parseISO(obj.warrantyExpiresAt), new Date())

                  const warrantyExpired = obj.warrantyExpiresAt &&
                    isBefore(parseISO(obj.warrantyExpiresAt), new Date())

                  return (
                    <motion.div
                      key={obj.id}
                      variants={itemAnim}
                      className="bg-card rounded-xl border border-border p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl shrink-0">
                          {obj.emoji ?? TYPE_EMOJIS[obj.type] ?? '📦'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground">{obj.name}</p>
                          {(obj.brand || obj.model) && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {[obj.brand, obj.model].filter(Boolean).join(' · ')}
                            </p>
                          )}
                          <div className="mt-2 space-y-1">
                            {obj.warrantyExpiresAt && (
                              <div className={cn(
                                'flex items-center gap-1.5 text-xs',
                                warrantyExpired ? 'text-muted-foreground line-through' :
                                warrantyExpiring ? 'text-hb-yellow-fg' : 'text-muted-foreground',
                              )}>
                                <AlertCircle className="w-3 h-3 shrink-0" />
                                Warranty {warrantyExpired ? 'expired' : 'expires'}{' '}
                                {format(parseISO(obj.warrantyExpiresAt), 'MMM yyyy')}
                                {warrantyExpiring && ' ⚠️'}
                              </div>
                            )}
                            {obj.location && (
                              <p className="text-xs text-muted-foreground">{obj.location}</p>
                            )}
                            {obj.notes && (
                              <p className="text-xs text-muted-foreground line-clamp-2">{obj.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Add Object dialog */}
      <Dialog open={addOpen} onOpenChange={(v) => !v && setAddOpen(false)}>
        <DialogContent className="rounded-xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">New object</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <Input
              autoFocus
              placeholder="Name (e.g. Washing machine)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="rounded-md h-11 text-base"
            />

            {/* Type */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Type</p>
              <div className="grid grid-cols-4 gap-1.5">
                {TYPE_OPTIONS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setType(t.value)}
                    className={cn(
                      'py-1.5 px-2 rounded-md text-xs font-medium transition-colors text-center',
                      type === t.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-surface-2 text-muted-foreground hover:text-foreground border border-border-soft',
                    )}
                  >
                    {TYPE_EMOJIS[t.value]} {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Brand (optional)"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="rounded-md h-10 text-sm"
              />
              <Input
                placeholder="Model (optional)"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="rounded-md h-10 text-sm"
              />
            </div>

            <Input
              placeholder="Location (e.g. Kitchen)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="rounded-md h-10 text-sm"
            />

            <button
              onClick={handleAdd}
              disabled={!name.trim()}
              className="w-full py-2.5 rounded-md bg-primary text-primary-foreground font-medium text-sm disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add object
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, AlertCircle, Calendar } from 'lucide-react'
import { useObjectStore } from '@/shared/store/objectStore'
import { useHouseholdStore } from '@/shared/store/householdStore'
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns'
import { cn } from '@/lib/utils'

const TYPE_EMOJIS: Record<string, string> = {
  appliance: '🏠',
  vehicle: '🚗',
  pet: '🐾',
  electronics: '💻',
  furniture: '🪑',
  tool: '🔧',
  subscription_service: '📱',
  other: '📦',
}

const container = { show: { transition: { staggerChildren: 0.06 } } }
const itemAnim = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }

export default function ObjectsPage() {
  const { objects, loadObjects } = useObjectStore()
  const { household } = useHouseholdStore()

  useEffect(() => {
    if (household) loadObjects(household.id)
  }, [household?.id])

  if (!household) return null

  const active = objects.filter((o) => o.isActive)
  const soon = new Date(Date.now() + 30 * 86400000)

  const byType = active.reduce<Record<string, typeof objects>>((acc, obj) => {
    if (!acc[obj.type]) acc[obj.type] = []
    acc[obj.type].push(obj)
    return acc
  }, {})

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Household Objects</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {active.length} items tracked
        </p>
      </div>

      {active.length === 0 ? (
        <div className="text-center py-16">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="text-5xl mb-4"
          >
            📦
          </motion.div>
          <p className="font-semibold text-foreground">No objects tracked yet</p>
          <p className="text-sm text-muted-foreground mt-1">Add your appliances, vehicles, and pets</p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
          {Object.entries(byType).map(([type, objs]) => (
            <div key={type}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{TYPE_EMOJIS[type] ?? '📦'}</span>
                <h2 className="font-semibold capitalize text-foreground">{type.replace('_', ' ')}</h2>
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
                      className="bg-card rounded-3xl border border-border p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center text-xl shrink-0">
                          {obj.emoji ?? TYPE_EMOJIS[obj.type] ?? '📦'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground">{obj.name}</p>
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
                                warrantyExpiring ? 'text-amber-600' : 'text-muted-foreground',
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
    </div>
  )
}

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { useHouseholdStore } from '@/shared/store/householdStore'
import { Bell, Heart, Users, Palette, Database, Shield, Check, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const container = { show: { transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }

function EditableField({ label, value, onSave }: { label: string; value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(value)

  const commit = () => {
    if (draft.trim() && draft.trim() !== value) onSave(draft.trim())
    setEditing(false)
  }

  return (
    <div className="flex justify-between items-center gap-3">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      {editing ? (
        <div className="flex items-center gap-1.5">
          <Input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
            className="h-7 text-sm rounded-md px-2 w-40"
          />
          <button onClick={commit} className="text-primary hover:text-primary/80 transition-colors">
            <Check className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => { setDraft(value); setEditing(true) }}
          className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors group"
        >
          {value}
          <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
        </button>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const { household, members, getCurrentMember, setCurrentMember, updateHousehold } = useHouseholdStore()
  const currentMember = getCurrentMember()

  if (!household) return null

  const saveHouseholdName = (v: string) => {
    updateHousehold({ name: v })
    toast.success('Household name updated')
  }

  const saveMascotName = (v: string) => {
    updateHousehold({ settings: { ...household.settings, mascotName: v } })
    toast.success('Mascot name updated')
  }

  const saveCurrency = (v: string) => {
    updateHousehold({ currency: v.toUpperCase().slice(0, 3) })
    toast.success('Currency updated')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-[1.75rem] font-semibold tracking-tight text-foreground leading-none">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your household and preferences</p>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        {/* Profile */}
        {currentMember && (
          <motion.div variants={item} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-lg flex items-center justify-center text-2xl font-semibold"
                style={{ backgroundColor: currentMember.color + '30', color: currentMember.color }}
              >
                {currentMember.emoji}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-lg">{currentMember.name}</p>
                <Badge variant="secondary" className="text-xs capitalize mt-1">{currentMember.role}</Badge>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Tasks done',     value: currentMember.stats.tasksCompleted },
                { label: 'Current streak', value: `${currentMember.stats.currentStreak}d` },
                { label: 'Points',         value: currentMember.stats.points },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-xl font-semibold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Household */}
        <motion.div variants={item} className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary" />
            </div>
            <p className="font-semibold text-foreground">Household</p>
          </div>
          <div className="space-y-3">
            <EditableField
              label="Name"
              value={`${household.emoji} ${household.name}`}
              onSave={(v) => saveHouseholdName(v.replace(/^\S+\s*/, '') || v)}
            />
            <EditableField label="Mascot name" value={household.settings.mascotName} onSave={saveMascotName} />
            <EditableField label="Currency"    value={household.currency}             onSave={saveCurrency} />
          </div>
        </motion.div>

        {/* Members */}
        <motion.div variants={item} className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-ring/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-hb-blue-fg" />
            </div>
            <p className="font-semibold text-foreground">Members ({members.length})</p>
          </div>
          <div className="space-y-3">
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => { setCurrentMember(m.id); toast.success(`Switched to ${m.name}`) }}
                className={cn(
                  'w-full flex items-center gap-3 rounded-lg p-2 -mx-2 transition-colors text-left',
                  currentMember?.id === m.id ? 'bg-primary/8' : 'hover:bg-muted/40',
                )}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: m.color + '20' }}
                >
                  {m.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{m.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{m.role}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium text-hb-yellow-fg">🔥 {m.stats.currentStreak}d</p>
                  <p className="text-xs text-muted-foreground">{m.stats.points} pts</p>
                </div>
                {currentMember?.id === m.id && (
                  <Check className="w-4 h-4 text-primary shrink-0" />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* App settings sections */}
        {[
          { icon: Bell,     label: 'Notifications', bg: 'bg-hb-yellow/15',   fg: 'text-hb-yellow-fg', desc: 'Reminders and alerts' },
          { icon: Palette,  label: 'Appearance',    bg: 'bg-ring/10',        fg: 'text-hb-blue-fg',   desc: 'Themes and colors' },
          { icon: Database, label: 'Data & Storage', bg: 'bg-primary/10',   fg: 'text-hb-green-fg',  desc: 'Export and manage data' },
          { icon: Shield,   label: 'Privacy',       bg: 'bg-muted',          fg: 'text-muted-foreground', desc: 'Your data stays local' },
        ].map((s) => (
          <motion.div
            key={s.label}
            variants={item}
            className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.bg}`}>
              <s.icon className={`w-4 h-4 ${s.fg}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </div>
            <span className="text-muted-foreground text-sm">›</span>
          </motion.div>
        ))}

        <motion.div variants={item} className="text-center py-4">
          <p className="text-xs text-muted-foreground">Homebase · Household OS v0.1</p>
          <p className="text-xs text-muted-foreground mt-1">Local-first · Your data, your home 🏡</p>
        </motion.div>
      </motion.div>
    </div>
  )
}

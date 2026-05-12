'use client'

import { motion } from 'framer-motion'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useHouseholdStore } from '@/shared/store/householdStore'
import { Bell, Heart, Users, Palette, Database, Shield } from 'lucide-react'

const container = { show: { transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }

export default function SettingsPage() {
  const { household, members, getCurrentMember } = useHouseholdStore()
  const currentMember = getCurrentMember()

  if (!household) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your household and preferences</p>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        {/* Profile */}
        {currentMember && (
          <motion.div variants={item} className="bg-card rounded-3xl border border-border p-5">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold"
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
                { label: 'Tasks done', value: currentMember.stats.tasksCompleted },
                { label: 'Current streak', value: `${currentMember.stats.currentStreak}d` },
                { label: 'Points', value: currentMember.stats.points },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Household */}
        <motion.div variants={item} className="bg-card rounded-3xl border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary" />
            </div>
            <p className="font-semibold text-foreground">Household</p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="text-sm font-medium">{household.emoji} {household.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Mascot name</span>
              <span className="text-sm font-medium">{household.settings.mascotName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Currency</span>
              <span className="text-sm font-medium">{household.currency}</span>
            </div>
          </div>
        </motion.div>

        {/* Members */}
        <motion.div variants={item} className="bg-card rounded-3xl border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className="font-semibold text-foreground">Members ({members.length})</p>
          </div>
          <div className="space-y-3">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: m.color + '20' }}
                >
                  {m.emoji}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{m.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{m.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-amber-500">🔥 {m.stats.currentStreak}d</p>
                  <p className="text-xs text-muted-foreground">{m.stats.points} pts</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* App settings sections */}
        {[
          { icon: Bell, label: 'Notifications', color: 'bg-amber-50 text-amber-600', desc: 'Reminders and alerts' },
          { icon: Palette, label: 'Appearance', color: 'bg-purple-50 text-purple-600', desc: 'Themes and colors' },
          { icon: Database, label: 'Data & Storage', color: 'bg-green-50 text-green-600', desc: 'Export and manage data' },
          { icon: Shield, label: 'Privacy', color: 'bg-slate-50 text-slate-600', desc: 'Your data stays local' },
        ].map((s) => (
          <motion.div
            key={s.label}
            variants={item}
            className="bg-card rounded-3xl border border-border p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </div>
            <span className="text-muted-foreground text-sm">›</span>
          </motion.div>
        ))}

        <motion.div variants={item} className="text-center py-4">
          <p className="text-xs text-muted-foreground">Hearth · Household OS v0.1</p>
          <p className="text-xs text-muted-foreground mt-1">Local-first · Your data, your home 🏡</p>
        </motion.div>
      </motion.div>
    </div>
  )
}

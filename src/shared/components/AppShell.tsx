'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Home, CheckSquare, ShoppingCart, Wallet, Package, Clock, Settings, ChevronDown,
} from 'lucide-react'
import { MascotBubble } from '@/features/dashboard/components/MascotBubble'
import { MascotCharacter } from '@/features/mascot/MascotCharacter'
import { useActivityStore } from '@/shared/store/activityStore'
import { useHouseholdStore } from '@/shared/store/householdStore'
import type { MascotMood } from '@/mascot/types'

const navItems = [
  { href: '/today',    icon: Home,         label: 'Today' },
  { href: '/chores',   icon: CheckSquare,  label: 'Chores' },
  { href: '/grocery',  icon: ShoppingCart, label: 'Grocery' },
  { href: '/expenses', icon: Wallet,       label: 'Expenses' },
  { href: '/objects',  icon: Package,      label: 'Objects' },
  { href: '/timeline', icon: Clock,        label: 'Timeline' },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { mascotMessages } = useActivityStore()
  const { members, getCurrentMember, setCurrentMember } = useHouseholdStore()
  const [memberPickerOpen, setMemberPickerOpen] = useState(false)

  const latestMood = mascotMessages.find((m) => !m.isRead)?.mood as MascotMood | undefined
  const currentMember = getCurrentMember()

  return (
    <div className="flex h-svh overflow-hidden bg-background">

      {/* ── Sidebar — desktop ───────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-sidebar border-r border-sidebar-border">

        {/* Logo + mascot */}
        <div className="px-5 py-5 flex items-center gap-3">
          <MascotCharacter mood={latestMood ?? 'happy'} size={36} />
          <div>
            <p className="font-semibold text-sm text-sidebar-foreground tracking-tight">Homebase</p>
            <p className="text-[11px] text-sidebar-foreground/40">Household OS</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  active
                    ? 'bg-sidebar-foreground/15 text-sidebar-foreground shadow-sm'
                    : 'text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                )}>
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Member switcher */}
        <div className="px-3 pb-2 relative">
          <button
            onClick={() => setMemberPickerOpen((v) => !v)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent transition-colors"
          >
            {currentMember ? (
              <>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0"
                  style={{ backgroundColor: currentMember.color + '30' }}
                >
                  {currentMember.emoji}
                </div>
                <p className="flex-1 text-sm text-sidebar-foreground/80 text-left truncate">{currentMember.name}</p>
              </>
            ) : (
              <>
                <div className="w-7 h-7 rounded-full bg-sidebar-accent flex items-center justify-center text-sm shrink-0">?</div>
                <p className="flex-1 text-sm text-sidebar-foreground/50 text-left">Who are you?</p>
              </>
            )}
            <ChevronDown className={cn('w-3.5 h-3.5 text-sidebar-foreground/40 transition-transform', memberPickerOpen && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {memberPickerOpen && members.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
                className="absolute bottom-full left-3 right-3 mb-1 bg-sidebar-accent border border-sidebar-border rounded-lg overflow-hidden shadow-lg"
              >
                {members.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setCurrentMember(m.id); setMemberPickerOpen(false) }}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-sidebar/50',
                      m.id === currentMember?.id && 'bg-sidebar/30',
                    )}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0"
                      style={{ backgroundColor: m.color + '30' }}
                    >
                      {m.emoji}
                    </div>
                    <span className="text-sidebar-foreground/80">{m.name}</span>
                    {m.id === currentMember?.id && (
                      <span className="ml-auto text-xs text-primary">✓</span>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-3 pb-5 pt-1 border-t border-sidebar-border">
          <Link href="/settings">
            <div className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
              pathname === '/settings'
                ? 'bg-sidebar-foreground/15 text-sidebar-foreground shadow-sm'
                : 'text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            )}>
              <Settings className="w-4 h-4" />
              Settings
            </div>
          </Link>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-28 md:pb-8">
          {children}
        </div>
      </main>

      {/* ── Bottom nav — mobile (floating pill) ─────────────────── */}
      <nav className="md:hidden fixed bottom-3 left-3 right-3 z-50">
        <div className="bg-card/95 backdrop-blur-xl rounded-xl shadow-lg border border-border/60">
          <div className="flex items-stretch px-1 py-1.5 gap-0.5">
            {[...navItems, { href: '/settings', icon: Settings, label: 'Settings' }].slice(0, 6).map((item) => {
              const active = pathname.startsWith(item.href)
              return (
                <Link key={item.href} href={item.href} className="flex-1 min-w-0">
                  <motion.div
                    className={cn(
                      'flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-colors',
                      active ? 'bg-primary' : 'hover:bg-muted',
                    )}
                    whileTap={{ scale: 0.93 }}
                    transition={{ duration: 0.15 }}
                  >
                    <item.icon className={cn('w-[18px] h-[18px]', active ? 'text-primary-foreground' : 'text-muted-foreground')} />
                    <span className={cn('text-[9px] font-medium leading-none', active ? 'text-primary-foreground' : 'text-muted-foreground')}>
                      {item.label}
                    </span>
                  </motion.div>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Mascot bubble */}
      <MascotBubble />
    </div>
  )
}

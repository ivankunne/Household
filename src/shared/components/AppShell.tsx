'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Home, CheckSquare, ShoppingCart, Wallet, Package, Clock, Settings,
} from 'lucide-react'
import { MascotBubble } from '@/features/dashboard/components/MascotBubble'
import { MascotCharacter } from '@/features/mascot/MascotCharacter'
import { useActivityStore } from '@/shared/store/activityStore'
import type { MascotMood } from '@/mascot/types'

const navItems = [
  { href: '/today', icon: Home, label: 'Today' },
  { href: '/chores', icon: CheckSquare, label: 'Chores' },
  { href: '/grocery', icon: ShoppingCart, label: 'Grocery' },
  { href: '/expenses', icon: Wallet, label: 'Expenses' },
  { href: '/objects', icon: Package, label: 'Objects' },
  { href: '/timeline', icon: Clock, label: 'Timeline' },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { mascotMessages } = useActivityStore()

  const latestMood = mascotMessages.find((m) => !m.isRead)?.mood as MascotMood | undefined

  return (
    <div className="flex h-svh overflow-hidden bg-background">

      {/* ── Sidebar — desktop ───────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-sidebar">

        {/* Logo + mascot */}
        <div className="px-5 py-5 flex items-center gap-3">
          <MascotCharacter mood={latestMood ?? 'happy'} size={36} />
          <div>
            <p className="font-bold text-sm text-sidebar-foreground tracking-tight">Hearth</p>
            <p className="text-[11px] text-sidebar-foreground/40">Household OS</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                      : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="px-3 pb-5 pt-2 border-t border-sidebar-border">
          <Link href="/settings">
            <div className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              pathname === '/settings'
                ? 'bg-primary text-primary-foreground'
                : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
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
        <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/[0.14] border border-border/60">
          <div className="flex items-stretch px-1 py-1.5 gap-0.5">
            {[...navItems, { href: '/settings', icon: Settings, label: 'Settings' }].slice(0, 6).map((item) => {
              const active = pathname.startsWith(item.href)
              return (
                <Link key={item.href} href={item.href} className="flex-1 min-w-0">
                  <motion.div
                    className={cn(
                      'flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-colors',
                      active ? 'bg-primary' : 'hover:bg-muted',
                    )}
                    whileTap={{ scale: 0.92 }}
                  >
                    <item.icon
                      className={cn(
                        'w-[18px] h-[18px]',
                        active ? 'text-primary-foreground' : 'text-muted-foreground',
                      )}
                    />
                    <span
                      className={cn(
                        'text-[9px] font-semibold leading-none',
                        active ? 'text-primary-foreground' : 'text-muted-foreground',
                      )}
                    >
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

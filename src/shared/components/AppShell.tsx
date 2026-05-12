'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Home, CheckSquare, ShoppingCart, Wallet, Package, Clock, Settings,
} from 'lucide-react'
import { MascotBubble } from '@/features/dashboard/components/MascotBubble'

const navItems = [
  { href: '/today', icon: Home, label: 'Today' },
  { href: '/chores', icon: CheckSquare, label: 'Chores' },
  { href: '/grocery', icon: ShoppingCart, label: 'Grocery' },
  { href: '/expenses', icon: Wallet, label: 'Expenses' },
  { href: '/objects', icon: Package, label: 'Home' },
  { href: '/timeline', icon: Clock, label: 'Timeline' },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-svh overflow-hidden bg-background">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-sidebar shrink-0">
        <div className="px-6 py-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-primary flex items-center justify-center text-lg shadow-sm">
              🏡
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">Hearth</p>
              <p className="text-xs text-muted-foreground">Your Household OS</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                  {active && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground/60"
                    />
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="px-3 pb-4 border-t border-border pt-4">
          <Link href="/settings">
            <div className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              pathname === '/settings'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}>
              <Settings className="w-4 h-4" />
              Settings
            </div>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-20 md:pb-6">
          {children}
        </div>
      </main>

      {/* Bottom nav — mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border">
        <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <div className="flex flex-col items-center gap-0.5 py-1">
                  <div className={cn(
                    'p-2 rounded-xl transition-all',
                    active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground',
                  )}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className={cn(
                    'text-[10px] font-medium',
                    active ? 'text-primary' : 'text-muted-foreground',
                  )}>
                    {item.label}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Mascot floating bubble */}
      <MascotBubble />
    </div>
  )
}

'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  FileText,
  Settings,
  HelpCircle,
  Zap,
  ChevronLeft,
  Activity,
  PlusCircle,
  ClipboardList,
  Gauge,
  Users,
  ScrollText,
  Leaf,
  Briefcase,
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  highlight?: boolean
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: 'Assessment',
    items: [
      { name: 'Dashboard', href: '/', icon: Home },
      { name: 'New Assessment', href: '/assessments/new', icon: PlusCircle, highlight: true },
      { name: 'Assessments', href: '/assessments', icon: ClipboardList },
      { name: 'Reports', href: '/reports', icon: FileText },
    ],
  },
  {
    title: 'Analysis Tools',
    items: [
      { name: 'TRL Assessment', href: '/trl-assessment', icon: Gauge },
      { name: 'Competitor Intel', href: '/competitive-intelligence', icon: Users },
      { name: 'Patent Analysis', href: '/patent-intelligence', icon: ScrollText },
    ],
  },
  {
    title: 'Climate',
    items: [
      { name: 'Climate Diligence', href: '/climate-diligence', icon: Leaf },
    ],
  },
  {
    title: 'Investor Portal',
    items: [
      { name: 'Portal Dashboard', href: '/investor-portal', icon: Briefcase },
    ],
  },
]

const secondaryNavItems: NavItem[] = [
  { name: 'Activity Logs', href: '/admin/logs', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle },
]

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)

  // Close mobile menu when navigating
  React.useEffect(() => {
    if (mobileOpen) {
      onMobileClose?.()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Check if path is active (exact match or starts with for nested routes)
  const isPathActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => onMobileClose?.()}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-background-surface border-r border-border transition-all duration-300',
          collapsed ? 'w-20' : 'w-72',
          // Mobile: slide from left
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-base font-semibold text-foreground">
                  Clean Energy
                </span>
                <span className="text-xs text-foreground-muted">
                  TEA Platform
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'p-1.5 rounded-lg hover:bg-background-elevated text-foreground-muted hover:text-foreground transition-colors',
              collapsed && 'mx-auto'
            )}
          >
            <ChevronLeft
              className={cn(
                'w-5 h-5 transition-transform duration-300',
                collapsed && 'rotate-180'
              )}
            />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {navSections.map((section, sectionIndex) => (
            <div key={section.title}>
              {/* Section Title */}
              {!collapsed && (
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  {section.title}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = isPathActive(item.href)
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : item.highlight
                            ? 'text-primary hover:bg-primary/5 border border-primary/20'
                            : 'text-foreground hover:bg-background-hover'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-5 h-5 shrink-0',
                          isActive || item.highlight
                            ? 'text-primary'
                            : 'text-foreground'
                        )}
                      />
                      {!collapsed && (
                        <span className="flex-1 text-sm font-medium">
                          {item.name}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
              {/* Section Divider */}
              {sectionIndex < navSections.length - 1 && (
                <div className="my-3 border-t border-border/50" />
              )}
            </div>
          ))}

          {/* Divider before secondary */}
          <div className="my-4 border-t border-border" />

          {/* Secondary Navigation */}
          <div className="space-y-1">
            {secondaryNavItems.map((item) => {
              const isActive = isPathActive(item.href)
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-background-hover'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 shrink-0',
                      isActive
                        ? 'text-primary'
                        : 'text-foreground'
                    )}
                  />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.name}</span>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          {!collapsed ? (
            <div className="px-3 py-2 flex items-center justify-between">
              <p className="text-xs text-foreground-subtle">
                AI-Powered
              </p>
              <span className="text-xs text-muted-foreground/60 font-mono">
                v1.0.0
              </span>
            </div>
          ) : (
            <div className="flex justify-center">
              <span className="text-xs text-muted-foreground/60 font-mono">
                v1.0
              </span>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

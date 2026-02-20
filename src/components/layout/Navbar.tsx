'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/dashboard', label: '홈' },
  { href: '/record', label: '수면 기록' },
  { href: '/analytics', label: '분석' },
  { href: '/coaching', label: 'AI 코칭' },
  { href: '/settings', label: '설정' },
]

export default function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const tabIcons: Record<string, string> = {
    '/dashboard': '🏠',
    '/record': '📝',
    '/analytics': '📊',
    '/coaching': '🤖',
    '/settings': '⚙️',
  }

  return (
    <>
      <header className="border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-bold text-lg">
            SleepingPlan
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  pathname.startsWith(item.href)
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:block">
            {session?.user?.name}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ redirect: true, callbackUrl: '/login' })}
          >
            로그아웃
          </Button>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background flex">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] transition-colors ${
              pathname.startsWith(item.href)
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            <span className="text-lg leading-none">{tabIcons[item.href]}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}

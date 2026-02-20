'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { NAV_ITEMS } from '@/lib/constants'

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside className="hidden lg:flex flex-col w-60 border-r bg-background sticky top-0 h-screen shrink-0">
      {/* 로고 */}
      <div className="px-6 py-5 border-b">
        <Link href="/dashboard" className="font-bold text-lg flex items-center gap-2">
          🌙 SleepingPlan
        </Link>
      </div>

      {/* 사용자 정보 */}
      <div className="px-4 py-4 border-b">
        <p className="text-sm font-medium truncate">{session?.user?.name}</p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{session?.user?.email}</p>
      </div>

      {/* 내비게이션 */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              pathname.startsWith(item.href)
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <span className="text-base leading-none">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* 로그아웃 */}
      <div className="px-3 py-4 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={() => signOut({ redirect: true, callbackUrl: '/login' })}
        >
          로그아웃
        </Button>
      </div>
    </aside>
  )
}

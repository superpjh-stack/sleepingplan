'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function MobileHeader() {
  const { data: session } = useSession()

  return (
    <header className="lg:hidden border-b px-4 py-3 flex items-center justify-between bg-background">
      <Link href="/dashboard" className="font-bold text-lg flex items-center gap-2">
        🌙 SleepingPlan
      </Link>
      <div className="flex items-center gap-2">
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
  )
}

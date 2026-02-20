'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS } from '@/lib/constants'

export default function BottomTabBar() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background flex">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] transition-colors ${
            pathname.startsWith(item.href)
              ? 'text-primary'
              : 'text-muted-foreground'
          }`}
        >
          <span className="text-lg leading-none">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}

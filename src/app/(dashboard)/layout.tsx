'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import MobileHeader from '@/components/layout/MobileHeader'
import BottomTabBar from '@/components/layout/BottomTabBar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login')
  }, [status, router])

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">로딩 중...</p>
    </div>
  )
  if (status === 'unauthenticated') return null

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <MobileHeader />
        <main className="flex-1 p-4 md:p-6 pb-20 lg:pb-6 overflow-y-auto">
          {children}
        </main>
        <BottomTabBar />
      </div>
    </div>
  )
}

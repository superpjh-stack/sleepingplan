'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const isLoading = status === 'loading'
  const isInitialized = status !== 'loading'
  const user = session?.user ?? null

  const logout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  return { user, isLoading, isInitialized, logout }
}

export function useRequireAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const isInitialized = status !== 'loading'
  const user = session?.user ?? null

  useEffect(() => {
    if (isInitialized && !user) {
      router.replace('/login')
    }
  }, [user, isInitialized, router])

  return { user, isInitialized }
}

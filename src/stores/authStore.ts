'use client'
import { create } from 'zustand'
import { signIn, signOut } from 'next-auth/react'

interface AuthStore {
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  isLoading: false,
  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) throw new Error(result.error)
    } finally {
      set({ isLoading: false })
    }
  },
  logout: async () => {
    await signOut({ redirect: true, callbackUrl: '/login' })
  },
  register: async (email, password, name) => {
    set({ isLoading: true })
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message ?? '회원가입에 실패했습니다')
      }
    } finally {
      set({ isLoading: false })
    }
  },
}))

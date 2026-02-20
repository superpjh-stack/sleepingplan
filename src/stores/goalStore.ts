'use client'

import { create } from 'zustand'
import type { SleepGoal, SleepGoalInput } from '@/types/sleep'

interface GoalStore {
  goal: SleepGoal | null
  isLoading: boolean
  fetchGoal: () => Promise<void>
  upsertGoal: (data: SleepGoalInput) => Promise<void>
}

export const useGoalStore = create<GoalStore>((set) => ({
  goal: null,
  isLoading: false,

  fetchGoal: async () => {
    set({ isLoading: true })
    try {
      const res = await fetch('/api/goals')
      if (!res.ok) throw new Error('fetch error')
      const data: SleepGoal | null = await res.json()
      set({ goal: data ?? null, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  upsertGoal: async (data) => {
    const res = await fetch('/api/goals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error ?? '수면 목표 저장에 실패했습니다')
    }
    const updated: SleepGoal = await res.json()
    set({ goal: updated })
  },
}))

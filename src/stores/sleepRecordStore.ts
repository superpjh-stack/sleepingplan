'use client'

import { create } from 'zustand'
import type { SleepRecord, CreateSleepRecordInput, UpdateSleepRecordInput } from '@/types/sleep'

interface SleepRecordStore {
  records: SleepRecord[]
  selectedMonth: string   // "YYYY-MM"
  isLoading: boolean
  error: string | null

  fetchRecords: (month: string) => Promise<void>
  addRecord: (data: CreateSleepRecordInput) => Promise<void>
  editRecord: (id: string, data: UpdateSleepRecordInput) => Promise<void>
  removeRecord: (id: string) => Promise<void>
  setSelectedMonth: (month: string) => void
  getRecordByDate: (date: string) => SleepRecord | undefined
}

export const useSleepRecordStore = create<SleepRecordStore>((set, get) => ({
  records: [],
  selectedMonth: new Date().toISOString().slice(0, 7),
  isLoading: false,
  error: null,

  fetchRecords: async (month) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/sleep-records?month=${month}`)
      if (!res.ok) throw new Error('fetch error')
      const data: SleepRecord[] = await res.json()
      set({ records: data ?? [], selectedMonth: month, isLoading: false })
    } catch {
      set({ error: '기록을 불러오지 못했습니다', isLoading: false })
    }
  },

  addRecord: async (data) => {
    const res = await fetch('/api/sleep-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error ?? '수면 기록 추가에 실패했습니다')
    }
    const record: SleepRecord = await res.json()
    set((s) => ({ records: [record, ...s.records] }))
  },

  editRecord: async (id, data) => {
    const res = await fetch(`/api/sleep-records/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error ?? '수면 기록 수정에 실패했습니다')
    }
    const updated: SleepRecord = await res.json()
    set((s) => ({
      records: s.records.map((r) => (r.id === id ? updated : r)),
    }))
  },

  removeRecord: async (id) => {
    const res = await fetch(`/api/sleep-records/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error ?? '수면 기록 삭제에 실패했습니다')
    }
    set((s) => ({ records: s.records.filter((r) => r.id !== id) }))
  },

  setSelectedMonth: (month) => {
    set({ selectedMonth: month })
  },

  getRecordByDate: (date) => {
    return get().records.find((r) => r.date === date)
  },
}))

'use client'

import { useEffect } from 'react'
import { useSleepRecordStore } from '@/stores/sleepRecordStore'

export function useSleepRecord(month?: string) {
  const store = useSleepRecordStore()

  useEffect(() => {
    const target = month ?? store.selectedMonth
    store.fetchRecords(target)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month])

  return store
}

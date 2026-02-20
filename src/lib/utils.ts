import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calcDurationMinutes(bedTime: string, wakeTime: string): number {
  const [bH, bM] = bedTime.split(':').map(Number)
  const [wH, wM] = wakeTime.split(':').map(Number)
  let bedMinutes = bH * 60 + bM
  let wakeMinutes = wH * 60 + wM
  if (wakeMinutes <= bedMinutes) wakeMinutes += 24 * 60 // 자정 넘김
  return wakeMinutes - bedMinutes
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`
}

export function getTodayString(): string {
  return new Date().toISOString().slice(0, 10)
}

export function getDateNDaysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

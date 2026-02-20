export interface SleepRecord {
  id: string
  userId: string
  date: string            // "YYYY-MM-DD"
  bedTime: string         // "HH:MM"
  wakeTime: string        // "HH:MM"
  durationMinutes: number
  qualityScore: number    // 1-10
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface SleepGoal {
  id: string
  userId: string
  targetBedTime: string        // "HH:MM"
  targetWakeTime: string       // "HH:MM"
  targetDurationMinutes: number
  createdAt: string
  updatedAt: string
}

export interface NotificationSetting {
  id: string
  userId: string
  bedtimeEnabled: boolean
  bedtimeTime: string     // "HH:MM"
  wakeEnabled: boolean
  wakeTime: string        // "HH:MM"
  createdAt: string
  updatedAt: string
}

export type CreateSleepRecordInput = Pick<
  SleepRecord,
  'date' | 'bedTime' | 'wakeTime' | 'durationMinutes' | 'qualityScore'
> & { notes?: string }

export type UpdateSleepRecordInput = Partial<CreateSleepRecordInput>

export type SleepGoalInput = Pick<
  SleepGoal,
  'targetBedTime' | 'targetWakeTime' | 'targetDurationMinutes'
>

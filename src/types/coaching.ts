export interface CoachingCache {
  id: string
  userId: string
  message: string
  generatedAt: string     // ISO 8601
  dataRangeFrom: string   // "YYYY-MM-DD"
  dataRangeTo: string     // "YYYY-MM-DD"
  createdAt: string
  updatedAt: string
}

export interface CoachingResponse {
  message: string
  generatedAt: string
  dataRangeFrom: string
  dataRangeTo: string
  fromCache: boolean
}

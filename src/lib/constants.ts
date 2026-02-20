export const MIN_QUALITY_SCORE = 1
export const MAX_QUALITY_SCORE = 10
export const MAX_NOTES_LENGTH = 500
export const MIN_COACHING_DAYS = 7
export const COACHING_DATA_RANGE_DAYS = 14
export const COACHING_CACHE_HOURS = 24

export const NAV_ITEMS = [
  { href: '/dashboard', label: '홈', icon: '🏠' },
  { href: '/record', label: '수면 기록', icon: '📝' },
  { href: '/analytics', label: '분석', icon: '📊' },
  { href: '/coaching', label: 'AI 코칭', icon: '🤖' },
  { href: '/settings', label: '설정', icon: '⚙️' },
] as const

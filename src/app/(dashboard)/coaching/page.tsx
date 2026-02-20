import CoachingCard from '@/features/coaching/components/CoachingCard'
import CoachingHistory from '@/features/coaching/components/CoachingHistory'

export default function CoachingPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI 수면 코칭</h1>
        <p className="text-sm text-muted-foreground mt-1">
          최근 14일간 수면 데이터를 분석한 맞춤 코칭입니다. 하루 1회 생성됩니다.
        </p>
      </div>

      <CoachingCard />
      <CoachingHistory />
    </div>
  )
}

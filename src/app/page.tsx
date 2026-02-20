import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-lg">SleepingPlan</span>
        <Link
          href="/login"
          className="text-sm font-medium hover:text-primary transition-colors"
        >
          로그인
        </Link>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-10 sm:py-16">
        <p className="text-5xl mb-6">🌙</p>
        <h1 className="text-2xl sm:text-4xl font-bold mb-4">더 나은 수면을 위한 첫걸음</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-md">
          수면을 기록하고, AI 코칭으로 수면 습관을 개선하세요.
        </p>
        <Link
          href="/signup"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          지금 시작하기 →
        </Link>
      </section>

      {/* Feature Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-8 pb-16 max-w-4xl mx-auto w-full">
        <div className="rounded-xl border p-6 text-center">
          <p className="text-3xl mb-3">📝</p>
          <h3 className="font-semibold mb-2">수면 기록</h3>
          <p className="text-sm text-muted-foreground">
            취침·기상 시간과 수면 질을 간편하게 기록하세요
          </p>
        </div>
        <div className="rounded-xl border p-6 text-center">
          <p className="text-3xl mb-3">📊</p>
          <h3 className="font-semibold mb-2">분석 차트</h3>
          <p className="text-sm text-muted-foreground">
            주간·월간 수면 패턴을 시각적으로 확인하세요
          </p>
        </div>
        <div className="rounded-xl border p-6 text-center">
          <p className="text-3xl mb-3">🤖</p>
          <h3 className="font-semibold mb-2">AI 코칭</h3>
          <p className="text-sm text-muted-foreground">
            Claude AI가 수면 데이터를 분석해 맞춤 조언을 제공합니다
          </p>
        </div>
      </section>
    </main>
  )
}

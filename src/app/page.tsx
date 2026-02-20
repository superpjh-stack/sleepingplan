import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-lg flex items-center gap-2">
          🌙 SleepingPlan
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
          >
            시작하기
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 sm:py-24 min-h-[60vh]">
        <p className="text-6xl mb-6">🌙</p>
        <h1 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight">
          더 나은 수면을 위한<br className="hidden sm:block" /> 첫걸음
        </h1>
        <p className="text-lg text-muted-foreground mb-10 max-w-md">
          수면을 기록하고, AI 코칭으로 수면 습관을 개선하세요.
          웨어러블 기기 없이, 오직 자기 기입으로.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/signup"
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-base"
          >
            무료로 시작하기 →
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 border rounded-lg hover:bg-muted transition-colors font-medium text-base text-muted-foreground hover:text-foreground"
          >
            로그인
          </Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="px-4 md:px-8 pb-20 max-w-5xl mx-auto w-full">
        <h2 className="text-xl font-bold text-center mb-8 text-muted-foreground">
          SleepingPlan으로 할 수 있는 것
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border p-6 text-center hover:shadow-md transition-shadow">
            <p className="text-4xl mb-4">📝</p>
            <h3 className="font-semibold mb-2">수면 기록</h3>
            <p className="text-sm text-muted-foreground">
              취침·기상 시간과 수면 질을 간편하게 기록하세요. 달력 또는 리스트로 한눈에 확인.
            </p>
          </div>
          <div className="rounded-xl border p-6 text-center hover:shadow-md transition-shadow">
            <p className="text-4xl mb-4">📊</p>
            <h3 className="font-semibold mb-2">분석 차트</h3>
            <p className="text-sm text-muted-foreground">
              주간·월간 수면 패턴을 시각적으로 확인하세요. 평균 수면 시간과 질 트렌드 분석.
            </p>
          </div>
          <div className="rounded-xl border p-6 text-center hover:shadow-md transition-shadow">
            <p className="text-4xl mb-4">🤖</p>
            <h3 className="font-semibold mb-2">AI 코칭</h3>
            <p className="text-sm text-muted-foreground">
              Claude AI가 수면 데이터를 분석해 맞춤 조언을 제공합니다. 하루 1회 업데이트.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 px-6 text-center text-xs text-muted-foreground">
        © 2026 SleepingPlan. 더 나은 수면을 위한 서비스.
      </footer>
    </main>
  )
}

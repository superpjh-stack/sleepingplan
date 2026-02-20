import GoalSettings from '@/features/notifications/components/GoalSettings'
import NotificationSettings from '@/features/notifications/components/NotificationSettings'

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">설정</h1>
        <p className="text-sm text-muted-foreground mt-1">
          수면 목표 및 알림을 설정하세요
        </p>
      </div>
      <GoalSettings />
      <NotificationSettings />
    </div>
  )
}

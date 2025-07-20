import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotificationsSettingsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications Settings</h1>
          <p className="text-muted-foreground">Configure how you receive notifications.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Manage your email and in-app notification settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content for notification settings will go here.</p>
        </CardContent>
      </Card>
    </div>
  )
}

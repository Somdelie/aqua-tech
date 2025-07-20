import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function GeneralSettingsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">General Settings</h1>
          <p className="text-muted-foreground">Manage your general application settings.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Application Preferences</CardTitle>
          <CardDescription>Configure basic settings for your application.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content for general settings will go here.</p>
        </CardContent>
      </Card>
    </div>
  )
}

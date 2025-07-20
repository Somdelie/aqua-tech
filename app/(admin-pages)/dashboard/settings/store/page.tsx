import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function StoreInfoPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Store Information</h1>
          <p className="text-muted-foreground">Update your store's contact and location details.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Store Details</CardTitle>
          <CardDescription>Manage your store's name, address, and contact information.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content for store information will go here.</p>
        </CardContent>
      </Card>
    </div>
  )
}

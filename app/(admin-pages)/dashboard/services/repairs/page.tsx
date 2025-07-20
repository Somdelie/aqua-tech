import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function RepairServicesPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Repair Services Management</h1>
          <p className="text-muted-foreground">Manage the types of repair services offered.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Service List</CardTitle>
          <CardDescription>Add, edit, or remove repair service categories.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content for repair services management will go here.</p>
        </CardContent>
      </Card>
    </div>
  )
}

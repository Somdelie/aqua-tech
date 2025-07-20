"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UserEditForm } from './user-edit-form';


interface User {
  id: string
  email: string
  name: string
  firstName: string
  lastName: string
  role: "USER" | "ADMIN"
}

interface UsersRolesClientProps {
  users: User[]
}

export default function UsersRolesClient({ users: initialUsers }: UsersRolesClientProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>(initialUsers) // State to manage users in client component

  // Re-fetch users or update state after an edit to reflect changes
  // For simplicity, we'll rely on revalidatePath in the action,
  // but in a more complex app, you might refetch here or update state directly.
  const handleEditSuccess = () => {
    setIsEditDialogOpen(false)
    // The revalidatePath in the server action will cause the parent Server Component to re-render
    // and pass updated data, effectively refreshing this client component.
  }

  const handleEditClick = (user: User) => {
    setSelectedUser(user)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users & Roles</h1>
          <p className="text-muted-foreground">Manage user accounts and their roles within the system.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>A list of all registered users.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(user)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedUser && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Make changes to {selectedUser.name}'s profile here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <UserEditForm user={selectedUser} onSuccess={handleEditSuccess} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

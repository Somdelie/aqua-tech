import { getAllUsers } from '@/actions/users-action';
import UsersRolesClient from '@/components/dashboard/settings/users-roles-client';


export default async function UsersRolesPage() {
  const users = await getAllUsers() // Data fetching happens in the Server Component

  return <UsersRolesClient users={users} /> // Pass data to the Client Component
}

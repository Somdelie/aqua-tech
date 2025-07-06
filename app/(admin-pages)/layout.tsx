import type React from "react"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { DynamicBreadcrumb } from "@/components/dashboard/DynamicBreadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/")
  }

  const user = session?.user
  const isAdmin = user?.role === "ADMIN"

  // Redirect non-admin users to unauthorized page or home
  if (!isAdmin) {
    redirect("/not-found?reason=unknown-page")
  }

  const navUser = {
    name: user?.name || "User",
    email: user?.email || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    role: user?.role || "USER",
  }

  return (
    <SidebarProvider>
      <AppSidebar user={navUser} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <DynamicBreadcrumb />
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-gray-50 px-4 overflow-x-hidden w-full">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}

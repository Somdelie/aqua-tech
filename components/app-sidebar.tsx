"use client"

import type * as React from "react"

import {
  BarChart3,
  Building2,
  Laptop,
  Package,
  Settings2,
  ShoppingCart,
  Smartphone,
  Users,
  Wrench,
  ClipboardList,
  TrendingUp,
  MapPin,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"

// Aquatech Computer Repairs data
const data = {
  user: {
    name: "Admin User",
    email: "admin@aquatech.co.za",
    avatar: "/aqua-logo.png",
  },
  teams: [
    {
      name: "Main Store",
      logo: Building2,
      plan: "Primary Location",
    },
    {
      name: "Mobile Service",
      logo: MapPin,
      plan: "On-site Repairs",
    },
    {
      name: "Online Store",
      logo: ShoppingCart,
      plan: "E-commerce",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/dashboard",
        },
        {
          title: "Reports",
          url: "/dashboard/reports",
        },
      ],
    },
    {
      title: "Orders",
      url: "/dashboard/orders",
      icon: ClipboardList,
      items: [
        {
          title: "All Orders",
          url: "/dashboard/orders",
        },
        {
          title: "Pending",
          url: "/dashboard/orders/pending",
        },
        {
          title: "Processing",
          url: "/dashboard/orders/processing",
        },
        {
          title: "Completed",
          url: "/dashboard/orders/completed",
        },
      ],
    },
    {
      title: "Products",
      url: "/dashboard/products",
      icon: Package,
      items: [
        {
          title: "All Products",
          url: "/dashboard/products",
        },
        {
          title: "Categories",
          url: "/dashboard/categories",
        },
        {
          title: "Brands",
          url: "/dashboard/brands",
        },
      ],
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "/dashboard/settings",
        },
        {
          title: "Store Info",
          url: "/dashboard/settings/store",
        },
        {
          title: "Users & Roles",
          url: "/dashboard/settings/users",
        },
        {
          title: "Notifications",
          url: "/dashboard/settings/notifications",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Repair Services",
      url: "/dashboard/services/repairs",
      icon: Wrench,
    },
  ],
}

export function AppSidebar({user, ...props }: React.ComponentProps<typeof Sidebar>&{
  user: {
    name: string
    email: string
    avatar?: string
  }
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

"use client"

import type React from "react"

import { QueryProvider } from "./query-client-provider"
// import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryProvider>
        {children}
        <Toaster position="top-right" />
      </QueryProvider>
    // </ThemeProvider>
  )
}

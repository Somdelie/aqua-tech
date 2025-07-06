"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home, LogOut } from "lucide-react"
import Link from "next/link"
import { signOut } from "@/lib/auth-client"

export default function UnauthorizedPage() {
  const searchParams = useSearchParams()
  const reason = searchParams.get("reason")

  const getErrorMessage = () => {
    switch (reason) {
      case "admin-required":
        return "This area requires administrator privileges."
      case "insufficient-permissions":
        return "You don't have sufficient permissions to access this resource."
      default:
        return "You don't have permission to access this page."
    }
  }

  const handleSignOut = async () => {
    await signOut()
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">{getErrorMessage()}</p>

          <div className="space-y-2">
            <Button asChild className="w-full" variant="default">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go to Home
              </Link>
            </Button>

            <Button onClick={handleSignOut} variant="outline" className="w-full bg-transparent">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

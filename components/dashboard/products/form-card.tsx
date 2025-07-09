"use client"

import React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface FormCardProps {
  title: string
  children: React.ReactNode
  onSubmit: () => Promise<string | void>
  buttonText: string
}

export function FormCard({ title, children, onSubmit, buttonText }: FormCardProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      await onSubmit()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {buttonText}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

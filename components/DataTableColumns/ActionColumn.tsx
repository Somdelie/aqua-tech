"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

type ModelType = "user" | "category" | "role" | "product"

type ActionColumnProps = {
  row: any
  model: ModelType
  id?: string
  roles?: string[] // Optional roles for user model
  onRefetch?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export function ActionColumn({ row, model, id, onRefetch, onEdit, onDelete }: ActionColumnProps) {
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const data = row

  const displayName = model === "category" ? data.title : model === "product" ? data.name : data.name

  const handleDelete = async () => {
    if (onDelete) {
      onDelete()
      return
    }

    // Fallback to original delete logic for other models
    setIsDeleting(true)
    if (!id) {
      toast.error("Invalid ID provided for deletion")
      setIsDeleting(false)
      return
    }

    try {
      // Original delete logic for other models
      setDeleteDialogOpen(false)
      setIsDeleting(false)
      if (onRefetch) onRefetch()
    } catch (error) {
      toast.error(`Failed to delete ${model}`)
      console.error(`Delete ${model} error:`, error)
      setIsDeleting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit {model === "category" ? "Category" : model === "product" ? "Product" : "User"}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="focus:bg-destructive focus:text-destructive-foreground">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete {model === "category" ? "Category" : model === "product" ? "Product" : "User"}
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{`Delete ${model === "category" ? "Category" : model === "product" ? "Product" : "User"}`}</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {displayName}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                {`Delete ${model === "category" ? "Category" : model === "product" ? "Product" : "User"}`}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

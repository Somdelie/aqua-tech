"use client"
import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import * as XLSX from "xlsx"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { DataTable, TableActions, EntityForm, ConfirmationDialog } from "@/components/ui/data-table"
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { createCategoryColumns } from "./columns"
import { createCategory } from "@/actions/categories-action"
import { ImageInput } from "../../forms/ImageInput"

// Category interface based on Prisma schema
interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  parentId: string | null
  parent: { id: string; name: string } | null
  children: Array<{ id: string; name: string }>
  _count: { products: number }
  createdAt: Date
  updatedAt: Date
}

interface CategoriesListingProps {
  categories: Category[]
}

// Category form schema
const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
})

type CategoryFormData = z.infer<typeof categoryFormSchema>

export default function CategoriesListing({ categories }: CategoriesListingProps) {
  const [categoriesData, setCategoriesData] = useState<Category[]>(categories)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [imageUrl, setImageUrl] = useState("")
  const router = useRouter()

  useEffect(() => {
    setCategoriesData(categories)
  }, [categories])

  // Form setup
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
      image: "",
      parentId: "none",
    },
  })

  // Form reset effect
  useEffect(() => {
    if (currentCategory) {
      form.reset({
        name: currentCategory.name,
        description: currentCategory.description || "",
        image: currentCategory.image || "",
        parentId: currentCategory.parentId || "none",
      })
      setImageUrl(currentCategory.image || "")
    } else {
      form.reset()
      setImageUrl("")
    }
  }, [currentCategory, form])

  const resetFormAndCloseModal = useCallback(() => {
    setCurrentCategory(null)
    setFormDialogOpen(false)
    setImageUrl("")
    form.reset()
  }, [form])

  const handleCategoryClick = (category: Category) => {
    router.push(`/dashboard/categories/${category.slug}`)
  }

  const handleImageChange = (url: string) => {
    setImageUrl(url)
    form.setValue("image", url)
  }

  const handleNameChange = (name: string) => {
    form.setValue("name", name)
  }

  // Export to Excel
  const handleExport = async (filteredCategories: Category[]) => {
    try {
      const exportData = filteredCategories.map((category) => ({
        Name: category.name,
        Slug: category.slug,
        Description: category.description || "",
        Parent: category.parent?.name || "None",
        "Product Count": category._count.products,
        "Date Created": format(new Date(category.createdAt), "MMM dd, yyyy"),
      }))

      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Categories")
      const fileName = `Categories_${format(new Date(), "yyyy-MM-dd")}.xlsx`
      XLSX.writeFile(workbook, fileName)

      toast.success("Export successful", {
        description: `Categories exported to ${fileName}`,
      })
    } catch (error) {
      toast.error("Export failed", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      })
    }
  }

  // Event handlers
  const handleAddClick = () => {
    setCurrentCategory(null)
    setFormDialogOpen(true)
  }

  const handleEditClick = (category: Category) => {
    setCurrentCategory(category)
    setFormDialogOpen(true)
  }

  const handleDeleteClick = (category: Category) => {
    setCurrentCategory(category)
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (categoryToDelete?.id) {
      try {
        // Add your delete mutation here
        setDeleteDialogOpen(false)
        toast.success("Category deleted successfully")
      } catch (error) {
        console.error("Error deleting category:", error)
        toast.error("Failed to delete category")
      }
    }
  }

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true)
    try {
      if (!currentCategory) {
        const res = await createCategory(data)
        if (res?.status === 201) {
          resetFormAndCloseModal()
          if (res.data) {
            setCategoriesData((prev) => [...prev, res.data])
          }
          toast.success("Category created successfully")
        } else if (res?.error) {
          toast.error("Error", { description: res.error })
        }
      } else {
        // Update existing category logic here
        toast.success("Category updated successfully")
      }
      resetFormAndCloseModal()
    } catch (error) {
      console.error(error)
      const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again."
      toast.error("Error", { description: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate total categories count
  const getTotalProductsCount = (categories: Category[]) => {
    return categories.reduce((total, category) => total + category._count.products, 0)
  }

  // Define columns for the data table
  const columns = createCategoryColumns(handleEditClick, handleDeleteClick)

  // Generate subtitle with total count
  const getSubtitle = (categoryCount: number, totalProducts: number) => {
    return `${categoryCount} ${categoryCount === 1 ? "category" : "categories"} | ${totalProducts} total products`
  }

  // Get parent categories for the select dropdown
  const getParentCategories = () => {
    return categoriesData.filter((cat) => !cat.parentId && (!currentCategory || cat.id !== currentCategory.id))
  }

  return (
    <div>
      <DataTable<Category>
        title="Categories"
        buttonTitle="Category"
        emptyStateModalTitle="Your Categories List is Empty"
        emptyStateModalDescription="Create your first category to organize your products."
        subtitle={
          categoriesData?.length > 0
            ? getSubtitle(categoriesData.length, getTotalProductsCount(categoriesData))
            : undefined
        }
        data={categoriesData}
        columns={columns}
        keyField="id"
        isLoading={false}
        onRefresh={() => window.location.reload()}
        onRowClick={handleCategoryClick}
        actions={{
          onAdd: handleAddClick,
          onExport: handleExport,
        }}
        filters={{
          searchFields: ["name", "description"],
          enableDateFilter: true,
          getItemDate: (item) => {
            const date = item.createdAt
            if (typeof date === "string") {
              return new Date(date)
            }
            return date instanceof Date ? date : new Date()
          },
        }}
        renderRowActions={(category) => (
          <div onClick={(e) => e.stopPropagation()}>
            <TableActions.RowActions
              onEdit={() => handleEditClick(category)}
              onDelete={() => handleDeleteClick(category)}
            />
          </div>
        )}
      />

      {/* Category Form Dialog */}
      <EntityForm
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        title={currentCategory ? "Edit Category" : "Add New Category"}
        form={form}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        submitLabel={currentCategory ? "Save Changes" : "Add Category"}
        size="lg"
      >
        <div className="col-span-1 md:col-span-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter category name"
                    {...field}
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-1 md:col-span-2">
          <FormField
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Category (Optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || "none"}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select parent category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="none">None (Top Level)</SelectItem>
                      {getParentCategories().map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormDescription>Choose a parent category to create a subcategory</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Category Image</label>
          <div className="flex flex-col space-y-3 px-4 items-center w-full border-2 border-dashed border-orange-300 rounded-lg p-4">
            {imageUrl && (
              <div className="relative group w-full flex justify-center items-center">
                <img
                  src={imageUrl || "/placeholder.svg"}
                  alt="Category image"
                  className="w-24 h-24 object-cover rounded-md border shadow-sm"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.jpg"
                  }}
                />
              </div>
            )}
            <ImageInput title="" imageUrl={imageUrl} setImageUrl={handleImageChange} endpoint="categoryImage" />
            <p className="text-xs text-muted-foreground text-center">
              Upload a high quality image for your category. JPG, PNG, and WebP formats supported (max 1MB).
            </p>
          </div>
        </div>
      </EntityForm>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Category"
        description={
          categoryToDelete ? (
            <>
              Are you sure you want to delete <strong className="text-primary">{categoryToDelete.name}</strong>?
              <br />
              {categoryToDelete._count.products > 0 && (
                <span className="text-red-600">
                  This category has {categoryToDelete._count.products} products. Please reassign them first.
                </span>
              )}
              {categoryToDelete.children.length > 0 && (
                <span className="text-orange-600">
                  This category has {categoryToDelete.children.length} subcategories that will also be affected.
                </span>
              )}
              <br />
              This action cannot be undone.
            </>
          ) : (
            "Are you sure you want to delete this category?"
          )
        }
        onConfirm={handleConfirmDelete}
        isConfirming={false}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  )
}

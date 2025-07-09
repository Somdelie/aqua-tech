"use client"
import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import * as XLSX from "xlsx"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { EntityForm, ConfirmationDialog } from "@/components/ui/data-table"
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { createBrand } from "@/actions/brands-action"
import { ImageInput } from "../../forms/ImageInput"
import { Plus, MoreVertical, Edit, Trash2, ExternalLink, Building2, Search, Download } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Brand interface based on Prisma schema
interface Brand {
  id: string
  name: string
  slug: string
  description: string | null
  logo: string | null
  website: string | null
  _count: { products: number }
  createdAt: Date
  updatedAt: Date
}

interface BrandsListingProps {
  brands: Brand[]
}

// Brand form schema
const brandFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
})

type BrandFormData = z.infer<typeof brandFormSchema>

export default function BrandsListing({ brands }: BrandsListingProps) {
  const [brandsData, setBrandsData] = useState<Brand[]>(brands)
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>(brands)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null)
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null)
  const [logoUrl, setLogoUrl] = useState("")
  const router = useRouter()

  useEffect(() => {
    setBrandsData(brands)
    setFilteredBrands(brands)
  }, [brands])

  // Filter brands based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBrands(brandsData)
    } else {
      const filtered = brandsData.filter(
        (brand) =>
          brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          brand.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredBrands(filtered)
    }
  }, [searchQuery, brandsData])

  // Form setup
  const form = useForm<BrandFormData>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: "",
      description: "",
      logo: "",
      website: "",
    },
  })

  // Form reset effect
  useEffect(() => {
    if (currentBrand) {
      form.reset({
        name: currentBrand.name,
        description: currentBrand.description || "",
        logo: currentBrand.logo || "",
        website: currentBrand.website || "",
      })
      setLogoUrl(currentBrand.logo || "")
    } else {
      form.reset()
      setLogoUrl("")
    }
  }, [currentBrand, form])

  const resetFormAndCloseModal = useCallback(() => {
    setCurrentBrand(null)
    setFormDialogOpen(false)
    setLogoUrl("")
    form.reset()
  }, [form])

  const handleBrandClick = (brand: Brand) => {
    router.push(`/dashboard/brands/${brand.slug}`)
  }

  const handleLogoChange = (url: string) => {
    setLogoUrl(url)
    form.setValue("logo", url)
  }

  const handleNameChange = (name: string) => {
    form.setValue("name", name)
  }

  // Export to Excel
  const handleExport = async () => {
    try {
      const exportData = filteredBrands.map((brand) => ({
        Name: brand.name,
        Slug: brand.slug,
        Description: brand.description || "",
        Website: brand.website || "",
        "Product Count": brand._count.products,
        "Date Created": format(new Date(brand.createdAt), "MMM dd, yyyy"),
      }))

      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Brands")
      const fileName = `Brands_${format(new Date(), "yyyy-MM-dd")}.xlsx`
      XLSX.writeFile(workbook, fileName)

      toast.success("Export successful", {
        description: `Brands exported to ${fileName}`,
      })
    } catch (error) {
      toast.error("Export failed", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      })
    }
  }

  // Event handlers
  const handleAddClick = () => {
    setCurrentBrand(null)
    setFormDialogOpen(true)
  }

  const handleEditClick = (brand: Brand) => {
    setCurrentBrand(brand)
    setFormDialogOpen(true)
  }

  const handleDeleteClick = (brand: Brand) => {
    setCurrentBrand(brand)
    setBrandToDelete(brand)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (brandToDelete?.id) {
      try {
        // Add your delete mutation here
        setDeleteDialogOpen(false)
        toast.success("Brand deleted successfully")
      } catch (error) {
        console.error("Error deleting brand:", error)
        toast.error("Failed to delete brand")
      }
    }
  }

  const onSubmit = async (data: BrandFormData) => {
    setIsSubmitting(true)
    try {
      if (!currentBrand) {
        const res = await createBrand({
          ...data,
          website: data.website || null,
        })
        if (res?.status === 201) {
          resetFormAndCloseModal()
          if (res.data) {
            setBrandsData((prev) => [...prev, res.data])
          }
          toast.success("Brand created successfully")
        } else if (res?.error) {
          toast.error("Error", { description: res.error })
        }
      } else {
        // Update existing brand logic here
        toast.success("Brand updated successfully")
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

  // Calculate total brands count
  const getTotalProductsCount = (brands: Brand[]) => {
    return brands.reduce((total, brand) => total + brand._count.products, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Brands Management</CardTitle>
            <p className="text-muted-foreground mt-1">
              {filteredBrands.length} {filteredBrands.length === 1 ? "brand" : "brands"} |{" "}
              {getTotalProductsCount(filteredBrands)} total products
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleAddClick}>
              <Plus className="h-4 w-4 mr-2" />
              Add Brand
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search brands..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Brands Grid */}
      {filteredBrands.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{searchQuery ? "No brands found" : "No brands yet"}</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery ? "Try adjusting your search terms" : "Create your first brand to get started"}
            </p>
            {!searchQuery && (
              <Button onClick={handleAddClick}>
                <Plus className="h-4 w-4 mr-2" />
                Add Brand
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredBrands.map((brand) => (
            <Card
              key={brand.id}
              className="group hover:shadow-lg transition-all duration-200 cursor-pointer relative p-0"
              onClick={() => handleBrandClick(brand)}
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 bg-white/80 backdrop-blur-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditClick(brand)
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(brand)
                      }}
                      className="text-red-600"
                      disabled={brand._count.products > 0}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                    {brand.website && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(brand.website!, "_blank")
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Website
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <CardContent className="p-4">
                <div className="aspect-square w-full mb-4 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                  {brand.logo ? (
                    <img
                      src={brand.logo || "/placeholder.svg"}
                      alt={brand.name}
                      className="w-full h-full object-contain p-2 shadow border-2 rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                        const parent = e.currentTarget.parentElement
                        if (parent) {
                          parent.innerHTML = `<div class="flex items-center justify-center w-full h-full"><svg class="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg></div>`
                        }
                      }}
                    />
                  ) : (
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg leading-tight">{brand.name}</h3>
{/* 
                  {brand.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{brand.description}</p>
                  )} */}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{brand._count.products} products</span>
                    {brand.website && <ExternalLink className="h-3 w-3" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Brand Form Dialog */}
      <EntityForm
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        title={currentBrand ? "Edit Brand" : "Add New Brand"}
        form={form}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        submitLabel={currentBrand ? "Save Changes" : "Add Brand"}
        size="lg"
      >
        <div className="col-span-1 md:col-span-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter brand name" {...field} onChange={(e) => handleNameChange(e.target.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-1 md:col-span-2">
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com" {...field} value={field.value || ""} />
                </FormControl>
                <FormDescription>Enter the brand's official website URL</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-1 md:col-span-2">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Brand description" rows={3} {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Brand Logo</label>
          <div className="flex flex-col space-y-3 px-4 items-center w-full border-2 border-dashed border-orange-300 rounded-lg p-4">
            {logoUrl && (
              <div className="relative group w-full flex justify-center items-center">
                <img
                  src={logoUrl || "/placeholder.svg"}
                  alt="Brand logo"
                  className="w-24 h-24 object-cover rounded-md border shadow-sm"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.jpg"
                  }}
                />
              </div>
            )}
            <ImageInput title="" imageUrl={logoUrl} setImageUrl={handleLogoChange} endpoint="brandLogo" />
            <p className="text-xs text-muted-foreground text-center">
              Upload a high quality logo for your brand. JPG, PNG, and WebP formats supported (max 1MB).
            </p>
          </div>
        </div>
      </EntityForm>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Brand"
        description={
          brandToDelete ? (
            <>
              Are you sure you want to delete <strong className="text-primary">{brandToDelete.name}</strong>?
              <br />
              {brandToDelete._count.products > 0 && (
                <span className="text-red-600">
                  This brand has {brandToDelete._count.products} products. Please reassign them first.
                </span>
              )}
              <br />
              This action cannot be undone.
            </>
          ) : (
            "Are you sure you want to delete this brand?"
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

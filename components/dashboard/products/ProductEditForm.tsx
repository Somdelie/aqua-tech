"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FileText, Package, Tag } from "lucide-react"
import { BasicInfoTab } from "./BasicInfoTab"
import { DetailsTab } from './DetailsTab';
import { cn } from '../../../lib/utils';
import { InventoryTab } from './inventory-tab';

interface CategoryOption {
  value: string
  label: string
}

interface ProductEditFormProps {
  product: any
  categoryOptions: CategoryOption[]
}

export default function ProductEditForm({ product, categoryOptions }: ProductEditFormProps) {
  const [activeTab, setActiveTab] = useState("basic-info")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 p-1 bg-gray-100 rounded">
        <TabsTrigger
          value="basic-info"
          className={cn(
            "flex items-center gap-2 transition-all",
            "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
            "data-[state=active]:shadow-sm",
          )}
        >
          <FileText className="h-4 w-4" />
          <span>Basic Information</span>
        </TabsTrigger>
        <TabsTrigger
          value="inventory"
          className={cn(
            "flex items-center gap-2 transition-all",
            "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
            "data-[state=active]:shadow-sm",
          )}
        >
          <Tag className="h-4 w-4" />
          <span>Inventory & Pricing</span>
        </TabsTrigger>
        <TabsTrigger
          value="details"
          className={cn(
            "flex items-center gap-2 transition-all",
            "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
            "data-[state=active]:shadow-sm",
          )}
        >
          <Package className="h-4 w-4" />
          <span>Product Details</span>
        </TabsTrigger>
      </TabsList>

      <div className="mt-6 bg-white p-6 rounded-lg border shadow-sm">
        <TabsContent value="basic-info">
          <BasicInfoTab product={product} categoryOptions={categoryOptions} />
        </TabsContent>

        <TabsContent value="inventory">
          <InventoryTab product={product} />
        </TabsContent>

        <TabsContent value="details">
          <DetailsTab product={product} />
        </TabsContent>
      </div>
    </Tabs>
  )
}

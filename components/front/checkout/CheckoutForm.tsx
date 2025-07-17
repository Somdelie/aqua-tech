"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, CreditCard, Truck, Package, Info, Copy, Mail } from "lucide-react"

const checkoutSchema = z.object({
  // Shipping Address
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  company: z.string().optional(),
  streetLine1: z.string().min(1, "Street address is required"),
  streetLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State/Province is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  // Delivery & Payment
  deliveryMethod: z.enum(["DELIVERY", "COLLECTION"]),
  paymentMethod: z.enum(["CASH_ON_DELIVERY", "CASH_ON_COLLECTION", "CARD_ONLINE", "EFT", "BANK_TRANSFER"]),
  // Optional
  notes: z.string().optional(),
  saveAddress: z.boolean(), // Changed from .default(false) to z.boolean()
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => void
  isSubmitting: boolean
  currentStep: number
  setCurrentStep: (step: number) => void
  onDeliveryMethodChange?: (method: "DELIVERY" | "COLLECTION") => void
}

export function CheckoutForm({
  onSubmit,
  isSubmitting,
  currentStep,
  setCurrentStep,
  onDeliveryMethodChange,
}: CheckoutFormProps) {
  const [deliveryMethod, setDeliveryMethod] = useState<"DELIVERY" | "COLLECTION">("DELIVERY")
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      country: "South Africa",
      deliveryMethod: "DELIVERY",
      paymentMethod: "CASH_ON_DELIVERY",
      saveAddress: false, // This ensures it's always a boolean
    },
  })

  const handleSubmit = (data: CheckoutFormData) => {
    console.log("Form data being submitted:", data) // Debug log
    onSubmit(data)
  }

  const nextStep = async () => {
    // Validate current step before proceeding
    let isValid = false
    if (currentStep === 1) {
      isValid = await form.trigger([
        "firstName",
        "lastName",
        "email",
        "phone",
        "streetLine1",
        "city",
        "state",
        "postalCode",
        "country",
      ])
    } else if (currentStep === 2) {
      isValid = await form.trigger(["deliveryMethod", "paymentMethod"])
    } else {
      isValid = true // No specific validation for step 3 before moving to submit
    }

    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleDeliveryMethodChange = (value: "DELIVERY" | "COLLECTION") => {
    setDeliveryMethod(value)
    form.setValue("deliveryMethod", value)
    // Update payment method based on delivery method
    if (value === "DELIVERY") {
      form.setValue("paymentMethod", "CASH_ON_DELIVERY")
    } else {
      form.setValue("paymentMethod", "CASH_ON_COLLECTION")
    }
    onDeliveryMethodChange?.(value)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log("Copied to clipboard:", text)
    })
  }

  const selectedPaymentMethod = form.watch("paymentMethod")

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Step 1: Shipping Information */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Shipping Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" {...form.register("firstName")} className="mt-1" />
                {form.formState.errors.firstName && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" {...form.register("lastName")} className="mt-1" />
                {form.formState.errors.lastName && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" type="email" {...form.register("email")} className="mt-1" />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" {...form.register("phone")} className="mt-1" />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.phone.message}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="company">Company (Optional)</Label>
              <Input id="company" {...form.register("company")} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="streetLine1">Street Address *</Label>
              <Input id="streetLine1" {...form.register("streetLine1")} className="mt-1" />
              {form.formState.errors.streetLine1 && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.streetLine1.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="streetLine2">Apartment, suite, etc. (Optional)</Label>
              <Input id="streetLine2" {...form.register("streetLine2")} className="mt-1" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input id="city" {...form.register("city")} className="mt-1" />
                {form.formState.errors.city && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.city.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="state">State/Province *</Label>
                <Input id="state" {...form.register("state")} className="mt-1" />
                {form.formState.errors.state && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.state.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input id="postalCode" {...form.register("postalCode")} className="mt-1" />
                {form.formState.errors.postalCode && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.postalCode.message}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="country">Country *</Label>
              <Input id="country" {...form.register("country")} className="mt-1" />
              {form.formState.errors.country && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.country.message}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="saveAddress"
                checked={form.watch("saveAddress")}
                onCheckedChange={(checked) => form.setValue("saveAddress", !!checked)}
              />
              <Label htmlFor="saveAddress" className="text-sm">
                Save this address for future orders
              </Label>
            </div>
            <div className="flex justify-end">
              <Button type="button" onClick={nextStep} className="bg-teal-600 hover:bg-teal-700">
                Continue to Delivery
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Step 2: Delivery & Payment */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Delivery Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Delivery Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={form.watch("deliveryMethod")} onValueChange={handleDeliveryMethodChange}>
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <RadioGroupItem value="DELIVERY" id="delivery" />
                  <div className="flex-1">
                    <Label htmlFor="delivery" className="font-medium">
                      Home Delivery
                    </Label>
                    <p className="text-sm text-gray-600">R150.00 delivery fee</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <RadioGroupItem value="COLLECTION" id="collection" />
                  <div className="flex-1">
                    <Label htmlFor="collection" className="font-medium">
                      Store Collection
                    </Label>
                    <p className="text-sm text-gray-600">Free - Collect from our store</p>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={form.watch("paymentMethod")}
                onValueChange={(value) => form.setValue("paymentMethod", value as CheckoutFormData["paymentMethod"])}
              >
                {deliveryMethod === "DELIVERY" && (
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="CASH_ON_DELIVERY" id="cod" />
                    <Label htmlFor="cod" className="font-medium">
                      Cash on Delivery
                    </Label>
                  </div>
                )}
                {deliveryMethod === "COLLECTION" && (
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="CASH_ON_COLLECTION" id="coc" />
                    <Label htmlFor="coc" className="font-medium">
                      Cash on Collection
                    </Label>
                  </div>
                )}
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <RadioGroupItem value="EFT" id="eft" />
                  <Label htmlFor="eft" className="font-medium">
                    EFT Transfer
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <RadioGroupItem value="BANK_TRANSFER" id="bank" />
                  <Label htmlFor="bank" className="font-medium">
                    Bank Transfer
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
          {/* EFT Banking Details */}
          {selectedPaymentMethod === "EFT" && (
            <Card className="border-teal-200 bg-teal-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-teal-800">
                  <Info className="w-5 h-5" />
                  EFT Banking Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="font-medium">Bank Name:</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard("First National Bank")}
                          className="h-6 px-2"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm bg-gray-50 p-2 rounded">First National Bank</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="font-medium">Account Name:</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard("Walter Projects")}
                          className="h-6 px-2"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm bg-gray-50 p-2 rounded">Walter Projects</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="font-medium">Account Number:</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard("63128946051")}
                          className="h-6 px-2"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm bg-gray-50 p-2 rounded font-mono">63128946051</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="font-medium">Branch Code:</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard("250655")}
                          className="h-6 px-2"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm bg-gray-50 p-2 rounded font-mono">250655</p>
                    </div>
                  </div>
                </div>
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> After making your EFT payment, please send your proof of payment to{" "}
                    <a href="mailto:info@walterprojects.co.za" className="text-teal-600 hover:underline font-medium">
                      info@walterprojects.co.za
                    </a>{" "}
                    to confirm your order.
                  </AlertDescription>
                </Alert>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Use your order number as the payment reference</p>
                  <p>• Your order will be processed once payment is confirmed</p>
                  <p>• Please allow 1-2 business days for payment verification</p>
                </div>
              </CardContent>
            </Card>
          )}
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={prevStep}>
              Back to Shipping
            </Button>
            <Button type="button" onClick={nextStep} className="bg-teal-600 hover:bg-teal-700">
              Review Order
            </Button>
          </div>
        </div>
      )}
      {/* Step 3: Review & Submit */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Review Your Order
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="notes">Order Notes (Optional)</Label>
              <Textarea
                id="notes"
                {...form.register("notes")}
                placeholder="Any special instructions for your order..."
                className="mt-1"
              />
            </div>
            <Separator />
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={prevStep}>
                Back to Payment
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700">
                {isSubmitting ? "Placing Order..." : "Place Order"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </form>
  )
}

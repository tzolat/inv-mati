"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Trash, Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import axios from "axios"

// Add a function to generate SKUs automatically
// Add this function after the imports and before the AddProductForm component

function generateSKU(productName: string, variantName: string, index: number): string {
  // Extract first 3 letters of product name (or fewer if shorter)
  const productPrefix = productName
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 3)
    .toUpperCase()

  // Extract first 3 letters of variant name (or fewer if shorter)
  const variantPrefix = variantName
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 3)
    .toUpperCase()

  // Current timestamp for uniqueness
  const timestamp = Date.now().toString().slice(-6)

  // Combine to create SKU
  return `${productPrefix}-${variantPrefix}-${timestamp}`
}

// Define schema for form validation
const variantSchema = z.object({
  name: z.string().min(1, "Variant name is required"),
  sku: z.string().min(1, "SKU is required"),
  costPrice: z.coerce.number().min(0, "Cost price must be a positive number"),
  sellingPrice: z.coerce.number().min(0, "Selling price must be a positive number"),
  currentStock: z.coerce.number().min(0, "Stock must be a positive number"),
  lowStockThreshold: z.coerce.number().min(1, "Low stock threshold must be at least 1"),
  location: z.string().optional(),
})

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Brand is required"),
  supplier: z.string().min(1, "Supplier is required"),
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
})

type ProductFormValues = z.infer<typeof productSchema>

export function AddProductForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with default values
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      brand: "",
      supplier: "",
      variants: [
        {
          name: "Default",
          sku: generateSKU("PROD", "Default", 1),
          costPrice: 0,
          sellingPrice: 0,
          currentStock: 0,
          lowStockThreshold: 5,
          location: "",
        },
      ],
    },
  })

  // Set up field array for variants
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  })

  // Update SKU when product name or variant name changes
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      // If product name changes, update all variant SKUs
      if (name === "name" && value.name) {
        const productName = value.name
        fields.forEach((field, index) => {
          const variantName = form.getValues(`variants.${index}.name`) || "VAR"
          if (variantName) {
            form.setValue(`variants.${index}.sku`, generateSKU(productName, variantName, index + 1))
          }
        })
      }

      // If a variant name changes, update just that variant's SKU
      if (name && name.startsWith("variants.") && name.endsWith(".name")) {
        const index = Number.parseInt(name.split(".")[1])
        const productName = form.getValues("name") || "PROD"
        const variantName = form.getValues(`variants.${index}.name`) || "VAR"
        form.setValue(`variants.${index}.sku`, generateSKU(productName, variantName, index + 1))
      }
    })

    return () => subscription.unsubscribe()
  }, [form, fields])

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setIsSubmitting(true)

      // Submit data to API
      await axios.post("/api/products", data)

      toast({
        title: "Product Added",
        description: `${data.name} has been added to your inventory.`,
      })

      // Redirect to inventory page
      router.push("/inventory")
    } catch (error: any) {
      console.error("Error adding product:", error)

      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to add product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Brakes, Engine Parts, Filters" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Bosch, Toyota, NGK" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="supplier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier</FormLabel>
                <FormControl>
                  <Input placeholder="Enter supplier name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter product description (optional)" className="min-h-[100px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-4">Product Variants</h3>
          <FormDescription className="mb-4">
            Add different variants of this product (e.g. sizes, colors, models)
          </FormDescription>

          {fields.map((field, index) => (
            <Card key={field.id} className="mb-4">
              <CardContent className="pt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`variants.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Variant Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Small, Red, 2.0L" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`variants.${index}.sku`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input placeholder="Unique product code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`variants.${index}.costPrice`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost Price</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`variants.${index}.sellingPrice`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Selling Price</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`variants.${index}.currentStock`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Stock</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`variants.${index}.lowStockThreshold`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Low Stock Threshold</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`variants.${index}.location`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Storage Location (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Shelf A3, Warehouse B" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {fields.length > 1 && (
                  <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => remove(index)}>
                    <Trash className="mr-2 h-4 w-4" />
                    Remove Variant
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const productName = form.getValues("name") || "PROD"
              append({
                name: "",
                sku: generateSKU(productName, "VAR", fields.length + 1),
                costPrice: 0,
                sellingPrice: 0,
                currentStock: 0,
                lowStockThreshold: 5,
                location: "",
              })
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Variant
          </Button>
        </div>

        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => router.push("/inventory")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Product"}
          </Button>
        </div>
      </form>
    </Form>
  )
}


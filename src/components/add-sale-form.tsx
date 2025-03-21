"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Trash, Plus, Loader2, Search, ShoppingCart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import axios from "axios"

// Define schema for form validation
const saleItemSchema = z.object({
  product: z.string().min(1, "Product is required"),
  variant: z.string().min(1, "Variant is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  actualSellingPrice: z.coerce.number().min(0, "Price must be a positive number").optional(),
})

const saleSchema = z.object({
  customer: z.string().optional(),
  items: z.array(saleItemSchema).min(1, "At least one item is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  paymentStatus: z.string().min(1, "Payment status is required"),
  notes: z.string().optional(),
})

type SaleFormValues = z.infer<typeof saleSchema>

export function AddSaleForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [selectedProducts, setSelectedProducts] = useState<Record<number, any>>({})
  const [selectedVariants, setSelectedVariants] = useState<Record<number, any>>({})
  const [receiptItems, setReceiptItems] = useState<any[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [totalProfit, setTotalProfit] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])

  // Initialize form with default values
  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      customer: "",
      items: [
        {
          product: "",
          variant: "",
          quantity: 1,
        },
      ],
      paymentMethod: "Cash",
      paymentStatus: "Completed",
      notes: "",
    },
  })

  // Set up field array for items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true)

        const response = await axios.get("/api/products?limit=100")
        const productsWithStock = response.data.products.filter((product: any) =>
          product.variants.some((variant: any) => variant.currentStock > 0),
        )
        setProducts(productsWithStock)
        setFilteredProducts(productsWithStock)
      } catch (error) {
        console.error("Error fetching products:", error)
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoadingProducts(false)
      }
    }

    fetchProducts()
  }, [])

  // Filter products based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products)
      return
    }

    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.variants.some(
          (v: any) =>
            v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.sku.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    )

    setFilteredProducts(filtered)
  }, [searchQuery, products])

  // Calculate receipt totals whenever form values change
  const calculateReceiptItems = useCallback(
    (values: SaleFormValues) => {
      const items = values.items || []

      const calculatedItems = items
        .map((item, index) => {
          const product = selectedProducts[index]
          const variant = selectedVariants[index]

          if (!product || !variant) return null

          const quantity = item.quantity || 0
          const actualPrice = item.actualSellingPrice || variant.sellingPrice
          const totalPrice = actualPrice * quantity
          const profit = (actualPrice - variant.costPrice) * quantity

          return {
            name: `${product.name} - ${variant.name}`,
            quantity,
            unitPrice: actualPrice,
            totalPrice,
            profit,
          }
        })
        .filter(Boolean)

      setReceiptItems(calculatedItems)

      const calculatedSubtotal = calculatedItems.reduce((sum, item) => sum + (item?.totalPrice || 0), 0)
      const calculatedProfit = calculatedItems.reduce((sum, item) => sum + (item?.profit || 0), 0)

      setSubtotal(calculatedSubtotal)
      setTotalProfit(calculatedProfit)
    },
    [selectedProducts, selectedVariants]
  )

  // Update receipt when form values change
  useEffect(() => {
    const subscription = form.watch((values:any) => {
      calculateReceiptItems(values); // Pass the watched values directly
    });
    return () => subscription.unsubscribe(); // Clean up subscription
  }, [calculateReceiptItems])

  // Handle product selection
  const handleProductChange = (value: string, index: number) => {
    const product = products.find((p) => p._id === value)
    setSelectedProducts({ ...selectedProducts, [index]: product })

    // Reset variant when product changes
    form.setValue(`items.${index}.variant`, "")
    setSelectedVariants({ ...selectedVariants, [index]: null })
  }

  // Handle variant selection
  const handleVariantChange = (value: string, index: number) => {
    const product = selectedProducts[index]
    if (!product) return

    const variant = product.variants.find((v: any) => v.name === value)
    setSelectedVariants({ ...selectedVariants, [index]: variant })

    // Set default selling price
    if (variant) {
      form.setValue(`items.${index}.actualSellingPrice`, variant.sellingPrice)
    }
  }

  const onSubmit = async (data: SaleFormValues) => {
    try {
      setIsSubmitting(true)

      // Submit data to API
      await axios.post("/api/sales", data)

      toast({
        title: "Sale Recorded",
        description: "The sale has been successfully recorded.",
      })

      // Redirect to sales page
      router.push("/sales")
    } catch (error: any) {
      console.error("Error recording sale:", error)

      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to record sale. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="customer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter customer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select defaultValue={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Credit Card">Credit Card</SelectItem>
                          <SelectItem value="Debit Card">Debit Card</SelectItem>
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                          <SelectItem value="Mobile Payment">Mobile Payment</SelectItem>
                          <SelectItem value="Check">Check</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Status</FormLabel>
                      <Select defaultValue={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any additional notes about this sale"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4">Sale Items</h3>
              <FormDescription className="mb-4">Add the items included in this sale</FormDescription>

              {loadingProducts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading products...</span>
                </div>
              ) : (
                <>
                  {fields.map((field, index) => (
                    <Card key={field.id} className="mb-4">
                      <CardContent className="pt-6">
                        <div className="grid gap-6 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name={`items.${index}.product`}
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Product</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        role="combobox"
                                        className="justify-between w-full font-normal"
                                      >
                                        {field.value
                                          ? products.find((product) => product._id === field.value)?.name ||
                                            "Select product"
                                          : "Select product"}
                                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[300px] p-0" align="start">
                                    <Command>
                                      <CommandInput placeholder="Search products..." onValueChange={setSearchQuery} />
                                      <CommandList>
                                        <CommandEmpty>No products found.</CommandEmpty>
                                        <CommandGroup>
                                          {filteredProducts.map((product) => (
                                            <CommandItem
                                              key={product._id}
                                              value={product._id}
                                              onSelect={() => {
                                                field.onChange(product._id)
                                                handleProductChange(product._id, index)
                                              }}
                                            >
                                              <div className="flex flex-col">
                                                <span className="font-medium">{product.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                  {product.brand} - {product.category}
                                                </span>
                                              </div>
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${index}.variant`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Variant</FormLabel>
                                <Select
                                  value={field.value}
                                  onValueChange={(value) => {
                                    field.onChange(value)
                                    handleVariantChange(value, index)
                                  }}
                                  disabled={!selectedProducts[index]}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a variant" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {selectedProducts[index]?.variants
                                      .filter((v: any) => v.currentStock > 0)
                                      .map((variant: any) => (
                                        <SelectItem key={variant._id} value={variant.name}>
                                          <div className="flex justify-between items-center w-full">
                                            <span>{variant.name}</span>
                                            <Badge variant="outline" className="ml-2">
                                              {variant.currentStock} in stock
                                            </Badge>
                                          </div>
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quantity</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    max={selectedVariants[index]?.currentStock || 1}
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(e)
                                      // Force recalculation after a short delay
                                      setTimeout(calculateReceiptItems, 0)
                                    }}
                                  />
                                </FormControl>
                                {selectedVariants[index] && (
                                  <FormDescription>
                                    Max available: {selectedVariants[index].currentStock}
                                  </FormDescription>
                                )}
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${index}.actualSellingPrice`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Selling Price</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder={selectedVariants[index]?.sellingPrice?.toString() || "0.00"}
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(e)
                                      // Force recalculation after a short delay
                                      setTimeout(calculateReceiptItems, 0)
                                    }}
                                  />
                                </FormControl>
                                {selectedVariants[index] && (
                                  <FormDescription>
                                    Default price: ${selectedVariants[index].sellingPrice.toFixed(2)}
                                  </FormDescription>
                                )}
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => remove(index)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Remove Item
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        product: "",
                        variant: "",
                        quantity: 1,
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </>
              )}
            </div>

            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => router.push("/sales")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || loadingProducts}>
                {isSubmitting ? "Recording..." : "Record Sale"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Receipt Preview */}
      <div className="lg:col-span-1">
        <Card className="sticky top-6">
          <CardHeader className="bg-muted/50">
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Receipt Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-6 border-b">
              <div className="text-center mb-4">
                <h3 className="font-bold text-lg">Auto Parts Store</h3>
                <p className="text-sm text-muted-foreground">Sale Receipt</p>
              </div>

              <div className="space-y-4">
                <div className="border-b pb-4">
                  <p className="text-sm">
                    <span className="font-medium">Date:</span> {new Date().toLocaleDateString()}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Customer:</span> {form.watch("customer") || "Walk-in Customer"}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Payment:</span> {form.watch("paymentMethod")}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Status:</span> {form.watch("paymentStatus")}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Item</span>
                    <div className="flex">
                      <span className="w-16 text-right">Qty</span>
                      <span className="w-20 text-right">Price</span>
                      <span className="w-24 text-right">Total</span>
                    </div>
                  </div>

                  <Separator />

                  {receiptItems.length > 0 ? (
                    <div className="space-y-2">
                      {receiptItems.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="flex-1 truncate">{item.name}</span>
                          <div className="flex">
                            <span className="w-16 text-right">{item.quantity}</span>
                            <span className="w-20 text-right">${item.unitPrice.toFixed(2)}</span>
                            <span className="w-24 text-right">${item.totalPrice.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-sm text-muted-foreground">No items added yet</div>
                  )}

                  {receiptItems.length > 0 && (
                    <>
                      <Separator />

                      <div className="space-y-1 pt-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium">
                          <span>Total:</span>
                          <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Profit:</span>
                          <span>${totalProfit.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Profit Margin:</span>
                          <span>{subtotal > 0 ? ((totalProfit / subtotal) * 100).toFixed(1) : 0}%</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 text-xs text-muted-foreground">
            <p className="text-center w-full">Thank you for your business!</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}


"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Loader2, ShoppingCart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import axios from "axios"

// Define schema for form validation
const saleSchema = z.object({
  customer: z.string().optional(),
  paymentMethod: z.string().min(1, "Payment method is required"),
  paymentStatus: z.string().min(1, "Payment status is required"),
  flagStatus: z.enum(["green", "red"]).default("green"), // Added flag status field
  notes: z.string().optional(),
})

type SaleFormValues = z.infer<typeof saleSchema>

interface EditSaleFormProps {
  id: string
}

export function EditSaleForm({ id }: EditSaleFormProps) {
  const router = useRouter()
  const [sale, setSale] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form
  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      customer: "",
      paymentMethod: "Cash",
      paymentStatus: "Completed",
      flagStatus: "green",
      notes: "",
    },
  })

  // Fetch sale data
  useEffect(() => {
    const fetchSale = async () => {
      try {
        const response = await axios.get(`/api/sales/${id}`)
        const saleData = response.data

        setSale(saleData)

        // Reset form with sale data
        form.reset({
          customer: saleData.customer || "",
          paymentMethod: saleData.paymentMethod,
          paymentStatus: saleData.paymentStatus || "Completed",
          flagStatus: saleData.flagStatus || "green", // Add flag status
          notes: saleData.notes || "",
        })
      } catch (error) {
        console.error("Error fetching sale:", error)
        toast({
          title: "Error",
          description: "Failed to load sale data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSale()
  }, [id, form])

  const onSubmit = async (data: SaleFormValues) => {
    try {
      setIsSubmitting(true)

      // Update only the editable fields
      await axios.put(`/api/sales/${id}`, {
        customer: data.customer,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus,
        flagStatus: data.flagStatus, // Add flag status
        notes: data.notes,
      })

      toast({
        title: "Sale Updated",
        description: "The sale has been successfully updated.",
      })

      // Redirect to sale details page
      router.push(`/sales/${id}`)
    } catch (error: any) {
      console.error("Error updating sale:", error)

      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update sale. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading sale data...</span>
      </div>
    )
  }

  if (!sale) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-medium">Sale not found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          The sale you're trying to edit doesn't exist or has been removed.
        </p>
        <Button className="mt-4" onClick={() => router.push("/sales")}>
          Back to Sales
        </Button>
      </div>
    )
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                name="flagStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Documentation Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select documentation status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="green">Green Flag</SelectItem>
                        <SelectItem value="red">Red Flag</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Indicates whether this sale has proper documentation</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => router.push(`/sales/${id}`)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Sale Summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-6">
          <CardHeader className="bg-muted/50">
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Sale Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-6 border-b">
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <p className="text-sm">
                    <span className="font-medium">Invoice:</span> {sale.invoiceNumber}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Date:</span> {new Date(sale.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Items:</span> {sale.items.length}
                  </p>
                </div>

                <div className="space-y-1 pt-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Total:</span>
                    <span>${sale.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Profit:</span>
                    <span>${sale.totalProfit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Profit Margin:</span>
                    <span>{sale.totalAmount > 0 ? ((sale.totalProfit / sale.totalAmount) * 100).toFixed(1) : 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 text-xs text-muted-foreground">
            <p className="text-center w-full">Note: Item details cannot be edited</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

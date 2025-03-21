"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import axios from "axios"

// Define schema for form validation
const businessSettingsSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  currency: z.string().min(1, "Currency is required"),
})

const inventorySettingsSchema = z.object({
  lowStockThreshold: z.coerce.number().min(1, "Low stock threshold must be at least 1"),
  taxRate: z.coerce.number().min(0, "Tax rate must be a positive number"),
})

const notificationSettingsSchema = z.object({
  notificationSettings: z.object({
    lowStock: z.boolean().default(true),
    newSales: z.boolean().default(true),
    priceChanges: z.boolean().default(true),
  }),
})

export function SettingsTabs() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("business")

  // Initialize forms
  const businessForm = useForm<z.infer<typeof businessSettingsSchema>>({
    resolver: zodResolver(businessSettingsSchema),
    defaultValues: {
      businessName: "",
      email: "",
      phone: "",
      address: "",
      currency: "USD",
    },
  })

  const inventoryForm = useForm<z.infer<typeof inventorySettingsSchema>>({
    resolver: zodResolver(inventorySettingsSchema),
    defaultValues: {
      lowStockThreshold: 5,
      taxRate: 0,
    },
  })

  const notificationForm = useForm<z.infer<typeof notificationSettingsSchema>>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      notificationSettings: {
        lowStock: true,
        newSales: true,
        priceChanges: true,
      },
    },
  })

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get("/api/settings")
        const settingsData = response.data

        setSettings(settingsData)

        // Reset forms with settings data
        businessForm.reset({
          businessName: settingsData.businessName,
          email: settingsData.email || "",
          phone: settingsData.phone || "",
          address: settingsData.address || "",
          currency: settingsData.currency,
        })

        inventoryForm.reset({
          lowStockThreshold: settingsData.lowStockThreshold,
          taxRate: settingsData.taxRate,
        })

        notificationForm.reset({
          notificationSettings: {
            lowStock: settingsData.notificationSettings.lowStock,
            newSales: settingsData.notificationSettings.newSales,
            priceChanges: settingsData.notificationSettings.priceChanges,
          },
        })
      } catch (error) {
        console.error("Error fetching settings:", error)
        toast({
          title: "Error",
          description: "Failed to load settings. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [businessForm, inventoryForm, notificationForm])

  const onBusinessSubmit = async (data: z.infer<typeof businessSettingsSchema>) => {
    try {
      businessForm.setValue("businessName", data.businessName)

      // Update settings
      await axios.put("/api/settings", {
        ...settings,
        ...data,
      })

      toast({
        title: "Settings Updated",
        description: "Business settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating business settings:", error)
      toast({
        title: "Error",
        description: "Failed to update business settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  const onInventorySubmit = async (data: z.infer<typeof inventorySettingsSchema>) => {
    try {
      // Update settings
      await axios.put("/api/settings", {
        ...settings,
        ...data,
      })

      toast({
        title: "Settings Updated",
        description: "Inventory settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating inventory settings:", error)
      toast({
        title: "Error",
        description: "Failed to update inventory settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  const onNotificationSubmit = async (data: z.infer<typeof notificationSettingsSchema>) => {
    try {
      // Update settings
      await axios.put("/api/settings", {
        ...settings,
        ...data,
      })

      toast({
        title: "Settings Updated",
        description: "Notification settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating notification settings:", error)
      toast({
        title: "Error",
        description: "Failed to update notification settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-[400px]" />
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Tabs defaultValue="business" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-4">
        <TabsTrigger value="business">Business</TabsTrigger>
        <TabsTrigger value="inventory">Inventory</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>

      <TabsContent value="business">
        <Card>
          <CardHeader>
            <CardTitle>Business Settings</CardTitle>
            <CardDescription>Manage your business information and preferences</CardDescription>
          </CardHeader>
          <Form {...businessForm}>
            <form onSubmit={businessForm.handleSubmit(onBusinessSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={businessForm.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your business name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={businessForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={businessForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={businessForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter your business address" className="min-h-[100px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={businessForm.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter currency code (e.g. USD, EUR)" {...field} />
                      </FormControl>
                      <FormDescription>This will be used for displaying prices and totals</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={businessForm.formState.isSubmitting}>
                  {businessForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </TabsContent>

      <TabsContent value="inventory">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Settings</CardTitle>
            <CardDescription>Configure inventory management preferences</CardDescription>
          </CardHeader>
          <Form {...inventoryForm}>
            <form onSubmit={inventoryForm.handleSubmit(onInventorySubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={inventoryForm.control}
                  name="lowStockThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Low Stock Threshold</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is the default value for new products. You can override this for individual products.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={inventoryForm.control}
                  name="taxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormDescription>Enter the tax rate as a percentage (e.g. 7.5 for 7.5%)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={inventoryForm.formState.isSubmitting}>
                  {inventoryForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure which notifications you want to receive</CardDescription>
          </CardHeader>
          <Form {...notificationForm}>
            <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)}>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Notification Types</h3>
                  <Separator />

                  <FormField
                    control={notificationForm.control}
                    name="notificationSettings.lowStock"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Low Stock Alerts</FormLabel>
                          <FormDescription>
                            Get notified when products fall below their low stock threshold
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="notificationSettings.newSales"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>New Sales</FormLabel>
                          <FormDescription>Get notified when new sales are recorded</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="notificationSettings.priceChanges"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Price Changes</FormLabel>
                          <FormDescription>Get notified when product prices are updated</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={notificationForm.formState.isSubmitting}>
                  {notificationForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </TabsContent>
    </Tabs>
  )
}


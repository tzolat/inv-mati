import type { ObjectId } from "mongoose"

export interface ProductVariant {
  _id?: string
  name: string
  sku: string
  costPrice: number
  sellingPrice: number
  currentStock: number
  lowStockThreshold: number
  location?: string
  flagStatus: "green" | "red" // Added flag status field
}

export interface Product {
  _id: string | ObjectId
  name: string
  description?: string
  category: string
  brand: string
  supplier: string
  variants: ProductVariant[]
  createdAt: Date
  updatedAt: Date
}

export interface SaleItem {
  _id?: string
  product: string | ObjectId | Product
  variant: string
  quantity: number
  costPrice: number
  sellingPrice: number
  actualSellingPrice: number
  profit: number
}

export interface Sale {
  _id: string | ObjectId
  invoiceNumber: string
  customer?: string
  items: SaleItem[]
  totalAmount: number
  totalProfit: number
  paymentMethod: string
  paymentStatus: string
  flagStatus: "green" | "red" // Added flag status field
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface ChartData {
  name: string
  value: number
}

export interface InventoryOverviewData {
  category: ChartData[]
  brand: ChartData[]
}

// Type guard to check if an object is a Product
export function isProduct(obj: any): obj is Product {
  return obj && typeof obj === "object" && "name" in obj && "brand" in obj && "category" in obj && "variants" in obj
}

import mongoose, { Schema, type Model } from "mongoose"
import type { Product as ProductType } from "@/types"

// Schema for Variant
const VariantSchema: Schema = new Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  costPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  currentStock: { type: Number, required: true, default: 0 },
  lowStockThreshold: { type: Number, required: true, default: 5 },
  location: { type: String, required: false },
})

// Schema for Product
const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  category: { type: String, required: true },
  brand: { type: String, required: true },
  supplier: { type: String, required: true },
  variants: [VariantSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Create or retrieve the model
const Product: Model<ProductType> =
  (mongoose.models.Product as Model<ProductType>) || mongoose.model<ProductType>("Product", ProductSchema)

export default Product


import mongoose, { Schema, type Model } from "mongoose"
import type { Sale as SaleType } from "@/types"

// Schema for Sale Item
const SaleItemSchema: Schema = new Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  variant: { type: String, required: true },
  quantity: { type: Number, required: true },
  costPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  actualSellingPrice: { type: Number, required: true },
  profit: { type: Number, required: true },
})

// Schema for Sale
const SaleSchema: Schema = new Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  customer: { type: String, required: false },
  items: [SaleItemSchema],
  totalAmount: { type: Number, required: true },
  totalProfit: { type: Number, required: true },
  paymentMethod: { type: String, required: true, default: "Cash" },
  paymentStatus: { type: String, required: true, default: "Completed" },
  flagStatus: { type: String, enum: ["green", "red"], default: "green" }, // Added flag status field
  notes: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Create or retrieve the model
const Sale: Model<SaleType> = (mongoose.models.Sale as Model<SaleType>) || mongoose.model<SaleType>("Sale", SaleSchema)

export default Sale

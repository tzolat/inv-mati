import mongoose, { Schema, type Document, type Model } from "mongoose"

// Interface for Settings
export interface ISettings extends Document {
  businessName: string
  email: string
  phone: string
  address: string
  currency: string
  lowStockThreshold: number
  taxRate: number
  notificationSettings: {
    lowStock: boolean
    newSales: boolean
    priceChanges: boolean
  }
  updatedAt: Date
}

// Schema for Settings
const SettingsSchema: Schema = new Schema({
  businessName: { type: String, required: true, default: "Auto Parts Store" },
  email: { type: String, required: false },
  phone: { type: String, required: false },
  address: { type: String, required: false },
  currency: { type: String, required: true, default: "USD" },
  lowStockThreshold: { type: Number, required: true, default: 5 },
  taxRate: { type: Number, required: true, default: 0 },
  notificationSettings: {
    lowStock: { type: Boolean, default: true },
    newSales: { type: Boolean, default: true },
    priceChanges: { type: Boolean, default: true },
  },
  updatedAt: { type: Date, default: Date.now },
})

// Create or retrieve the model
const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema)

export default Settings


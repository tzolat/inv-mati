import mongoose, { Schema, type Document, type Model } from "mongoose"

// Interface for Notification
export interface INotification extends Document {
  type: string
  message: string
  relatedTo: mongoose.Types.ObjectId
  relatedModel: string
  isRead: boolean
  createdAt: Date
}

// Schema for Notification
const NotificationSchema: Schema = new Schema({
  type: { type: String, required: true }, // 'low_stock', 'price_change', 'new_sale', etc.
  message: { type: String, required: true },
  relatedTo: { type: mongoose.Schema.Types.ObjectId, required: false },
  relatedModel: { type: String, required: false }, // 'Product', 'Sale', etc.
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

// Create or retrieve the model
const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema)

export default Notification


import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: "booking_status" | "reminder" | "waitlist" | "penalty" | "general";
  isRead: boolean;
  relatedBooking?: mongoose.Types.ObjectId;
  scheduledFor?: Date;
  isSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["booking_status", "reminder", "waitlist", "penalty", "general"],
      required: true,
    },
    isRead: { type: Boolean, default: false },
    relatedBooking: {
      type: Schema.Types.ObjectId,
      refPath: "bookingType",
    },
    bookingType: {
      type: String,
      enum: ["InfrastructureBooking", "EquipmentBooking"],
      required: false,
    },
    scheduledFor: { type: Date }, // For scheduled notifications like reminders
    isSent: { type: Boolean, default: false }, // Track if email has been sent
  },
  { timestamps: true }
);

export default mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

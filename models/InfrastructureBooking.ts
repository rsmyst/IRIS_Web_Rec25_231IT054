import mongoose, { Schema } from "mongoose";

export interface IInfrastructureBooking extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  infrastructure: mongoose.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  status: "pending" | "approved" | "rejected" | "canceled";
  waitlistPosition?: number;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InfrastructureBookingSchema = new Schema<IInfrastructureBooking>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    infrastructure: {
      type: Schema.Types.ObjectId,
      ref: "Infrastructure",
      required: true,
    },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "canceled"],
      default: "pending",
    },
    waitlistPosition: { type: Number },
    remarks: { type: String },
  },
  { timestamps: true }
);

// Add index to prevent multiple bookings per student per day
InfrastructureBookingSchema.index({ user: 1, date: 1 }, { unique: true });

// Validate that booking is for a 1-hour slot
InfrastructureBookingSchema.pre('validate', function(next) {
  const booking = this as IInfrastructureBooking;
  
  // Parse times into hours and minutes
  const startParts = booking.startTime.split(':').map(Number);
  const endParts = booking.endTime.split(':').map(Number);
  
  // Convert to minutes for easier calculation
  const startMinutes = startParts[0] * 60 + startParts[1];
  const endMinutes = endParts[0] * 60 + endParts[1];
  
  // Calculate the difference in minutes
  const durationMinutes = endMinutes - startMinutes;
  
  // Check if the duration is exactly 60 minutes (1 hour)
  if (durationMinutes !== 60) {
    const error = new Error('Booking must be for exactly 1 hour');
    return next(error);
  }
  
  next();
});

export default mongoose.models.InfrastructureBooking ||
  mongoose.model<IInfrastructureBooking>(
    "InfrastructureBooking",
    InfrastructureBookingSchema
  );

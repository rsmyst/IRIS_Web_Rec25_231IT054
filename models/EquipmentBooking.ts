import mongoose, { Schema, Document } from "mongoose";

export interface IEquipmentBooking extends Document {
  user: mongoose.Types.ObjectId;
  equipment: mongoose.Types.ObjectId;
  quantity: number;
  startDate: Date;
  endDate: Date;
  purpose: string;
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "returned"
    | "overdue"
    | "canceled";
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EquipmentBookingSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    equipment: {
      type: Schema.Types.ObjectId,
      ref: "Equipment",
      required: [true, "Equipment is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    purpose: {
      type: String,
      required: [true, "Purpose is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "returned",
        "overdue",
        "canceled",
      ],
      default: "pending",
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Validate end date is after start date
EquipmentBookingSchema.path("endDate").validate(function (
  this: IEquipmentBooking
) {
  return this.endDate >= this.startDate;
},
"End date must be after or equal to start date");

// Ensure startDate is not in the past
EquipmentBookingSchema.pre("save", function (next) {
  const booking = this as IEquipmentBooking;
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Reset time to start of day

  const startDate = new Date(booking.startDate);
  startDate.setHours(0, 0, 0, 0); // Reset time to start of day

  // Only check this for new bookings
  if (booking.isNew && startDate < now) {
    return next(new Error("Start date cannot be in the past"));
  }
  next();
});

// Prevent duplicate model compilation error in development with hot reload
const EquipmentBooking =
  mongoose.models.EquipmentBooking ||
  mongoose.model<IEquipmentBooking>("EquipmentBooking", EquipmentBookingSchema);

export default EquipmentBooking;

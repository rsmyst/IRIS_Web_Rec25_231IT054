import mongoose, { Schema, Document } from "mongoose";

export interface IEquipment extends Document {
  name: string;
  description: string;
  category: string;
  quantity: number;
  available: number;
  condition: "new" | "good" | "fair" | "poor";
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

const EquipmentSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Equipment name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 1,
    },
    available: {
      type: Number,
      min: [0, "Available quantity cannot be negative"],
      default: function (this: IEquipment) {
        return this.quantity;
      },
    },
    condition: {
      type: String,
      enum: ["new", "good", "fair", "poor"],
      default: "good",
    },
    location: {
      type: String,
      required: [true, "Storage location is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add validation to ensure available <= quantity
EquipmentSchema.path("available").validate(function (this: IEquipment) {
  return this.available <= this.quantity;
}, "Available quantity cannot exceed total quantity");

// Prevent duplicate model compilation error in development with hot reload
const Equipment =
  mongoose.models.Equipment ||
  mongoose.model<IEquipment>("Equipment", EquipmentSchema);

export default Equipment;

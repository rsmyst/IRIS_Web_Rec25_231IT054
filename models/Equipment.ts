import mongoose, { Schema, Document } from "mongoose";

export interface IEquipment extends Document {
  name: string;
  category: string;
  quantity: number;
  availability: "available" | "unavailable" | "maintenance";
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
    availability: {
      type: String,
      enum: ["available", "unavailable", "maintenance"],
      default: "available",
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
    collection: "equipments", // Explicitly set the collection name to match seed script
  }
);

// Prevent duplicate model compilation error in development with hot reload
const Equipment =
  mongoose.models.Equipment ||
  mongoose.model<IEquipment>("Equipment", EquipmentSchema);

export default Equipment;

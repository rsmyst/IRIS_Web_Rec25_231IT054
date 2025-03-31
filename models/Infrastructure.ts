import mongoose, { Schema } from "mongoose";

export interface IInfrastructure extends mongoose.Document {
  name: string;
  location: string;
  availability: boolean;
  capacity: number;
  operatingHours: {
    open: string;
    close: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const InfrastructureSchema = new Schema<IInfrastructure>(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    availability: { type: Boolean, default: true },
    capacity: { type: Number, required: true },
    operatingHours: {
      open: { type: String, required: true },
      close: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Infrastructure ||
  mongoose.model<IInfrastructure>("Infrastructure", InfrastructureSchema);

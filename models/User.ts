import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  id: string; // Adding explicit ID field
  name: string;
  email: string;
  password: string;
  branch?: string;
  role: "admin" | "student";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    branch: { type: String },
    role: { type: String, enum: ["admin", "student"], default: "student" },
  },
  { timestamps: true }
);

// Virtual for user's id (so the frontend gets it as "id" rather than "_id")
UserSchema.virtual("id").get(function (this: mongoose.Document) {
  return this._id.toString();
});

// Ensure virtual fields are included when converting to JSON
UserSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);

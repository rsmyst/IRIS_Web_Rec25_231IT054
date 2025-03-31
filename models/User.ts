import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  branch?: string;
  role: "admin" | "student";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password should be at least 6 characters"],
    },
    branch: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "student"],
      default: "student",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate model compilation error in development with hot reload
const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

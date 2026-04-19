import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: "farmer" | "mill" | "officer" | "none";
  district?: string;
  nic?: string;
  phone?: string;
  millName?: string;
  registrationNumber?: string;
  address?: string;
  officerId?: string;
  designation?: string;
  department?: string;
  assignedDistrict?: string;
  assignedDivision?: string;
  onboardingCompleted?: boolean;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    role: {
      type: String,
      enum: ["farmer", "mill", "officer", "none"],
      default: "none",
    },
    district: {
      type: String,
    },
    nic: {
      type: String,
    },
    phone: {
      type: String,
    },
    millName: {
      type: String,
    },
    registrationNumber: {
      type: String,
    },
    address: {
      type: String,
    },
    officerId: {
      type: String,
    },
    designation: {
      type: String,
    },
    department: {
      type: String,
    },
    assignedDistrict: {
      type: String,
    },
    assignedDivision: {
      type: String,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    imageUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type CollectionBookingStatus =
  | "pending"
  | "approved"
  | "collected"
  | "completed"
  | "cancelled";

export type CollectionPaymentStatus = "pending" | "partial" | "paid";
export type CollectionPaymentMethod = "cash" | "bank";
export type CollectionQualityGrade = "A" | "B" | "C" | "D";

export interface IPaddyCollection extends Document {
  _id: Types.ObjectId;
  millId: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  location: string;
  district: string;
  variety: string;
  estimatedQuantity: number;
  actualQuantity?: number;
  moistureLevel?: number;
  qualityGrade?: CollectionQualityGrade;
  scheduledDate: Date;
  scheduledTime: string;
  status: CollectionBookingStatus;
  paymentStatus: CollectionPaymentStatus;
  paymentMethod?: CollectionPaymentMethod;
  pricePerKg: number;
  totalAmount?: number;
  vehicleNumber?: string;
  driverName?: string;
  remarks?: string;
  collectedDate?: Date;
  paidAmount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const PaddyCollectionSchema: Schema<IPaddyCollection> = new Schema(
  {
    millId: { type: String, required: true, index: true },
    farmerId: { type: String, required: true },
    farmerName: { type: String, required: true },
    farmerPhone: { type: String, required: true },
    location: { type: String, required: true },
    district: { type: String, required: true },
    variety: { type: String, required: true },
    estimatedQuantity: { type: Number, required: true, min: 0 },
    actualQuantity: { type: Number, min: 0 },
    moistureLevel: { type: Number, min: 0, max: 100 },
    qualityGrade: { type: String, enum: ["A", "B", "C", "D"] },
    scheduledDate: { type: Date, required: true, index: true },
    scheduledTime: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "collected", "completed", "cancelled"],
      default: "pending",
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "paid"],
      default: "pending",
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "bank"],
    },
    pricePerKg: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, min: 0 },
    vehicleNumber: { type: String },
    driverName: { type: String },
    remarks: { type: String },
    collectedDate: { type: Date },
    paidAmount: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true },
);

const PaddyCollection: Model<IPaddyCollection> =
  mongoose.models.PaddyCollection ||
  mongoose.model<IPaddyCollection>("PaddyCollection", PaddyCollectionSchema);

export default PaddyCollection;

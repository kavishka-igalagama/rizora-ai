import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type PurchasePaymentStatus = "paid" | "pending" | "partial";
export type PurchaseQualityGrade = "A" | "B" | "C" | "D";

export interface IPurchaseRecord extends Document {
  _id: Types.ObjectId;
  millId: string;
  purchaseId: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  variety: string;
  quantity: number;
  qualityGrade: PurchaseQualityGrade;
  moistureLevel: number;
  pricePerKg: number;
  totalAmount: number;
  paymentStatus: PurchasePaymentStatus;
  paymentMethod: string;
  purchaseDate: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const PurchaseRecordSchema: Schema<IPurchaseRecord> = new Schema(
  {
    millId: { type: String, required: true, index: true },
    purchaseId: { type: String, required: true },
    farmerId: { type: String, required: true },
    farmerName: { type: String, required: true },
    farmerPhone: { type: String, required: true },
    variety: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    qualityGrade: {
      type: String,
      enum: ["A", "B", "C", "D"],
      required: true,
    },
    moistureLevel: { type: Number, required: true, min: 0, max: 100 },
    pricePerKg: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "partial"],
      default: "pending",
      required: true,
    },
    paymentMethod: { type: String, required: true },
    purchaseDate: { type: Date, required: true, index: true },
    notes: { type: String },
  },
  { timestamps: true },
);

PurchaseRecordSchema.index({ millId: 1, purchaseId: 1 }, { unique: true });

const PurchaseRecord: Model<IPurchaseRecord> =
  mongoose.models.PurchaseRecord ||
  mongoose.model<IPurchaseRecord>("PurchaseRecord", PurchaseRecordSchema);

export default PurchaseRecord;

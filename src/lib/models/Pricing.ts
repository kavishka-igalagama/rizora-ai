import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IPricing extends Document {
  _id: Types.ObjectId;
  millId: string;
  region: string;
  variety: string;
  qualityGrade: "Grade A" | "Grade B" | "Grade C" | "Grade D";
  pricePerKg: number;
  isActive: boolean;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const PricingSchema: Schema<IPricing> = new Schema(
  {
    millId: { type: String, required: true, index: true },
    region: { type: String, required: true },
    variety: { type: String, required: true },
    qualityGrade: {
      type: String,
      enum: ["Grade A", "Grade B", "Grade C", "Grade D"],
      required: true,
    },
    pricePerKg: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    notes: { type: String },
  },
  { timestamps: true },
);

const Pricing: Model<IPricing> =
  mongoose.models.Pricing || mongoose.model<IPricing>("Pricing", PricingSchema);

export default Pricing;

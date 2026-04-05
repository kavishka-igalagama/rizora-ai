import mongoose, { Document, Model, Schema } from "mongoose";

export interface IDiseaseScan extends Document {
  clerkId?: string | null;
  disease: string;
  confidence: number;
  treatmentSuggestions: string[];
  imageUrl: string;
  imagePublicId: string;
  imageFormat?: string;
  imageBytes?: number;
  imageWidth?: number;
  imageHeight?: number;
  createdAt: Date;
  updatedAt: Date;
}

const DiseaseScanSchema: Schema<IDiseaseScan> = new Schema(
  {
    clerkId: {
      type: String,
      index: true,
      default: null,
    },
    disease: {
      type: String,
      required: true,
      trim: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    treatmentSuggestions: {
      type: [String],
      required: true,
      default: [],
    },
    imageUrl: {
      type: String,
      required: true,
    },
    imagePublicId: {
      type: String,
      required: true,
      index: true,
    },
    imageFormat: {
      type: String,
    },
    imageBytes: {
      type: Number,
    },
    imageWidth: {
      type: Number,
    },
    imageHeight: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

DiseaseScanSchema.index({ clerkId: 1, createdAt: -1 });

const DiseaseScan: Model<IDiseaseScan> =
  mongoose.models.DiseaseScan ||
  mongoose.model<IDiseaseScan>("DiseaseScan", DiseaseScanSchema);

export default DiseaseScan;

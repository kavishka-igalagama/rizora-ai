import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAdvisory extends Document {
  advisoryId: string;
  title: string;
  content: string;
  disease: string;
  published: boolean;
  publishedDate: string;
  author: string;
  authorClerkId: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdvisorySchema: Schema<IAdvisory> = new Schema(
  {
    advisoryId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    disease: {
      type: String,
      required: true,
      trim: true,
      default: "General",
    },
    published: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedDate: {
      type: String,
      required: true,
      default: () => new Date().toISOString().slice(0, 10),
    },
    author: {
      type: String,
      required: true,
      trim: true,
      default: "Officer",
    },
    authorClerkId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

AdvisorySchema.index({ publishedDate: -1, createdAt: -1 });

const Advisory: Model<IAdvisory> =
  mongoose.models.Advisory ||
  mongoose.model<IAdvisory>("Advisory", AdvisorySchema);

export default Advisory;

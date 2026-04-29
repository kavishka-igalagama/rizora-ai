import mongoose, { Document, Model, Schema } from "mongoose";

export type NotificationType = "alert" | "market" | "message" | "system";

export interface INotification extends Document {
  clerkId: string;
  type: NotificationType;
  title: string;
  description: string;
  read: boolean;
  metadata?: {
    scanId?: string;
    disease?: string;
    confidence?: number;
    imageUrl?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema<INotification> = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["alert", "market", "message", "system"],
      default: "alert",
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      scanId: {
        type: String,
      },
      disease: {
        type: String,
      },
      confidence: {
        type: Number,
      },
      imageUrl: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  },
);

NotificationSchema.index({ clerkId: 1, createdAt: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;

import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IField {
  _id: Types.ObjectId;
  name: string;
  location: string;
  area: string;
  status: "Active" | "Fallow" | "Preparing";
  soilType: string;
  currentCrop?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPlantingRecord {
  _id: Types.ObjectId;
  field: string;
  variety: string;
  date: Date;
  area: string;
  status: "Growing" | "Harvested" | "Preparing";
  progress?: number;
  expectedHarvest?: Date;
  seedQuantity?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IFertilizerRecord {
  _id: Types.ObjectId;
  field: string;
  type: string;
  quantity: string;
  date: Date;
  cost: number;
  stage?: string;
  method?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IHarvestRecord {
  _id: Types.ObjectId;
  field: string;
  date: Date;
  yield: number;
  quality: "Grade A" | "Grade B" | "Grade C";
  revenue?: number;
  pricePerKg?: number;
  moisture?: string;
  variety?: string;
  soldTo?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPaddyRecord extends Document {
  clerkId: string;
  season?: string;
  farmName?: string;
  fields: IField[];
  plantings: IPlantingRecord[];
  fertilizerApplications: IFertilizerRecord[];
  harvests: IHarvestRecord[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const fieldSchema = new Schema<IField>(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    area: { type: String, required: true },
    status: {
      type: String,
      enum: ["Active", "Fallow", "Preparing"],
      default: "Active",
    },
    soilType: { type: String, required: true },
    currentCrop: { type: String },
  },
  { timestamps: true },
);

const plantingSchema = new Schema<IPlantingRecord>(
  {
    field: { type: String, required: true },
    variety: { type: String, required: true },
    date: { type: Date, required: true },
    area: { type: String, required: true },
    status: {
      type: String,
      enum: ["Growing", "Harvested", "Preparing"],
      default: "Growing",
    },
    progress: { type: Number, min: 0, max: 100 },
    expectedHarvest: { type: Date },
    seedQuantity: { type: String },
    notes: { type: String },
  },
  { timestamps: true },
);

const fertilizerSchema = new Schema<IFertilizerRecord>(
  {
    field: { type: String, required: true },
    type: { type: String, required: true },
    quantity: { type: String, required: true },
    date: { type: Date, required: true },
    cost: { type: Number, required: true },
    stage: { type: String },
    method: { type: String },
    notes: { type: String },
  },
  { timestamps: true },
);

const harvestSchema = new Schema<IHarvestRecord>(
  {
    field: { type: String, required: true },
    date: { type: Date, required: true },
    yield: { type: Number, required: true },
    quality: {
      type: String,
      enum: ["Grade A", "Grade B", "Grade C"],
      default: "Grade B",
    },
    revenue: { type: Number },
    pricePerKg: { type: Number },
    moisture: { type: String },
    variety: { type: String },
    soldTo: { type: String },
    notes: { type: String },
  },
  { timestamps: true },
);

const PaddyRecordSchema = new Schema<IPaddyRecord>(
  {
    clerkId: { type: String, required: true, index: true },
    season: { type: String },
    farmName: { type: String },
    fields: { type: [fieldSchema], default: [] },
    plantings: { type: [plantingSchema], default: [] },
    fertilizerApplications: { type: [fertilizerSchema], default: [] },
    harvests: { type: [harvestSchema], default: [] },
    notes: { type: String },
  },
  { timestamps: true },
);

const PaddyRecord: Model<IPaddyRecord> =
  mongoose.models.PaddyRecord ||
  mongoose.model<IPaddyRecord>("PaddyRecord", PaddyRecordSchema);

export default PaddyRecord;

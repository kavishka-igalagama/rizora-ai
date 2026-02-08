"use server";

import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import PaddyRecord, { IField, IPlantingRecord } from "@/lib/models/PaddyRecord";

interface FieldsData {
  name: string;
  location: string;
  area: string;
  status: "Active" | "Fallow" | "Preparing";
  soilType: string;
  currentCrop?: string;
}

interface PlantingData {
  field: string;
  variety: string;
  date: string;
  area: string;
  status?: "Growing" | "Harvested" | "Preparing";
  expectedHarvest?: string;
  seedQuantity?: string;
  notes?: string;
}

interface PlantingRecordResponse {
  id: string;
  field: string;
  variety: string;
  date: string;
  area: string;
  status: "Growing" | "Harvested" | "Preparing";
  progress: number;
  expectedHarvest?: string;
  seedQuantity?: string;
  notes?: string;
}

const parseDateOnly = (value?: string) => {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateOnly = (value?: Date) => {
  if (!value) return "";
  return value.toISOString().split("T")[0] ?? "";
};

const computeGrowthProgress = (
  plantedOn?: Date,
  expectedHarvest?: Date,
  status?: "Growing" | "Harvested" | "Preparing",
) => {
  if (status === "Harvested") return 100;
  if (!plantedOn || !expectedHarvest) return 0;

  const start = plantedOn.getTime();
  const end = expectedHarvest.getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return 0;
  }

  const now = Date.now();
  if (now >= end) return 100;
  if (now <= start) return 0;

  const progress = ((now - start) / (end - start)) * 100;
  return Math.max(0, Math.min(100, Math.round(progress)));
};

const normalizePlantingRecord = (
  record: IPlantingRecord,
): PlantingRecordResponse => {
  const progress = computeGrowthProgress(
    record.date,
    record.expectedHarvest,
    record.status ?? "Growing",
  );
  const resolvedStatus =
    progress >= 100 ? "Harvested" : (record.status ?? "Growing");

  return {
    id: record._id.toString(),
    field: record.field,
    variety: record.variety,
    date: formatDateOnly(record.date),
    area: record.area,
    status: resolvedStatus,
    progress,
    expectedHarvest: record.expectedHarvest
      ? formatDateOnly(record.expectedHarvest)
      : "",
    seedQuantity: record.seedQuantity ?? "",
    notes: record.notes ?? "",
  };
};

// Field Management Actions
export async function addNewField(
  data: FieldsData,
): Promise<{ success: boolean; error?: string; field?: IField }> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();
    if (
      !data.name ||
      !data.location ||
      !data.area ||
      !data.soilType ||
      !data.status
    ) {
      return { success: false, error: "Missing required field details" };
    }

    // Ensure the user has a record and append the field
    let record = await PaddyRecord.findOne({ clerkId: userId });
    if (!record) {
      record = await PaddyRecord.create({
        clerkId: userId,
        fields: [],
        plantings: [],
        fertilizerApplications: [],
        harvests: [],
      });
    }

    record.fields.push({
      name: data.name,
      location: data.location,
      area: data.area,
      status: data.status,
      soilType: data.soilType,
      currentCrop: data.currentCrop,
    } as IField);

    await record.save();

    const savedField = record.fields[record.fields.length - 1];

    return {
      success: true,
      field: JSON.parse(JSON.stringify(savedField)) as IField,
    };
  } catch (error: any) {
    console.error("Error adding new field:", error);
    return { success: false, error: error?.message || "Failed to add field" };
  }
}

export async function getFields(): Promise<{
  success: boolean;
  error?: string;
  fields?: IField[];
}> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();
    const record = await PaddyRecord.findOne({ clerkId: userId }).lean();

    return {
      success: true,
      fields: JSON.parse(JSON.stringify(record?.fields ?? [])) as IField[],
    };
  } catch (error: any) {
    console.error("Error fetching fields:", error);
    return {
      success: false,
      error: error?.message || "Failed to fetch fields",
    };
  }
}

export async function updateField(
  fieldId: string,
  data: FieldsData,
): Promise<{ success: boolean; error?: string; field?: IField }> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();
    if (
      !data.name ||
      !data.location ||
      !data.area ||
      !data.soilType ||
      !data.status
    ) {
      return { success: false, error: "Missing required field details" };
    }

    const record = await PaddyRecord.findOneAndUpdate(
      { clerkId: userId, "fields._id": fieldId },
      {
        $set: {
          "fields.$.name": data.name,
          "fields.$.location": data.location,
          "fields.$.area": data.area,
          "fields.$.status": data.status,
          "fields.$.soilType": data.soilType,
          "fields.$.currentCrop": data.currentCrop,
        },
      },
      { new: true },
    ).lean();

    if (!record) {
      return { success: false, error: "Record or field not found" };
    }

    const fields = (record as { fields: IField[] }).fields;
    const updated = fields.find((f) => String(f._id) === String(fieldId));
    return {
      success: true,
      field: updated
        ? (JSON.parse(JSON.stringify(updated)) as IField)
        : undefined,
    };
  } catch (error: any) {
    console.error("Error updating field:", error);
    return {
      success: false,
      error: error?.message || "Failed to update field",
    };
  }
}

export async function deleteField(
  fieldId: string,
): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();
    const record = await PaddyRecord.findOne({ clerkId: userId }).lean();
    if (!record) {
      return { success: false, error: "Record not found" };
    }
    const fields = (record as { fields: IField[] }).fields ?? [];
    const hasField = fields.some((f) => String(f._id) === String(fieldId));
    if (!hasField) {
      return { success: false, error: "Field not found" };
    }

    const objectId = mongoose.Types.ObjectId.isValid(fieldId)
      ? new mongoose.Types.ObjectId(fieldId)
      : fieldId;

    await PaddyRecord.findOneAndUpdate(
      { clerkId: userId },
      { $pull: { fields: { _id: objectId } } },
    );
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting field:", error);
    return {
      success: false,
      error: error?.message || "Failed to delete field",
    };
  }
}

// Planting Record Actions
export async function addPlantingRecord(data: PlantingData): Promise<{
  success: boolean;
  error?: string;
  planting?: PlantingRecordResponse;
}> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();

    if (!data.field || !data.variety || !data.date || !data.area) {
      return { success: false, error: "Missing required planting details" };
    }

    const plantingDate = parseDateOnly(data.date);
    const expectedHarvest = parseDateOnly(data.expectedHarvest);
    if (!plantingDate) {
      return { success: false, error: "Invalid planting date" };
    }

    let record = await PaddyRecord.findOne({ clerkId: userId });
    if (!record) {
      record = await PaddyRecord.create({
        clerkId: userId,
        fields: [],
        plantings: [],
        fertilizerApplications: [],
        harvests: [],
      });
    }

    const status = data.status ?? "Growing";
    const progress = computeGrowthProgress(
      plantingDate,
      expectedHarvest ?? undefined,
      status,
    );
    const resolvedStatus = progress >= 100 ? "Harvested" : status;

    record.plantings.push({
      field: data.field,
      variety: data.variety,
      date: plantingDate,
      area: data.area,
      status: resolvedStatus,
      progress,
      expectedHarvest: expectedHarvest ?? undefined,
      seedQuantity: data.seedQuantity,
      notes: data.notes,
    } as IPlantingRecord);

    await record.save();

    const saved = record.plantings[record.plantings.length - 1];
    return {
      success: true,
      planting: normalizePlantingRecord(saved as IPlantingRecord),
    };
  } catch (error: any) {
    console.error("Error adding planting record:", error);
    return {
      success: false,
      error: error?.message || "Failed to add planting record",
    };
  }
}

export async function getPlantingRecords(): Promise<{
  success: boolean;
  error?: string;
  plantings?: PlantingRecordResponse[];
}> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();
    const record = await PaddyRecord.findOne({ clerkId: userId }).lean();
    const plantings =
      (record as { plantings?: IPlantingRecord[] })?.plantings ?? [];

    return {
      success: true,
      plantings: plantings.map((p) => normalizePlantingRecord(p)),
    };
  } catch (error: any) {
    console.error("Error fetching planting records:", error);
    return {
      success: false,
      error: error?.message || "Failed to fetch planting records",
    };
  }
}

export async function updatePlantingRecord(
  plantingId: string,
  data: PlantingData,
): Promise<{
  success: boolean;
  error?: string;
  planting?: PlantingRecordResponse;
}> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();

    if (!data.field || !data.variety || !data.date || !data.area) {
      return { success: false, error: "Missing required planting details" };
    }

    const plantingDate = parseDateOnly(data.date);
    const expectedHarvest = parseDateOnly(data.expectedHarvest);
    if (!plantingDate) {
      return { success: false, error: "Invalid planting date" };
    }

    const record = await PaddyRecord.findOne({ clerkId: userId });
    if (!record) {
      return { success: false, error: "Record not found" };
    }

    const planting = record.plantings.find(
      (p) => String(p._id) === String(plantingId),
    );
    if (!planting) {
      return { success: false, error: "Planting record not found" };
    }

    planting.field = data.field;
    planting.variety = data.variety;
    planting.date = plantingDate;
    planting.area = data.area;
    planting.status = data.status ?? planting.status ?? "Growing";
    planting.expectedHarvest = expectedHarvest ?? undefined;
    planting.seedQuantity = data.seedQuantity ?? "";
    planting.notes = data.notes ?? "";
    planting.progress = computeGrowthProgress(
      planting.date,
      planting.expectedHarvest ?? undefined,
      planting.status,
    );
    if (planting.progress >= 100) {
      planting.status = "Harvested";
    }

    await record.save();

    return {
      success: true,
      planting: normalizePlantingRecord(planting as IPlantingRecord),
    };
  } catch (error: any) {
    console.error("Error updating planting record:", error);
    return {
      success: false,
      error: error?.message || "Failed to update planting record",
    };
  }
}

export async function deletePlantingRecord(
  plantingId: string,
): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();
    const objectId = mongoose.Types.ObjectId.isValid(plantingId)
      ? new mongoose.Types.ObjectId(plantingId)
      : plantingId;

    const record = await PaddyRecord.findOneAndUpdate(
      { clerkId: userId },
      { $pull: { plantings: { _id: objectId } } },
      { new: true },
    );

    if (!record) {
      return { success: false, error: "Record not found" };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting planting record:", error);
    return {
      success: false,
      error: error?.message || "Failed to delete planting record",
    };
  }
}

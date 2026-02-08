"use server";

import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import PaddyRecord, { IField } from "@/lib/models/PaddyRecord";

interface FieldsData {
  name: string;
  location: string;
  area: string;
  status: "Active" | "Fallow" | "Preparing";
  soilType: string;
  currentCrop?: string;
}

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

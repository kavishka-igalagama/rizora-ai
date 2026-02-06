"use server";

import { auth } from "@clerk/nextjs/server";
import { Types } from "mongoose";
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

export async function addNewField(
  data: FieldsData,
): Promise<{ success: boolean; error?: string; field?: IField }> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  if (!data) {
    return { success: false, error: "Invalid field data" };
  }

  if (
    !data.name ||
    !data.location ||
    !data.area ||
    !data.soilType ||
    !data.status
  ) {
    return {
      success: false,
      error: "All required field data must be provided",
    };
  }

  const { name, location, area, status, soilType, currentCrop } = data ?? {};

  try {
    await connectDB();

    const newField: IField = {
      _id: new Types.ObjectId(),
      name,
      location,
      area,
      status,
      soilType,
      currentCrop,
    };

    await PaddyRecord.findOneAndUpdate(
      { clerkId: userId },
      {
        $setOnInsert: { clerkId: userId },
        $push: { fields: newField },
      },
      { upsert: true },
    );

    return { success: true, field: newField };
  } catch (error) {
    console.error("Error adding new field:", error);
    return { success: false, error: "Server error" };
  }
}

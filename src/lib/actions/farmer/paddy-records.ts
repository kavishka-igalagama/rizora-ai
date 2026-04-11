"use server";

import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import PaddyRecord, {
  IField,
  IFertilizerRecord,
  IHarvestRecord,
  IPlantingRecord,
} from "@/lib/models/PaddyRecord";
import { normalizeRiceVariety } from "@/lib/rice-varieties";

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
  progress?: number;
  expectedHarvest?: string;
  seedQuantity?: string;
  notes?: string;
}

interface FertilizerData {
  field: string;
  type: string;
  quantity: string;
  date: string;
  cost: number;
  stage?: string;
  method?: string;
  notes?: string;
}

interface HarvestData {
  field: string;
  date: string;
  yield: number;
  quality: "Grade A" | "Grade B" | "Grade C";
  revenue?: number;
  pricePerKg?: number;
  moisture?: string;
  variety?: string;
  soldTo?: string;
  notes?: string;
}

const toValidDate = (value?: string | Date) => {
  if (!value) return undefined;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const parseDateValue = (value?: string | Date) => toValidDate(value);

const clampPercent = (value: number) =>
  Math.min(100, Math.max(0, Math.round(value)));

const calculateGrowthProgress = (
  record: IPlantingRecord,
  now: Date = new Date(),
) => {
  if (record.status === "Harvested") return 100;

  const plantedOn = toValidDate(record.date);
  const harvestOn = toValidDate(record.expectedHarvest);

  if (!plantedOn || !harvestOn || harvestOn <= plantedOn) {
    return clampPercent(record.progress ?? 0);
  }

  const totalMs = harvestOn.getTime() - plantedOn.getTime();
  const elapsedMs = now.getTime() - plantedOn.getTime();
  const percent = (elapsedMs / totalMs) * 100;

  return clampPercent(percent);
};

const parseNumberValue = (value?: number) => {
  if (typeof value !== "number") return undefined;
  return Number.isFinite(value) ? value : undefined;
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const getOrCreateRecord = async (userId: string) => {
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
  return record;
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
    const record = await getOrCreateRecord(userId);

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
  } catch (error: unknown) {
    console.error("Error adding new field:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Failed to add field"),
    };
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
  } catch (error: unknown) {
    console.error("Error fetching fields:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Failed to fetch fields"),
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
  } catch (error: unknown) {
    console.error("Error updating field:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Failed to update field"),
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
  } catch (error: unknown) {
    console.error("Error deleting field:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Failed to delete field"),
    };
  }
}

export async function addPlantingRecord(
  data: PlantingData,
): Promise<{ success: boolean; error?: string; record?: IPlantingRecord }> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();
    if (!data.field || !data.variety || !data.date || !data.area) {
      return { success: false, error: "Missing required planting details" };
    }

    const normalizedVariety = normalizeRiceVariety(data.variety);
    if (!normalizedVariety) {
      return { success: false, error: "Invalid rice variety" };
    }

    const plantingDate = parseDateValue(data.date);
    if (!plantingDate) {
      return { success: false, error: "Invalid planting date" };
    }

    const expectedHarvest = parseDateValue(data.expectedHarvest);
    const record = await getOrCreateRecord(userId);

    record.plantings.push({
      field: data.field,
      variety: normalizedVariety,
      date: plantingDate,
      area: data.area,
      status: data.status ?? "Growing",
      progress: data.progress ?? 0,
      expectedHarvest,
      seedQuantity: data.seedQuantity || undefined,
      notes: data.notes || undefined,
    } as IPlantingRecord);

    await record.save();
    const saved = record.plantings[record.plantings.length - 1];

    return {
      success: true,
      record: JSON.parse(JSON.stringify(saved)) as IPlantingRecord,
    };
  } catch (error: unknown) {
    console.error("Error adding planting record:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Failed to add planting record"),
    };
  }
}

export async function getPlantingRecords(): Promise<{
  success: boolean;
  error?: string;
  records?: IPlantingRecord[];
}> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();
    const record = await PaddyRecord.findOne({ clerkId: userId });

    if (!record) {
      return { success: true, records: [] };
    }

    const now = new Date();
    let hasAutoHarvestUpdates = false;

    record.plantings.forEach((planting) => {
      const computedProgress = calculateGrowthProgress(planting, now);
      const shouldHarvest = computedProgress >= 100;

      if (shouldHarvest && planting.status !== "Harvested") {
        planting.status = "Harvested";
        hasAutoHarvestUpdates = true;
      }

      if (shouldHarvest && (planting.progress ?? 0) !== 100) {
        planting.progress = 100;
        hasAutoHarvestUpdates = true;
      }
    });

    if (hasAutoHarvestUpdates) {
      await record.save();
    }

    return {
      success: true,
      records: JSON.parse(
        JSON.stringify(record.plantings ?? []),
      ) as IPlantingRecord[],
    };
  } catch (error: unknown) {
    console.error("Error fetching planting records:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Failed to fetch planting records"),
    };
  }
}

export async function updatePlantingRecord(
  recordId: string,
  data: PlantingData,
): Promise<{ success: boolean; error?: string; record?: IPlantingRecord }> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();
    if (!data.field || !data.variety || !data.date || !data.area) {
      return { success: false, error: "Missing required planting details" };
    }

    const normalizedVariety = normalizeRiceVariety(data.variety);
    if (!normalizedVariety) {
      return { success: false, error: "Invalid rice variety" };
    }

    const plantingDate = parseDateValue(data.date);
    if (!plantingDate) {
      return { success: false, error: "Invalid planting date" };
    }

    const expectedHarvest = parseDateValue(data.expectedHarvest);
    const expectedHarvestProvided = data.expectedHarvest !== undefined;
    const updateSet: Record<string, unknown> = {
      "plantings.$.field": data.field,
      "plantings.$.variety": normalizedVariety,
      "plantings.$.date": plantingDate,
      "plantings.$.area": data.area,
    };
    const statusIsHarvested = data.status === "Harvested";
    const shouldHarvestFromProgress =
      typeof data.progress === "number" && data.progress >= 100;

    if (statusIsHarvested || shouldHarvestFromProgress) {
      updateSet["plantings.$.status"] = "Harvested";
      updateSet["plantings.$.progress"] = 100;
    } else {
      if (data.status) {
        updateSet["plantings.$.status"] = data.status;
      }

      if (typeof data.progress === "number") {
        updateSet["plantings.$.progress"] = clampPercent(data.progress);
      }
    }

    if (expectedHarvestProvided && expectedHarvest) {
      const autoProgress = calculateGrowthProgress({
        date: plantingDate,
        expectedHarvest,
        status: "Growing",
        progress:
          typeof data.progress === "number"
            ? clampPercent(data.progress)
            : updateSet["plantings.$.progress"] || 0,
        field: data.field,
        variety: normalizedVariety,
        area: data.area,
      } as unknown as IPlantingRecord);

      if (autoProgress >= 100) {
        updateSet["plantings.$.status"] = "Harvested";
        updateSet["plantings.$.progress"] = 100;
      } else {
        updateSet["plantings.$.status"] = "Growing";
        updateSet["plantings.$.progress"] = autoProgress;
      }
    }

    const unset: Record<string, unknown> = {};
    if (expectedHarvest) {
      updateSet["plantings.$.expectedHarvest"] = expectedHarvest;
    } else if (data.expectedHarvest !== undefined) {
      unset["plantings.$.expectedHarvest"] = "";
    }

    if (data.seedQuantity) {
      updateSet["plantings.$.seedQuantity"] = data.seedQuantity;
    } else if (data.seedQuantity !== undefined) {
      unset["plantings.$.seedQuantity"] = "";
    }

    if (data.notes) {
      updateSet["plantings.$.notes"] = data.notes;
    } else if (data.notes !== undefined) {
      unset["plantings.$.notes"] = "";
    }

    const updateDoc: Record<string, unknown> = { $set: updateSet };
    if (Object.keys(unset).length) {
      updateDoc.$unset = unset;
    }

    const record = await PaddyRecord.findOneAndUpdate(
      { clerkId: userId, "plantings._id": recordId },
      updateDoc,
      { new: true },
    ).lean();

    if (!record) {
      return { success: false, error: "Record not found" };
    }

    const records = (record as { plantings: IPlantingRecord[] }).plantings;
    const updated = records.find((r) => String(r._id) === String(recordId));
    return {
      success: true,
      record: updated
        ? (JSON.parse(JSON.stringify(updated)) as IPlantingRecord)
        : undefined,
    };
  } catch (error: unknown) {
    console.error("Error updating planting record:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Failed to update planting record"),
    };
  }
}

export async function deletePlantingRecord(
  recordId: string,
): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();
    const objectId = mongoose.Types.ObjectId.isValid(recordId)
      ? new mongoose.Types.ObjectId(recordId)
      : recordId;

    await PaddyRecord.findOneAndUpdate(
      { clerkId: userId },
      { $pull: { plantings: { _id: objectId } } },
    );
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting planting record:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Failed to delete planting record"),
    };
  }
}

export async function addFertilizerRecord(
  data: FertilizerData,
): Promise<{ success: boolean; error?: string; record?: IFertilizerRecord }> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();
    if (!data.field || !data.type || !data.quantity || !data.date) {
      return { success: false, error: "Missing required fertilizer details" };
    }

    const cost = parseNumberValue(data.cost);
    if (cost === undefined) {
      return { success: false, error: "Invalid fertilizer cost" };
    }

    const applicationDate = parseDateValue(data.date);
    if (!applicationDate) {
      return { success: false, error: "Invalid application date" };
    }

    const record = await getOrCreateRecord(userId);

    record.fertilizerApplications.push({
      field: data.field,
      type: data.type,
      quantity: data.quantity,
      date: applicationDate,
      cost,
      stage: data.stage || undefined,
      method: data.method || undefined,
      notes: data.notes || undefined,
    } as IFertilizerRecord);

    await record.save();
    const saved =
      record.fertilizerApplications[record.fertilizerApplications.length - 1];

    return {
      success: true,
      record: JSON.parse(JSON.stringify(saved)) as IFertilizerRecord,
    };
  } catch (error: unknown) {
    console.error("Error adding fertilizer record:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Failed to add fertilizer record"),
    };
  }
}

export async function getFertilizerRecords(): Promise<{
  success: boolean;
  error?: string;
  records?: IFertilizerRecord[];
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
      records: JSON.parse(
        JSON.stringify(record?.fertilizerApplications ?? []),
      ) as IFertilizerRecord[],
    };
  } catch (error: unknown) {
    console.error("Error fetching fertilizer records:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Failed to fetch fertilizer records"),
    };
  }
}

export async function updateFertilizerRecord(
  recordId: string,
  data: FertilizerData,
): Promise<{ success: boolean; error?: string; record?: IFertilizerRecord }> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();
    if (!data.field || !data.type || !data.quantity || !data.date) {
      return { success: false, error: "Missing required fertilizer details" };
    }

    const cost = parseNumberValue(data.cost);
    if (cost === undefined) {
      return { success: false, error: "Invalid fertilizer cost" };
    }

    const applicationDate = parseDateValue(data.date);
    if (!applicationDate) {
      return { success: false, error: "Invalid application date" };
    }

    const updateSet: Record<string, unknown> = {
      "fertilizerApplications.$.field": data.field,
      "fertilizerApplications.$.type": data.type,
      "fertilizerApplications.$.quantity": data.quantity,
      "fertilizerApplications.$.date": applicationDate,
      "fertilizerApplications.$.cost": cost,
    };

    const unset: Record<string, unknown> = {};
    if (data.stage) {
      updateSet["fertilizerApplications.$.stage"] = data.stage;
    } else if (data.stage !== undefined) {
      unset["fertilizerApplications.$.stage"] = "";
    }

    if (data.method) {
      updateSet["fertilizerApplications.$.method"] = data.method;
    } else if (data.method !== undefined) {
      unset["fertilizerApplications.$.method"] = "";
    }

    if (data.notes) {
      updateSet["fertilizerApplications.$.notes"] = data.notes;
    } else if (data.notes !== undefined) {
      unset["fertilizerApplications.$.notes"] = "";
    }

    const updateDoc: Record<string, unknown> = { $set: updateSet };
    if (Object.keys(unset).length) {
      updateDoc.$unset = unset;
    }

    const record = await PaddyRecord.findOneAndUpdate(
      { clerkId: userId, "fertilizerApplications._id": recordId },
      updateDoc,
      { new: true },
    ).lean();

    if (!record) {
      return { success: false, error: "Record not found" };
    }

    const records = (record as { fertilizerApplications: IFertilizerRecord[] })
      .fertilizerApplications;
    const updated = records.find((r) => String(r._id) === String(recordId));
    return {
      success: true,
      record: updated
        ? (JSON.parse(JSON.stringify(updated)) as IFertilizerRecord)
        : undefined,
    };
  } catch (error: unknown) {
    console.error("Error updating fertilizer record:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Failed to update fertilizer record"),
    };
  }
}

export async function deleteFertilizerRecord(
  recordId: string,
): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();
    const objectId = mongoose.Types.ObjectId.isValid(recordId)
      ? new mongoose.Types.ObjectId(recordId)
      : recordId;

    await PaddyRecord.findOneAndUpdate(
      { clerkId: userId },
      { $pull: { fertilizerApplications: { _id: objectId } } },
    );
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting fertilizer record:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Failed to delete fertilizer record"),
    };
  }
}

export async function addHarvestRecord(
  data: HarvestData,
): Promise<{ success: boolean; error?: string; record?: IHarvestRecord }> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();
    if (!data.field || !data.date || !data.quality) {
      return { success: false, error: "Missing required harvest details" };
    }

    const yieldValue = parseNumberValue(data.yield);
    if (yieldValue === undefined) {
      return { success: false, error: "Invalid harvest yield" };
    }

    const harvestDate = parseDateValue(data.date);
    if (!harvestDate) {
      return { success: false, error: "Invalid harvest date" };
    }

    const record = await getOrCreateRecord(userId);
    const normalizedVariety =
      typeof data.variety === "string" && data.variety
        ? normalizeRiceVariety(data.variety)
        : undefined;

    if (data.variety && !normalizedVariety) {
      return { success: false, error: "Invalid rice variety" };
    }

    record.harvests.push({
      field: data.field,
      date: harvestDate,
      yield: yieldValue,
      quality: data.quality,
      revenue: parseNumberValue(data.revenue),
      pricePerKg: parseNumberValue(data.pricePerKg),
      moisture: data.moisture || undefined,
      variety: normalizedVariety,
      soldTo: data.soldTo || undefined,
      notes: data.notes || undefined,
    } as IHarvestRecord);

    await record.save();
    const saved = record.harvests[record.harvests.length - 1];

    return {
      success: true,
      record: JSON.parse(JSON.stringify(saved)) as IHarvestRecord,
    };
  } catch (error: unknown) {
    console.error("Error adding harvest record:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Failed to add harvest record"),
    };
  }
}

export async function getHarvestRecords(): Promise<{
  success: boolean;
  error?: string;
  records?: IHarvestRecord[];
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
      records: JSON.parse(
        JSON.stringify(record?.harvests ?? []),
      ) as IHarvestRecord[],
    };
  } catch (error: unknown) {
    console.error("Error fetching harvest records:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Failed to fetch harvest records"),
    };
  }
}

export async function updateHarvestRecord(
  recordId: string,
  data: HarvestData,
): Promise<{ success: boolean; error?: string; record?: IHarvestRecord }> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();
    if (!data.field || !data.date || !data.quality) {
      return { success: false, error: "Missing required harvest details" };
    }

    const yieldValue = parseNumberValue(data.yield);
    if (yieldValue === undefined) {
      return { success: false, error: "Invalid harvest yield" };
    }

    const harvestDate = parseDateValue(data.date);
    if (!harvestDate) {
      return { success: false, error: "Invalid harvest date" };
    }

    const updateSet: Record<string, unknown> = {
      "harvests.$.field": data.field,
      "harvests.$.date": harvestDate,
      "harvests.$.yield": yieldValue,
      "harvests.$.quality": data.quality,
    };

    const unset: Record<string, unknown> = {};
    const revenue = parseNumberValue(data.revenue);
    if (revenue !== undefined) {
      updateSet["harvests.$.revenue"] = revenue;
    } else if (data.revenue !== undefined) {
      unset["harvests.$.revenue"] = "";
    }

    const pricePerKg = parseNumberValue(data.pricePerKg);
    if (pricePerKg !== undefined) {
      updateSet["harvests.$.pricePerKg"] = pricePerKg;
    } else if (data.pricePerKg !== undefined) {
      unset["harvests.$.pricePerKg"] = "";
    }

    if (data.moisture) {
      updateSet["harvests.$.moisture"] = data.moisture;
    } else if (data.moisture !== undefined) {
      unset["harvests.$.moisture"] = "";
    }

    if (data.variety) {
      const normalizedVariety = normalizeRiceVariety(data.variety);
      if (!normalizedVariety) {
        return { success: false, error: "Invalid rice variety" };
      }
      updateSet["harvests.$.variety"] = normalizedVariety;
    } else if (data.variety !== undefined) {
      unset["harvests.$.variety"] = "";
    }

    if (data.soldTo) {
      updateSet["harvests.$.soldTo"] = data.soldTo;
    } else if (data.soldTo !== undefined) {
      unset["harvests.$.soldTo"] = "";
    }

    if (data.notes) {
      updateSet["harvests.$.notes"] = data.notes;
    } else if (data.notes !== undefined) {
      unset["harvests.$.notes"] = "";
    }

    const updateDoc: Record<string, unknown> = { $set: updateSet };
    if (Object.keys(unset).length) {
      updateDoc.$unset = unset;
    }

    const record = await PaddyRecord.findOneAndUpdate(
      { clerkId: userId, "harvests._id": recordId },
      updateDoc,
      { new: true },
    ).lean();

    if (!record) {
      return { success: false, error: "Record not found" };
    }

    const records = (record as { harvests: IHarvestRecord[] }).harvests;
    const updated = records.find((r) => String(r._id) === String(recordId));
    return {
      success: true,
      record: updated
        ? (JSON.parse(JSON.stringify(updated)) as IHarvestRecord)
        : undefined,
    };
  } catch (error: unknown) {
    console.error("Error updating harvest record:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Failed to update harvest record"),
    };
  }
}

export async function deleteHarvestRecord(
  recordId: string,
): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();
    const objectId = mongoose.Types.ObjectId.isValid(recordId)
      ? new mongoose.Types.ObjectId(recordId)
      : recordId;

    await PaddyRecord.findOneAndUpdate(
      { clerkId: userId },
      { $pull: { harvests: { _id: objectId } } },
    );
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting harvest record:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Failed to delete harvest record"),
    };
  }
}

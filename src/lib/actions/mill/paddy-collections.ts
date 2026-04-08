"use server";

import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import PaddyCollection, {
  type CollectionBookingStatus,
  type CollectionPaymentMethod,
  type CollectionPaymentStatus,
  type CollectionQualityGrade,
  type IPaddyCollection,
} from "@/lib/models/PaddyCollection";
import PurchaseRecord from "@/lib/models/PurchaseRecord";

export interface MillPaddyCollection {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  location: string;
  district: string;
  variety: string;
  estimatedQuantity: number;
  actualQuantity?: number;
  moistureLevel?: number;
  qualityGrade?: CollectionQualityGrade;
  scheduledDate: string;
  scheduledTime: string;
  status: CollectionBookingStatus;
  paymentStatus: CollectionPaymentStatus;
  paymentMethod?: CollectionPaymentMethod;
  pricePerKg: number;
  totalAmount?: number;
  vehicleNumber?: string;
  driverName?: string;
  remarks?: string;
  collectedDate?: string;
  paidAmount?: number;
  createdAt: string;
}

interface AddPaddyCollectionInput {
  farmerName: string;
  farmerPhone: string;
  location: string;
  district: string;
  variety: string;
  estimatedQuantity: number;
  scheduledDate: string;
  scheduledTime: string;
  remarks?: string;
  pricePerKg: number;
}

interface SchedulePaddyCollectionInput {
  vehicleNumber: string;
  driverName: string;
  scheduledDate: string;
  scheduledTime: string;
}

interface RecordWeightInput {
  actualQuantity: number;
  moistureLevel: number;
  qualityGrade: CollectionQualityGrade;
  remarks?: string;
  collectedDate?: string;
}

interface RecordPaymentInput {
  amount: number;
  method: CollectionPaymentMethod;
}

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const formatDate = (value?: Date) =>
  value ? value.toISOString().slice(0, 10) : undefined;

const normalizeFarmerId = (farmerPhone: string) => {
  const digits = farmerPhone.replace(/\D/g, "");
  return digits ? `FRM-${digits}` : `FRM-${Date.now()}`;
};

const toDTO = (record: IPaddyCollection): MillPaddyCollection => ({
  id: String(record._id),
  farmerId: record.farmerId,
  farmerName: record.farmerName,
  farmerPhone: record.farmerPhone,
  location: record.location,
  district: record.district,
  variety: record.variety,
  estimatedQuantity: record.estimatedQuantity,
  actualQuantity: record.actualQuantity,
  moistureLevel: record.moistureLevel,
  qualityGrade: record.qualityGrade,
  scheduledDate: formatDate(record.scheduledDate) ?? "",
  scheduledTime: record.scheduledTime,
  status: record.status,
  paymentStatus: record.paymentStatus,
  paymentMethod: record.paymentMethod,
  pricePerKg: record.pricePerKg,
  totalAmount: record.totalAmount,
  vehicleNumber: record.vehicleNumber,
  driverName: record.driverName,
  remarks: record.remarks,
  collectedDate: formatDate(record.collectedDate),
  paidAmount: record.paidAmount,
  createdAt: formatDate(record.createdAt) ?? "",
});

const syncPurchaseRecord = async (
  millId: string,
  collection: IPaddyCollection,
  paymentStatus?: CollectionPaymentStatus,
) => {
  if (
    !collection.actualQuantity ||
    !collection.totalAmount ||
    !collection.qualityGrade
  ) {
    return;
  }

  const purchaseDate = collection.collectedDate ?? collection.scheduledDate;
  const purchaseId = String(collection._id);

  await PurchaseRecord.findOneAndUpdate(
    { millId, purchaseId },
    {
      $set: {
        farmerId: collection.farmerId,
        farmerName: collection.farmerName,
        farmerPhone: collection.farmerPhone,
        variety: collection.variety,
        quantity: collection.actualQuantity,
        qualityGrade: collection.qualityGrade,
        moistureLevel: collection.moistureLevel ?? 0,
        pricePerKg: collection.pricePerKg,
        totalAmount: collection.totalAmount,
        paymentStatus: paymentStatus ?? collection.paymentStatus,
        paymentMethod: collection.paymentMethod ?? "cash",
        purchaseDate,
        notes: collection.remarks,
      },
      $setOnInsert: {
        millId,
        purchaseId,
      },
    },
    { upsert: true, new: true },
  );
};

export async function getMillPaddyCollections(): Promise<{
  success: boolean;
  collections?: MillPaddyCollection[];
  error?: string;
}> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();
    const collections = await PaddyCollection.find({ millId: userId })
      .sort({ scheduledDate: -1, createdAt: -1 })
      .lean<IPaddyCollection[]>();

    return {
      success: true,
      collections: collections.map((collection) => toDTO(collection)),
    };
  } catch (error: unknown) {
    console.error("Error fetching paddy collections:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Failed to fetch paddy collections"),
    };
  }
}

export async function addPaddyCollection(
  data: AddPaddyCollectionInput,
): Promise<{
  success: boolean;
  collection?: MillPaddyCollection;
  error?: string;
}> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();

    if (
      !data.farmerName ||
      !data.farmerPhone ||
      !data.location ||
      !data.district ||
      !data.variety ||
      !data.scheduledDate ||
      !data.scheduledTime
    ) {
      return { success: false, error: "Missing required booking details" };
    }

    const scheduledDate = new Date(data.scheduledDate);
    if (Number.isNaN(scheduledDate.getTime())) {
      return { success: false, error: "Invalid scheduled date" };
    }

    const estimatedQuantity = Number(data.estimatedQuantity);
    const pricePerKg = Number(data.pricePerKg);

    if (!Number.isFinite(estimatedQuantity) || estimatedQuantity <= 0) {
      return {
        success: false,
        error: "Estimated quantity must be greater than 0",
      };
    }

    if (!Number.isFinite(pricePerKg) || pricePerKg <= 0) {
      return { success: false, error: "Price per kg must be greater than 0" };
    }

    const collection = await PaddyCollection.create({
      millId: userId,
      farmerId: normalizeFarmerId(data.farmerPhone),
      farmerName: data.farmerName,
      farmerPhone: data.farmerPhone,
      location: data.location,
      district: data.district,
      variety: data.variety,
      estimatedQuantity,
      scheduledDate,
      scheduledTime: data.scheduledTime,
      status: "pending",
      paymentStatus: "pending",
      paidAmount: 0,
      pricePerKg,
      remarks: data.remarks,
    });

    return { success: true, collection: toDTO(collection) };
  } catch (error: unknown) {
    console.error("Error adding paddy collection:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Failed to add paddy collection"),
    };
  }
}

export async function updatePaddyCollectionStatus(
  id: string,
  status: CollectionBookingStatus,
): Promise<{
  success: boolean;
  collection?: MillPaddyCollection;
  error?: string;
}> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();
    const updated = await PaddyCollection.findOneAndUpdate(
      { _id: id, millId: userId },
      { $set: { status } },
      { new: true },
    );

    if (!updated) {
      return { success: false, error: "Collection not found" };
    }

    return { success: true, collection: toDTO(updated) };
  } catch (error: unknown) {
    console.error("Error updating collection status:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Failed to update collection status"),
    };
  }
}

export async function schedulePaddyCollection(
  id: string,
  data: SchedulePaddyCollectionInput,
): Promise<{
  success: boolean;
  collection?: MillPaddyCollection;
  error?: string;
}> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();

    const scheduledDate = new Date(data.scheduledDate);
    if (Number.isNaN(scheduledDate.getTime())) {
      return { success: false, error: "Invalid scheduled date" };
    }

    const updated = await PaddyCollection.findOneAndUpdate(
      { _id: id, millId: userId },
      {
        $set: {
          vehicleNumber: data.vehicleNumber,
          driverName: data.driverName,
          scheduledDate,
          scheduledTime: data.scheduledTime,
          status: "approved",
        },
      },
      { new: true },
    );

    if (!updated) {
      return { success: false, error: "Collection not found" };
    }

    return { success: true, collection: toDTO(updated) };
  } catch (error: unknown) {
    console.error("Error scheduling paddy collection:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Failed to schedule pickup"),
    };
  }
}

export async function recordPaddyCollectionWeight(
  id: string,
  data: RecordWeightInput,
): Promise<{
  success: boolean;
  collection?: MillPaddyCollection;
  error?: string;
}> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();
    const collection = await PaddyCollection.findOne({
      _id: id,
      millId: userId,
    });

    if (!collection) {
      return { success: false, error: "Collection not found" };
    }

    const actualQuantity = Number(data.actualQuantity);
    const moistureLevel = Number(data.moistureLevel);

    if (!Number.isFinite(actualQuantity) || actualQuantity <= 0) {
      return {
        success: false,
        error: "Actual quantity must be greater than 0",
      };
    }

    if (
      !Number.isFinite(moistureLevel) ||
      moistureLevel < 0 ||
      moistureLevel > 100
    ) {
      return {
        success: false,
        error: "Moisture level must be between 0 and 100",
      };
    }

    const collectedDate = data.collectedDate
      ? new Date(data.collectedDate)
      : new Date();

    if (Number.isNaN(collectedDate.getTime())) {
      return { success: false, error: "Invalid collected date" };
    }

    collection.actualQuantity = actualQuantity;
    collection.moistureLevel = moistureLevel;
    collection.qualityGrade = data.qualityGrade;
    collection.remarks = data.remarks ?? collection.remarks;
    collection.totalAmount = actualQuantity * collection.pricePerKg;
    collection.collectedDate = collectedDate;
    collection.status = "completed";

    await collection.save();
    await syncPurchaseRecord(userId, collection);

    return { success: true, collection: toDTO(collection) };
  } catch (error: unknown) {
    console.error("Error recording collection weight:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Failed to record weight"),
    };
  }
}

export async function recordPaddyCollectionPayment(
  id: string,
  data: RecordPaymentInput,
): Promise<{
  success: boolean;
  collection?: MillPaddyCollection;
  error?: string;
}> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();
    const collection = await PaddyCollection.findOne({
      _id: id,
      millId: userId,
    });

    if (!collection) {
      return { success: false, error: "Collection not found" };
    }

    const total = collection.totalAmount ?? 0;
    if (total <= 0) {
      return { success: false, error: "Record weight before payment" };
    }

    const amount = Number(data.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return { success: false, error: "Payment amount must be greater than 0" };
    }

    const currentPaid = collection.paidAmount ?? 0;
    const newPaid = Math.min(total, currentPaid + amount);
    const paymentStatus: CollectionPaymentStatus =
      newPaid >= total ? "paid" : "partial";

    collection.paidAmount = newPaid;
    collection.paymentMethod = data.method;
    collection.paymentStatus = paymentStatus;

    await collection.save();
    await syncPurchaseRecord(userId, collection, paymentStatus);

    return { success: true, collection: toDTO(collection) };
  } catch (error: unknown) {
    console.error("Error recording collection payment:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Failed to record payment"),
    };
  }
}

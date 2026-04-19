"use server";

import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import PurchaseRecord, {
  type IPurchaseRecord,
  type PurchasePaymentStatus,
  type PurchaseQualityGrade,
} from "@/lib/models/PurchaseRecord";
import PaddyCollection from "@/lib/models/PaddyCollection";

export interface MillPurchaseRecord {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  variety: string;
  quantity: number;
  qualityGrade: PurchaseQualityGrade;
  moistureLevel: number;
  pricePerKg: number;
  totalAmount: number;
  paymentStatus: PurchasePaymentStatus;
  paymentMethod: string;
  purchaseDate: string;
  notes?: string;
}

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const toDTO = (record: IPurchaseRecord): MillPurchaseRecord => ({
  id: record.purchaseId,
  farmerId: record.farmerId,
  farmerName: record.farmerName,
  farmerPhone: record.farmerPhone,
  variety: record.variety,
  quantity: record.quantity,
  qualityGrade: record.qualityGrade,
  moistureLevel: record.moistureLevel,
  pricePerKg: record.pricePerKg,
  totalAmount: record.totalAmount,
  paymentStatus: record.paymentStatus,
  paymentMethod: record.paymentMethod,
  purchaseDate: record.purchaseDate.toISOString().slice(0, 10),
  notes: record.notes,
});

export async function getMillPurchaseRecords(): Promise<{
  success: boolean;
  records?: MillPurchaseRecord[];
  error?: string;
}> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();
    const records = await PurchaseRecord.find({ millId: userId })
      .sort({ purchaseDate: -1, createdAt: -1 })
      .lean<IPurchaseRecord[]>();

    return {
      success: true,
      records: records.map((record) => toDTO(record)),
    };
  } catch (error: unknown) {
    console.error("Error fetching purchase records:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Failed to fetch purchase records"),
    };
  }
}

export async function updatePurchasePaymentStatus(
  purchaseId: string,
  paymentStatus: PurchasePaymentStatus,
): Promise<{ success: boolean; record?: MillPurchaseRecord; error?: string }> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();
    const updated = await PurchaseRecord.findOneAndUpdate(
      { millId: userId, purchaseId },
      { $set: { paymentStatus } },
      { new: true },
    );

    if (!updated) {
      return { success: false, error: "Purchase record not found" };
    }

    const totalAmount = updated.totalAmount ?? 0;
    const paidAmount = paymentStatus === "paid" ? totalAmount : undefined;

    await PaddyCollection.findOneAndUpdate(
      { _id: purchaseId, millId: userId },
      {
        $set: {
          paymentStatus,
          ...(typeof paidAmount === "number" ? { paidAmount } : {}),
        },
      },
    );

    return { success: true, record: toDTO(updated) };
  } catch (error: unknown) {
    console.error("Error updating payment status:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Failed to update payment status"),
    };
  }
}

export async function markPurchaseAsPaid(
  purchaseId: string,
): Promise<{ success: boolean; record?: MillPurchaseRecord; error?: string }> {
  return updatePurchasePaymentStatus(purchaseId, "paid");
}

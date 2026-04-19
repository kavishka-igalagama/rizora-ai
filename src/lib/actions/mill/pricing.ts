"use server";

import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Pricing, { IPricing } from "@/lib/models/Pricing";
import { getCurrentUserDistrict } from "@/lib/auth";
import { publishMarketPricesUpdate } from "@/lib/market-prices-realtime";
import { normalizeRiceVariety } from "@/lib/rice-varieties";

export async function fetchCurrentUserDistrict(): Promise<{
  success: boolean;
  district?: string;
}> {
  const district = await getCurrentUserDistrict();
  return { success: true, district: district ?? undefined };
}

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

interface PricingData {
  region?: string;
  variety: string;
  qualityGrade: "Grade A" | "Grade B" | "Grade C" | "Grade D";
  pricePerKg: number;
  isActive: boolean;
  notes?: string;
}

export async function addNewPricing(
  data: PricingData,
): Promise<{ success: boolean; error?: string; field?: IPricing }> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();
    if (!data.variety || !data.qualityGrade || !data.pricePerKg) {
      return { success: false, error: "Missing required field details" };
    }

    const normalizedVariety = normalizeRiceVariety(data.variety);
    if (!normalizedVariety) {
      return { success: false, error: "Invalid rice variety" };
    }

    const region = data.region ?? (await getCurrentUserDistrict());
    if (!region) {
      return {
        success: false,
        error:
          "Region is required. Please complete your profile with a district in onboarding.",
      };
    }

    const pricing = await Pricing.create({
      millId: userId,
      region,
      variety: normalizedVariety,
      qualityGrade: data.qualityGrade,
      pricePerKg: data.pricePerKg,
      isActive: typeof data.isActive === "boolean" ? data.isActive : true,
      notes: data.notes,
    });

    await publishMarketPricesUpdate({
      action: "created",
      pricingId: pricing._id.toString(),
      millId: pricing.millId,
      updatedAt: pricing.updatedAt.toISOString(),
    });

    return {
      success: true,
      field: JSON.parse(JSON.stringify(pricing)) as IPricing,
    };
  } catch (error: unknown) {
    console.error("Error adding new pricing:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Failed to add pricing"),
    };
  }
}

export async function getPricings(): Promise<{
  success: boolean;
  pricings?: IPricing[];
  error?: string;
}> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();
    const pricings = await Pricing.find({ millId: userId })
      .sort({ updatedAt: -1 })
      .lean();
    return {
      success: true,
      pricings: JSON.parse(JSON.stringify(pricings)) as IPricing[],
    };
  } catch (error: unknown) {
    console.error("Error fetching pricings:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Failed to fetch pricings"),
    };
  }
}

interface UpdatePricingData {
  region?: string;
  variety?: string;
  qualityGrade?: "Grade A" | "Grade B" | "Grade C" | "Grade D";
  pricePerKg?: number;
  isActive?: boolean;
  notes?: string;
}

export async function updatePricing(
  id: string,
  data: UpdatePricingData,
): Promise<{ success: boolean; error?: string; field?: IPricing }> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();
    const normalizedVariety =
      typeof data.variety === "string"
        ? normalizeRiceVariety(data.variety)
        : undefined;

    if (typeof data.variety === "string" && !normalizedVariety) {
      return { success: false, error: "Invalid rice variety" };
    }

    const updates = {
      ...data,
      ...(normalizedVariety ? { variety: normalizedVariety } : {}),
    };

    const pricing = await Pricing.findOneAndUpdate(
      { _id: id, millId: userId },
      { $set: updates },
      { new: true },
    );
    if (!pricing) {
      return { success: false, error: "Pricing not found or access denied" };
    }

    await publishMarketPricesUpdate({
      action: "updated",
      pricingId: pricing._id.toString(),
      millId: pricing.millId,
      updatedAt: pricing.updatedAt.toISOString(),
    });

    return {
      success: true,
      field: JSON.parse(JSON.stringify(pricing)) as IPricing,
    };
  } catch (error: unknown) {
    console.error("Error updating pricing:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Failed to update pricing"),
    };
  }
}

export async function deletePricing(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();
    const result = await Pricing.findOneAndDelete({
      _id: id,
      millId: userId,
    });
    if (!result) {
      return { success: false, error: "Pricing not found or access denied" };
    }

    await publishMarketPricesUpdate({
      action: "deleted",
      pricingId: result._id.toString(),
      millId: result.millId,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting pricing:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Failed to delete pricing"),
    };
  }
}

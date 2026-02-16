"use server";

import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Pricing, { IPricing } from "@/lib/models/Pricing";
import { getCurrentUserDistrict } from "@/lib/auth";

export async function fetchCurrentUserDistrict(): Promise<{
  success: boolean;
  district?: string;
}> {
  const district = await getCurrentUserDistrict();
  return { success: true, district: district ?? undefined };
}

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
      variety: data.variety,
      qualityGrade: data.qualityGrade,
      pricePerKg: data.pricePerKg,
      isActive: typeof data.isActive === "boolean" ? data.isActive : true,
      notes: data.notes,
    });

    return {
      success: true,
      field: JSON.parse(JSON.stringify(pricing)) as IPricing,
    };
  } catch (error: any) {
    console.error("Error adding new pricing:", error);
    return { success: false, error: error?.message || "Failed to add pricing" };
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
  } catch (error: any) {
    console.error("Error fetching pricings:", error);
    return {
      success: false,
      error: error?.message || "Failed to fetch pricings",
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
    const pricing = await Pricing.findOneAndUpdate(
      { _id: id, millId: userId },
      { $set: data },
      { new: true },
    );
    if (!pricing) {
      return { success: false, error: "Pricing not found or access denied" };
    }
    return {
      success: true,
      field: JSON.parse(JSON.stringify(pricing)) as IPricing,
    };
  } catch (error: any) {
    console.error("Error updating pricing:", error);
    return {
      success: false,
      error: error?.message || "Failed to update pricing",
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
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting pricing:", error);
    return {
      success: false,
      error: error?.message || "Failed to delete pricing",
    };
  }
}

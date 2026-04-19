"use server";

import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Pricing from "@/lib/models/Pricing";
import User from "@/lib/models/User";
import { normalizeRiceVariety, type RiceVariety } from "@/lib/rice-varieties";

type KnownRole = "farmer" | "mill" | "officer" | "none";
type QualityGrade = "A" | "B" | "C" | "D";

interface OfficerDoc {
  clerkId: string;
  role?: KnownRole;
}

interface PriceDoc {
  _id: { toString: () => string };
  millId: string;
  region: string;
  variety: string;
  qualityGrade: "Grade A" | "Grade B" | "Grade C" | "Grade D";
  pricePerKg: number;
  isActive: boolean;
  updatedAt: Date;
}

interface MillDoc {
  clerkId: string;
  millName?: string;
  firstName?: string;
  lastName?: string;
}

export interface OfficerMillPriceItem {
  id: string;
  millId: string;
  millName: string;
  region: string;
  variety: RiceVariety;
  grade: QualityGrade;
  pricePerKg: number;
  previousPrice: number;
  isActive: boolean;
  lastUpdated: string;
}

function toGrade(qualityGrade: PriceDoc["qualityGrade"]): QualityGrade {
  return qualityGrade.replace("Grade ", "") as QualityGrade;
}

function getMillName(mill?: MillDoc): string {
  if (!mill) return "Unknown Mill";

  const fallback = `${mill.firstName || ""} ${mill.lastName || ""}`.trim();
  return mill.millName || fallback || "Unknown Mill";
}

export async function getOfficerMillPricings(): Promise<{
  success: boolean;
  prices?: OfficerMillPriceItem[];
  error?: string;
}> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();

    const officer = await User.findOne({ clerkId: userId })
      .select("clerkId role")
      .lean<OfficerDoc | null>();

    if (!officer || officer.role !== "officer") {
      return { success: false, error: "Forbidden" };
    }

    const pricings = await Pricing.find({})
      .sort({ updatedAt: -1 })
      .lean<PriceDoc[]>();

    const millIds = [...new Set(pricings.map((price) => price.millId))];
    const mills = await User.find({ clerkId: { $in: millIds } })
      .select("clerkId millName firstName lastName")
      .lean<MillDoc[]>();

    const millMap = new Map(mills.map((mill) => [mill.clerkId, mill]));

    const prices: OfficerMillPriceItem[] = pricings
      .map((p) => {
        const normalizedVariety = normalizeRiceVariety(p.variety);
        if (!normalizedVariety) return null;

        return {
          id: p._id.toString(),
          millId: p.millId,
          millName: getMillName(millMap.get(p.millId)),
          region: p.region,
          variety: normalizedVariety,
          grade: toGrade(p.qualityGrade),
          pricePerKg: p.pricePerKg,
          previousPrice: p.pricePerKg,
          isActive: p.isActive,
          lastUpdated: p.updatedAt.toISOString(),
        };
      })
      .filter((item): item is OfficerMillPriceItem => item !== null);

    return { success: true, prices };
  } catch (error) {
    console.error("Error fetching officer mill prices:", error);
    return { success: false, error: "Failed to fetch mill prices" };
  }
}

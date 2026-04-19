import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Advisory from "@/lib/models/Advisory";
import DiseaseScan from "@/lib/models/DiseaseScan";
import Pricing from "@/lib/models/Pricing";
import User from "@/lib/models/User";

type KnownRole = "farmer" | "mill" | "officer" | "none";

type OfficerDoc = {
  clerkId: string;
  role?: KnownRole;
  district?: string;
  assignedDistrict?: string;
};

type FarmerDoc = {
  clerkId: string;
  district?: string;
};

type ScanDoc = {
  clerkId?: string | null;
  disease: string;
  createdAt: Date;
};

type AdvisoryDoc = {
  advisoryId: string;
  title: string;
  disease?: string;
  publishedDate: string;
  createdAt: Date;
};

type PricingDoc = {
  variety?: string;
  pricePerKg: number;
  updatedAt: Date;
};

type Counter = {
  total: number;
  count: number;
  currentTotal: number;
  currentCount: number;
  previousTotal: number;
  previousCount: number;
};

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  await connectDB();

  const officer = await User.findOne({ clerkId: userId })
    .select("clerkId role district assignedDistrict")
    .lean<OfficerDoc | null>();

  if (!officer || officer.role !== "officer") {
    return new Response("Forbidden", { status: 403 });
  }

  const officerDistrict = officer.assignedDistrict || officer.district || null;

  const farmerQuery: Record<string, unknown> = { role: "farmer" };
  if (officerDistrict) {
    farmerQuery.district = officerDistrict;
  }

  const farmers = await User.find(farmerQuery)
    .select("clerkId district")
    .lean<FarmerDoc[]>();

  const farmerIds = farmers
    .map((farmer) => farmer.clerkId)
    .filter((value): value is string => Boolean(value));

  const farmerDistrictById = new Map(
    farmers.map((farmer) => [farmer.clerkId, farmer.district || "Unknown"]),
  );

  let scans: ScanDoc[] = [];
  if (!officerDistrict || farmerIds.length > 0) {
    const scanQuery: Record<string, unknown> = {};
    if (officerDistrict) {
      scanQuery.clerkId = { $in: farmerIds };
    }

    scans = await DiseaseScan.find(scanQuery)
      .select("clerkId disease createdAt")
      .lean<ScanDoc[]>();
  }

  const totalReports = scans.length;
  const totalFarmers = farmers.length;

  const millQuery: Record<string, unknown> = { role: "mill" };
  if (officerDistrict) {
    millQuery.district = officerDistrict;
  }
  const totalMills = await User.countDocuments(millQuery);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentWindowStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const previousWindowStart = new Date(
    now.getTime() - 14 * 24 * 60 * 60 * 1000,
  );

  const diseaseCounter = new Map<string, number>();
  const regionCounter = new Map<string, number>();

  for (const scan of scans) {
    const district =
      (scan.clerkId ? farmerDistrictById.get(scan.clerkId) : null) || "Unknown";
    regionCounter.set(district, (regionCounter.get(district) || 0) + 1);

    const createdAt = new Date(scan.createdAt);
    if (createdAt >= monthStart) {
      const disease = scan.disease || "Unknown";
      diseaseCounter.set(disease, (diseaseCounter.get(disease) || 0) + 1);
    }
  }

  const diseaseFrequency = Array.from(diseaseCounter.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const regionData = Array.from(regionCounter.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const mostCommon = diseaseFrequency[0] || { name: "N/A", count: 0 };

  const advisories = await Advisory.find({ published: true })
    .sort({ publishedDate: -1, createdAt: -1 })
    .limit(4)
    .select("advisoryId title disease publishedDate createdAt")
    .lean<AdvisoryDoc[]>();

  const advisoryPosts = advisories.map((advisory) => ({
    id: advisory.advisoryId,
    title: advisory.title,
    date: advisory.publishedDate,
    category: advisory.disease || "General",
  }));

  const pricingQuery: Record<string, unknown> = { isActive: true };
  if (officerDistrict) {
    pricingQuery.region = officerDistrict;
  }

  const pricingDocs = await Pricing.find(pricingQuery)
    .select("variety pricePerKg updatedAt")
    .lean<PricingDoc[]>();

  const priceCounters = new Map<string, Counter>();

  for (const price of pricingDocs) {
    const variety = price.variety?.trim() || "Unknown";
    const entry = priceCounters.get(variety) || {
      total: 0,
      count: 0,
      currentTotal: 0,
      currentCount: 0,
      previousTotal: 0,
      previousCount: 0,
    };

    entry.total += price.pricePerKg;
    entry.count += 1;

    const updatedAt = new Date(price.updatedAt);
    if (updatedAt >= currentWindowStart) {
      entry.currentTotal += price.pricePerKg;
      entry.currentCount += 1;
    } else if (updatedAt >= previousWindowStart) {
      entry.previousTotal += price.pricePerKg;
      entry.previousCount += 1;
    }

    priceCounters.set(variety, entry);
  }

  const priceSummary = Array.from(priceCounters.entries())
    .map(([variety, entry]) => {
      const fallbackAverage = entry.count > 0 ? entry.total / entry.count : 0;
      const currentAverage =
        entry.currentCount > 0
          ? entry.currentTotal / entry.currentCount
          : fallbackAverage;
      const previousAverage =
        entry.previousCount > 0 ? entry.previousTotal / entry.previousCount : 0;

      const change =
        previousAverage > 0
          ? ((currentAverage - previousAverage) / previousAverage) * 100
          : 0;

      return {
        variety,
        avg: currentAverage,
        change,
      };
    })
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5);

  return Response.json({
    summary: {
      totalFarmers,
      totalMills,
      totalReports,
      mostCommon,
      officerDistrict,
    },
    diseaseFrequency,
    regionData,
    advisoryPosts,
    priceSummary,
    generatedAt: now.toISOString(),
  });
}

"use server";

import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import DiseaseScan from "@/lib/models/DiseaseScan";
import Message from "@/lib/models/Message";
import PaddyRecord from "@/lib/models/PaddyRecord";
import Pricing from "@/lib/models/Pricing";
import { normalizeRiceVariety } from "@/lib/rice-varieties";
import User from "@/lib/models/User";

type ScanStatus = "success" | "warning";

export interface FarmerDashboardData {
  stats: {
    totalScans: number;
    healthyScans: number;
    diseaseScans: number;
    monthRevenue: number;
    unreadMessages: number;
  };
  recentScans: Array<{
    id: string;
    date: string;
    result: string;
    confidence: number;
    status: ScanStatus;
  }>;
  upcomingTasks: Array<{
    id: string;
    task: string;
    date: string;
    priority: "high" | "medium";
  }>;
  marketSummary: Array<{
    label: string;
    price: number;
    change: number;
  }>;
  marketRegion: string | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const isHealthyScan = (disease: string) =>
  disease.toLowerCase().includes("healthy");

const formatDate = (value: Date) =>
  value.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

const getEmptyDashboardData = (): FarmerDashboardData => ({
  stats: {
    totalScans: 0,
    healthyScans: 0,
    diseaseScans: 0,
    monthRevenue: 0,
    unreadMessages: 0,
  },
  recentScans: [],
  upcomingTasks: [],
  marketSummary: [],
  marketRegion: null,
});

export async function getFarmerDashboardData(): Promise<FarmerDashboardData> {
  const { userId } = await auth();

  if (!userId) {
    return getEmptyDashboardData();
  }

  await connectDB();

  const [scanDocs, paddyRecord, user, unreadMessages] = await Promise.all([
    DiseaseScan.find({ clerkId: userId })
      .sort({ createdAt: -1 })
      .limit(24)
      .select("_id disease confidence createdAt")
      .lean<
        {
          _id: { toString: () => string };
          disease: string;
          confidence: number;
          createdAt: Date;
        }[]
      >(),
    PaddyRecord.findOne({ clerkId: userId })
      .select("plantings harvests fertilizerApplications")
      .lean<{
        plantings?: Array<{
          _id: { toString: () => string };
          field: string;
          status: "Growing" | "Harvested";
          expectedHarvest?: Date;
          date: Date;
        }>;
        fertilizerApplications?: Array<{
          _id: { toString: () => string };
          field: string;
          date: Date;
          type?: string;
        }>;
        harvests?: Array<{
          date: Date;
          field: string;
          revenue?: number;
          yield: number;
          pricePerKg?: number;
        }>;
      } | null>(),
    User.findOne({ clerkId: userId })
      .select("district")
      .lean<{ district?: string } | null>(),
    Message.countDocuments({ recipientId: userId, readAt: null }),
  ]);

  const healthyScans = scanDocs.filter((scan) => isHealthyScan(scan.disease));
  const diseaseScans = scanDocs.length - healthyScans.length;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthRevenue = (paddyRecord?.harvests ?? []).reduce((sum, harvest) => {
    const harvestDate = new Date(harvest.date);
    if (harvestDate < monthStart) {
      return sum;
    }

    const computedRevenue =
      typeof harvest.revenue === "number"
        ? harvest.revenue
        : harvest.yield * (harvest.pricePerKg ?? 0);

    return sum + (Number.isFinite(computedRevenue) ? computedRevenue : 0);
  }, 0);

  const plantingTasks = (paddyRecord?.plantings ?? [])
    .filter((planting) => planting.status !== "Harvested")
    .map((planting) => {
      const due = planting.expectedHarvest
        ? new Date(planting.expectedHarvest)
        : new Date(planting.date.getTime() + 100 * DAY_MS);

      const daysToDue = Math.round((due.getTime() - now.getTime()) / DAY_MS);

      return {
        id: planting._id.toString(),
        task: `Harvest preparation - ${planting.field}`,
        date: formatDate(due),
        priority: daysToDue <= 14 ? ("high" as const) : ("medium" as const),
        due,
      };
    });

  const fertilizerTasks = (paddyRecord?.fertilizerApplications ?? [])
    .map((fertilizer) => {
      const due = new Date(fertilizer.date);
      const daysToDue = Math.round((due.getTime() - now.getTime()) / DAY_MS);
      const fertilizerType = fertilizer.type?.trim();

      return {
        id: fertilizer._id.toString(),
        task: fertilizerType
          ? `Fertilizer application (${fertilizerType}) - ${fertilizer.field}`
          : `Fertilizer application - ${fertilizer.field}`,
        date: formatDate(due),
        priority: daysToDue <= 7 ? ("high" as const) : ("medium" as const),
        due,
      };
    })
    .filter((task) => task.due.getTime() >= now.getTime() - DAY_MS);

  const upcomingTasks = [...plantingTasks, ...fertilizerTasks]
    .sort((a, b) => a.due.getTime() - b.due.getTime())
    .slice(0, 4)
    .map((task) => ({
      id: task.id,
      task: task.task,
      date: task.date,
      priority: task.priority,
    }));

  const district = user?.district?.trim();

  const activePrices = await Pricing.find({
    isActive: true,
    ...(district ? { region: district } : {}),
  })
    .sort({ updatedAt: -1 })
    .select("variety pricePerKg updatedAt")
    .lean<
      {
        variety: string;
        pricePerKg: number;
        updatedAt: Date;
      }[]
    >();

  const sevenDaysAgo = new Date(now.getTime() - 7 * DAY_MS);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * DAY_MS);

  const grouped = activePrices.reduce<
    Record<string, Array<{ pricePerKg: number; updatedAt: Date }>>
  >((acc, price) => {
    const normalizedVariety = normalizeRiceVariety(price.variety);
    const label = normalizedVariety ?? price.variety;

    if (!acc[label]) {
      acc[label] = [];
    }
    acc[label].push({
      pricePerKg: price.pricePerKg,
      updatedAt: new Date(price.updatedAt),
    });
    return acc;
  }, {});

  const marketSummary = Object.entries(grouped)
    .map(([label, entries]) => {
      const currentWindow = entries
        .filter((entry) => entry.updatedAt >= sevenDaysAgo)
        .map((entry) => entry.pricePerKg);

      const previousWindow = entries
        .filter(
          (entry) =>
            entry.updatedAt >= fourteenDaysAgo &&
            entry.updatedAt < sevenDaysAgo,
        )
        .map((entry) => entry.pricePerKg);

      const average = (values: number[]) =>
        values.length
          ? values.reduce((sum, value) => sum + value, 0) / values.length
          : 0;

      const currentAvg =
        average(currentWindow) || average(entries.map((e) => e.pricePerKg));
      const previousAvg = average(previousWindow);
      const change =
        previousAvg > 0 ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0;

      return {
        label,
        price: Number(currentAvg.toFixed(1)),
        change: Number(change.toFixed(1)),
      };
    })
    .sort((a, b) => b.price - a.price)
    .slice(0, 3);

  return {
    stats: {
      totalScans: scanDocs.length,
      healthyScans: healthyScans.length,
      diseaseScans,
      monthRevenue: Math.round(monthRevenue),
      unreadMessages,
    },
    recentScans: scanDocs.slice(0, 4).map((scan) => ({
      id: scan._id.toString(),
      date: formatDate(new Date(scan.createdAt)),
      result: scan.disease,
      confidence: Number(scan.confidence.toFixed(1)),
      status: isHealthyScan(scan.disease) ? "success" : "warning",
    })),
    upcomingTasks,
    marketSummary,
    marketRegion: district || null,
  };
}

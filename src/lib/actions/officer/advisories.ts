"use server";

import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Advisory from "@/lib/models/Advisory";
import User from "@/lib/models/User";

type KnownRole = "farmer" | "mill" | "officer" | "none";

type OfficerDoc = {
  clerkId: string;
  role?: KnownRole;
  firstName?: string;
  lastName?: string;
};

type AdvisoryDoc = {
  _id: { toString: () => string };
  advisoryId: string;
  title: string;
  content: string;
  disease: string;
  published: boolean;
  publishedDate: string;
  author: string;
  authorClerkId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AdvisoryItem = {
  id: string;
  displayId: string;
  title: string;
  content: string;
  disease: string;
  published: boolean;
  publishedDate: string;
  author: string;
  createdAt: string;
  updatedAt: string;
};

type ResultBase = { success: boolean; error?: string };

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function toResponse(advisory: AdvisoryDoc): AdvisoryItem {
  const objectId = advisory._id.toString();
  const shortId = objectId.slice(-6).toUpperCase();

  return {
    id: advisory.advisoryId,
    displayId: `#${shortId}`,
    title: advisory.title,
    content: advisory.content,
    disease: advisory.disease,
    published: advisory.published,
    publishedDate: advisory.publishedDate,
    author: advisory.author,
    createdAt: advisory.createdAt.toISOString(),
    updatedAt: advisory.updatedAt.toISOString(),
  };
}

async function getOfficerContext() {
  const { userId } = await auth();
  if (!userId) {
    return { success: false as const, error: "Unauthorized" };
  }

  await connectDB();
  const officer = await User.findOne({ clerkId: userId })
    .select("clerkId role firstName lastName")
    .lean<OfficerDoc | null>();

  if (!officer || officer.role !== "officer") {
    return { success: false as const, error: "Forbidden" };
  }

  return { success: true as const, userId, officer };
}

async function getNextAdvisoryId() {
  const total = await Advisory.countDocuments();

  for (let n = total + 1; n <= total + 1000; n += 1) {
    const advisoryId = `ADV-${String(n).padStart(3, "0")}`;
    const exists = await Advisory.exists({ advisoryId });
    if (!exists) {
      return advisoryId;
    }
  }

  return `ADV-${Date.now()}`;
}

export async function getAdvisories(): Promise<
  ResultBase & { advisories?: AdvisoryItem[] }
> {
  const context = await getOfficerContext();
  if (!context.success) {
    return { success: false, error: context.error };
  }

  try {
    await connectDB();
    const advisories = await Advisory.find({})
      .sort({ publishedDate: -1, createdAt: -1 })
      .lean<AdvisoryDoc[]>();

    return {
      success: true,
      advisories: advisories.map(toResponse),
    };
  } catch (error) {
    console.error("Error loading advisories:", error);
    return { success: false, error: "Failed to load advisories" };
  }
}

export type AdvisoryPayload = {
  title: string;
  content: string;
  disease: string;
  published: boolean;
  publishedDate: string;
};

export async function createAdvisory(
  payload: AdvisoryPayload,
): Promise<ResultBase & { advisory?: AdvisoryItem }> {
  const context = await getOfficerContext();
  if (!context.success) {
    return { success: false, error: context.error };
  }

  const title = payload.title?.trim();
  const content = payload.content?.trim();
  const disease = payload.disease?.trim();

  if (!title || !content || !disease || !isIsoDate(payload.publishedDate)) {
    return { success: false, error: "Invalid payload" };
  }

  try {
    await connectDB();
    const advisoryId = await getNextAdvisoryId();
    const fullName =
      `${context.officer.firstName || ""} ${context.officer.lastName || ""}`.trim();

    const created = await Advisory.create({
      advisoryId,
      title,
      content,
      disease,
      published: payload.published === true,
      publishedDate: payload.publishedDate,
      author: fullName || "Officer",
      authorClerkId: context.userId,
    });

    return {
      success: true,
      advisory: toResponse(created.toObject() as AdvisoryDoc),
    };
  } catch (error) {
    console.error("Error creating advisory:", error);
    return { success: false, error: "Failed to create advisory" };
  }
}

export type AdvisoryUpdatePayload = Partial<AdvisoryPayload> & {
  id: string;
};

export async function updateAdvisory(
  payload: AdvisoryUpdatePayload,
): Promise<ResultBase & { advisory?: AdvisoryItem }> {
  const context = await getOfficerContext();
  if (!context.success) {
    return { success: false, error: context.error };
  }

  const id = payload.id?.trim();
  if (!id) {
    return { success: false, error: "id is required" };
  }

  const updates: Record<string, unknown> = {};

  if (typeof payload.title === "string") {
    const title = payload.title.trim();
    if (!title) return { success: false, error: "Invalid title" };
    updates.title = title;
  }

  if (typeof payload.content === "string") {
    const content = payload.content.trim();
    if (!content) return { success: false, error: "Invalid content" };
    updates.content = content;
  }

  if (typeof payload.disease === "string") {
    const disease = payload.disease.trim();
    if (!disease) return { success: false, error: "Invalid disease" };
    updates.disease = disease;
  }

  if (typeof payload.published === "boolean") {
    updates.published = payload.published;
  }

  if (typeof payload.publishedDate !== "undefined") {
    if (!isIsoDate(payload.publishedDate)) {
      return { success: false, error: "Invalid publishedDate" };
    }
    updates.publishedDate = payload.publishedDate;
  }

  if (Object.keys(updates).length === 0) {
    return { success: false, error: "No updates provided" };
  }

  try {
    await connectDB();
    const updated = await Advisory.findOneAndUpdate(
      { advisoryId: id },
      { $set: updates },
      { new: true },
    ).lean<AdvisoryDoc | null>();

    if (!updated) {
      return { success: false, error: "Advisory not found" };
    }

    return {
      success: true,
      advisory: toResponse(updated),
    };
  } catch (error) {
    console.error("Error updating advisory:", error);
    return { success: false, error: "Failed to update advisory" };
  }
}

export async function deleteAdvisory(id: string): Promise<ResultBase> {
  const context = await getOfficerContext();
  if (!context.success) {
    return { success: false, error: context.error };
  }

  const advisoryId = id?.trim();
  if (!advisoryId) {
    return { success: false, error: "id is required" };
  }

  try {
    await connectDB();
    const deleted = await Advisory.findOneAndDelete({
      advisoryId,
    }).lean<AdvisoryDoc | null>();

    if (!deleted) {
      return { success: false, error: "Advisory not found" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting advisory:", error);
    return { success: false, error: "Failed to delete advisory" };
  }
}

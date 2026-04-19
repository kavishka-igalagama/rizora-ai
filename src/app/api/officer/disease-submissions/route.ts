import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import DiseaseScan from "@/lib/models/DiseaseScan";
import User from "@/lib/models/User";

type SubmissionStatus = "pending" | "reviewed" | "escalated";

type KnownRole = "farmer" | "mill" | "officer" | "none";

type OfficerDoc = {
  clerkId: string;
  role?: KnownRole;
  district?: string;
  assignedDistrict?: string;
};

type ScanDoc = {
  _id: { toString: () => string };
  clerkId?: string | null;
  disease: string;
  confidence: number;
  scanStatus?: SubmissionStatus;
  officerNotes?: string;
  imageUrl: string;
  createdAt: Date;
};

type FarmerDoc = {
  clerkId: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  district?: string;
};

async function getOfficerContext() {
  const { userId } = await auth();
  if (!userId) {
    return { userId: null, officer: null as OfficerDoc | null };
  }

  await connectDB();
  const officer = await User.findOne({ clerkId: userId })
    .select("clerkId role district assignedDistrict")
    .lean<OfficerDoc | null>();

  return { userId, officer };
}

function isSubmissionStatus(value: unknown): value is SubmissionStatus {
  return value === "pending" || value === "reviewed" || value === "escalated";
}

export async function GET(req: Request) {
  const { userId, officer } = await getOfficerContext();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!officer || officer.role !== "officer") {
    return new Response("Forbidden", { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status")?.trim();
  const districtFilter = searchParams.get("district")?.trim();
  const diseaseFilter = searchParams.get("disease")?.trim();
  const search = searchParams.get("search")?.trim().toLowerCase();
  const limitRaw = Number.parseInt(searchParams.get("limit") || "200", 10);
  const limit =
    Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 500) : 200;

  const query: Record<string, unknown> = {};
  if (isSubmissionStatus(status)) {
    query.scanStatus = status;
  }
  if (diseaseFilter) {
    query.disease = diseaseFilter;
  }

  await connectDB();
  const scans = await DiseaseScan.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<ScanDoc[]>();

  const farmerIds = [
    ...new Set(scans.map((scan) => scan.clerkId).filter(Boolean)),
  ] as string[];
  const farmers = await User.find({ clerkId: { $in: farmerIds } })
    .select("clerkId firstName lastName phone district")
    .lean<FarmerDoc[]>();

  const farmerMap = new Map(
    farmers.map((farmer) => {
      const fullName =
        `${farmer.firstName || ""} ${farmer.lastName || ""}`.trim();
      return [
        farmer.clerkId,
        {
          name: fullName || "Unknown Farmer",
          phone: farmer.phone || "N/A",
          district: farmer.district || "Unknown",
        },
      ] as const;
    }),
  );

  const officerDistrict = officer.assignedDistrict || officer.district || null;

  const rows = scans
    .map((scan) => {
      const farmer = scan.clerkId ? farmerMap.get(scan.clerkId) : null;
      const district = farmer?.district || "Unknown";
      const createdAt = new Date(scan.createdAt);

      return {
        id: scan._id.toString(),
        farmerName: farmer?.name || "Unknown Farmer",
        farmerPhone: farmer?.phone || "N/A",
        fieldName: "Field not provided",
        region: district,
        district,
        disease: scan.disease,
        confidence: Math.round(scan.confidence),
        date: createdAt.toISOString().slice(0, 10),
        time: createdAt.toISOString().slice(11, 16),
        status: scan.scanStatus || "pending",
        imageUrl: scan.imageUrl,
        notes: scan.officerNotes || "",
      };
    })
    .filter((row) => {
      if (districtFilter && row.district !== districtFilter) {
        return false;
      }

      if (officerDistrict && row.district !== officerDistrict) {
        return false;
      }

      if (!search) {
        return true;
      }

      return (
        row.id.toLowerCase().includes(search) ||
        row.farmerName.toLowerCase().includes(search) ||
        row.disease.toLowerCase().includes(search) ||
        row.district.toLowerCase().includes(search)
      );
    });

  return Response.json({
    submissions: rows,
    total: rows.length,
    generatedAt: new Date().toISOString(),
    officerDistrict,
  });
}

export async function PATCH(req: Request) {
  const { userId, officer } = await getOfficerContext();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!officer || officer.role !== "officer") {
    return new Response("Forbidden", { status: 403 });
  }

  const payload = (await req.json()) as {
    id?: string;
    status?: SubmissionStatus;
    notes?: string;
  };

  const id = payload.id?.trim();
  if (!id) {
    return new Response("id is required", { status: 400 });
  }

  const updates: Record<string, unknown> = {
    reviewedBy: userId,
  };

  if (typeof payload.status !== "undefined") {
    if (!isSubmissionStatus(payload.status)) {
      return new Response("Invalid status", { status: 400 });
    }
    updates.scanStatus = payload.status;
  }

  if (typeof payload.notes === "string") {
    updates.officerNotes = payload.notes.trim();
  }

  const updated = await DiseaseScan.findByIdAndUpdate(id, updates, {
    new: true,
  }).lean<ScanDoc | null>();

  if (!updated) {
    return new Response("Submission not found", { status: 404 });
  }

  return Response.json({
    id: updated._id.toString(),
    status: updated.scanStatus || "pending",
    notes: updated.officerNotes || "",
    updatedAt: new Date().toISOString(),
  });
}

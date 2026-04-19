import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Pricing from "@/lib/models/Pricing";
import User from "@/lib/models/User";
import { publishMarketPricesUpdate } from "@/lib/market-prices-realtime";
import { normalizeRiceVariety } from "@/lib/rice-varieties";

type KnownRole = "farmer" | "mill" | "officer" | "none";

type PriceDoc = {
  _id: { toString: () => string };
  millId: string;
  region: string;
  variety: string;
  qualityGrade: "Grade A" | "Grade B" | "Grade C" | "Grade D";
  pricePerKg: number;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

const toQualityGrade = (
  value: string,
): "Grade A" | "Grade B" | "Grade C" | "Grade D" | null => {
  if (value === "Grade A") return "Grade A";
  if (value === "Grade B") return "Grade B";
  if (value === "Grade C") return "Grade C";
  if (value === "Grade D") return "Grade D";
  return null;
};

async function getRequester() {
  const { userId } = await auth();
  if (!userId) {
    return { userId: null, role: null as KnownRole | null };
  }

  await connectDB();
  const me = await User.findOne({ clerkId: userId })
    .select("clerkId role")
    .lean<{ clerkId: string; role?: KnownRole } | null>();

  return {
    userId,
    role: me?.role ?? "none",
  };
}

function isCanWrite(role: KnownRole | null): role is "mill" | "officer" {
  return role === "mill" || role === "officer";
}

export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const { userId } = await auth();

  const includeInactive = searchParams.get("includeInactive") === "true";
  const region = searchParams.get("region")?.trim();
  const variety = normalizeRiceVariety(searchParams.get("variety")?.trim());
  const qualityGrade = searchParams.get("qualityGrade")?.trim();
  const millId = searchParams.get("millId")?.trim();
  const limitRaw = Number.parseInt(searchParams.get("limit") || "0", 10);
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : 0;

  const query: Record<string, unknown> = {};
  if (!includeInactive) {
    query.isActive = true;
  }
  if (region) {
    query.region = region;
  }
  if (variety) {
    query.variety = variety;
  }
  if (qualityGrade) {
    query.qualityGrade = qualityGrade;
  }
  if (millId) {
    query.millId = millId;
  }

  let q = Pricing.find(query).sort({ updatedAt: -1 });
  if (limit > 0) {
    q = q.limit(limit);
  }

  const prices = await q.lean<PriceDoc[]>();

  const millIds = [...new Set(prices.map((price) => price.millId))];
  const mills = await User.find({ clerkId: { $in: millIds } })
    .select("clerkId millName firstName lastName district phone")
    .lean<
      {
        clerkId: string;
        millName?: string;
        firstName?: string;
        lastName?: string;
        district?: string;
        phone?: string;
      }[]
    >();

  const millMap = new Map(
    mills.map((mill) => {
      const fallbackName =
        `${mill.firstName || ""} ${mill.lastName || ""}`.trim();
      return [
        mill.clerkId,
        {
          name: mill.millName || fallbackName || "Unknown Mill",
          district: mill.district || "Unknown",
          phone: mill.phone,
        },
      ] as const;
    }),
  );

  const responsePrices = prices.map((price) => {
    const mill = millMap.get(price.millId);
    return {
      id: price._id.toString(),
      millId: price.millId,
      millName: mill?.name || "Unknown Mill",
      millDistrict: mill?.district || "Unknown",
      millPhone: mill?.phone,
      region: price.region,
      variety: price.variety,
      qualityGrade: price.qualityGrade,
      pricePerKg: price.pricePerKg,
      isActive: price.isActive,
      notes: price.notes,
      createdAt: price.createdAt.toISOString(),
      updatedAt: price.updatedAt.toISOString(),
    };
  });

  let userDistrict: string | null = null;
  if (userId) {
    const currentUser = await User.findOne({ clerkId: userId })
      .select("district")
      .lean<{ district?: string } | null>();
    userDistrict = currentUser?.district ?? null;
  }

  return Response.json({
    prices: responsePrices,
    total: responsePrices.length,
    generatedAt: new Date().toISOString(),
    userDistrict,
  });
}

export async function POST(req: Request) {
  const requester = await getRequester();
  if (!requester.userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!isCanWrite(requester.role)) {
    return new Response("Forbidden", { status: 403 });
  }

  const payload = (await req.json()) as {
    millId?: string;
    region?: string;
    variety?: string;
    qualityGrade?: string;
    pricePerKg?: number;
    isActive?: boolean;
    notes?: string;
  };

  const variety = normalizeRiceVariety(payload.variety?.trim());
  const region = payload.region?.trim();
  const qualityGrade = toQualityGrade(payload.qualityGrade || "");
  const notes = payload.notes?.trim();
  const numericPrice = Number(payload.pricePerKg);

  if (
    !variety ||
    !region ||
    !qualityGrade ||
    !Number.isFinite(numericPrice) ||
    numericPrice <= 0
  ) {
    return new Response("Invalid payload", { status: 400 });
  }

  const ownerMillId =
    requester.role === "officer" ? payload.millId?.trim() : requester.userId;
  if (!ownerMillId) {
    return new Response("millId is required", { status: 400 });
  }

  await connectDB();
  const created = await Pricing.create({
    millId: ownerMillId,
    region,
    variety,
    qualityGrade,
    pricePerKg: numericPrice,
    isActive: typeof payload.isActive === "boolean" ? payload.isActive : true,
    notes,
  });

  await publishMarketPricesUpdate({
    action: "created",
    pricingId: created._id.toString(),
    millId: created.millId,
    updatedAt: created.updatedAt.toISOString(),
  });

  return Response.json(
    {
      id: created._id.toString(),
      millId: created.millId,
      region: created.region,
      variety: created.variety,
      qualityGrade: created.qualityGrade,
      pricePerKg: created.pricePerKg,
      isActive: created.isActive,
      notes: created.notes,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    },
    { status: 201 },
  );
}

export async function PATCH(req: Request) {
  const requester = await getRequester();
  if (!requester.userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!isCanWrite(requester.role)) {
    return new Response("Forbidden", { status: 403 });
  }

  const payload = (await req.json()) as {
    id?: string;
    region?: string;
    variety?: string;
    qualityGrade?: string;
    pricePerKg?: number;
    isActive?: boolean;
    notes?: string;
  };

  const id = payload.id?.trim();
  if (!id) {
    return new Response("id is required", { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (typeof payload.region === "string")
    updates.region = payload.region.trim();
  if (typeof payload.variety === "string") {
    const normalizedVariety = normalizeRiceVariety(payload.variety);
    if (!normalizedVariety) {
      return new Response("Invalid variety", { status: 400 });
    }
    updates.variety = normalizedVariety;
  }
  if (typeof payload.notes === "string") updates.notes = payload.notes.trim();
  if (typeof payload.isActive === "boolean")
    updates.isActive = payload.isActive;
  if (typeof payload.pricePerKg !== "undefined") {
    const numericPrice = Number(payload.pricePerKg);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return new Response("Invalid pricePerKg", { status: 400 });
    }
    updates.pricePerKg = numericPrice;
  }
  if (typeof payload.qualityGrade === "string") {
    const grade = toQualityGrade(payload.qualityGrade);
    if (!grade) {
      return new Response("Invalid qualityGrade", { status: 400 });
    }
    updates.qualityGrade = grade;
  }

  if (Object.keys(updates).length === 0) {
    return new Response("No updates provided", { status: 400 });
  }

  await connectDB();

  const scope =
    requester.role === "officer"
      ? { _id: id }
      : { _id: id, millId: requester.userId };
  const updated = await Pricing.findOneAndUpdate(
    scope,
    { $set: updates },
    { new: true },
  ).lean<PriceDoc | null>();

  if (!updated) {
    return new Response("Pricing not found or access denied", { status: 404 });
  }

  await publishMarketPricesUpdate({
    action: "updated",
    pricingId: updated._id.toString(),
    millId: updated.millId,
    updatedAt: updated.updatedAt.toISOString(),
  });

  return Response.json({
    id: updated._id.toString(),
    millId: updated.millId,
    region: updated.region,
    variety: updated.variety,
    qualityGrade: updated.qualityGrade,
    pricePerKg: updated.pricePerKg,
    isActive: updated.isActive,
    notes: updated.notes,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  });
}

export async function DELETE(req: Request) {
  const requester = await getRequester();
  if (!requester.userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!isCanWrite(requester.role)) {
    return new Response("Forbidden", { status: 403 });
  }

  const payload = (await req.json()) as { id?: string };
  const id = payload.id?.trim();
  if (!id) {
    return new Response("id is required", { status: 400 });
  }

  await connectDB();
  const scope =
    requester.role === "officer"
      ? { _id: id }
      : { _id: id, millId: requester.userId };
  const deleted = await Pricing.findOneAndDelete(scope).lean<PriceDoc | null>();

  if (!deleted) {
    return new Response("Pricing not found or access denied", { status: 404 });
  }

  await publishMarketPricesUpdate({
    action: "deleted",
    pricingId: deleted._id.toString(),
    millId: deleted.millId,
    updatedAt: new Date().toISOString(),
  });

  return Response.json({ success: true });
}

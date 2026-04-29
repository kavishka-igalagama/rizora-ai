import connectDB from "@/lib/mongodb";
import Notification from "@/lib/models/Notification";
import Pricing from "@/lib/models/Pricing";
import User from "@/lib/models/User";
import {
  getMissingPusherEnvVars,
  isPusherConfigured,
  default as pusherServer,
} from "@/lib/pusher-server";
import {
  normalizeRiceVariety,
  RICE_VARIETIES,
  type RiceVariety,
} from "@/lib/rice-varieties";

export type MarketNotificationAction = "created" | "updated" | "deleted";

type PriceSnapshot = {
  _id: { toString: () => string } | string;
  variety: string;
  pricePerKg: number;
  isActive: boolean;
};

type VarietyChange = {
  variety: RiceVariety;
  before: number | null;
  after: number | null;
};

const NOTIFICATION_EVENT_NEW = "notification:new";
const CHANGE_EPSILON = 0.01;

const average = (values: number[]) =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

const toId = (value: PriceSnapshot["_id"]) =>
  typeof value === "string" ? value : value.toString();

const formatPrice = (value: number) => value.toFixed(2);

const buildAverageMap = (prices: PriceSnapshot[]) => {
  const buckets: Record<RiceVariety, number[]> = RICE_VARIETIES.reduce(
    (acc, variety) => {
      acc[variety] = [];
      return acc;
    },
    {} as Record<RiceVariety, number[]>,
  );

  prices.forEach((price) => {
    if (!price.isActive) return;
    const normalized = normalizeRiceVariety(price.variety);
    if (!normalized) return;
    buckets[normalized].push(price.pricePerKg);
  });

  return RICE_VARIETIES.reduce(
    (acc, variety) => {
      const values = buckets[variety];
      acc[variety] = values.length ? average(values) : null;
      return acc;
    },
    {} as Record<RiceVariety, number | null>,
  );
};

const buildVarietyChanges = (
  beforeMap: Record<RiceVariety, number | null>,
  afterMap: Record<RiceVariety, number | null>,
): VarietyChange[] =>
  RICE_VARIETIES.reduce<VarietyChange[]>((acc, variety) => {
    const before = beforeMap[variety];
    const after = afterMap[variety];

    if (before === null && after === null) {
      return acc;
    }

    if (before === null || after === null) {
      acc.push({ variety, before, after });
      return acc;
    }

    if (Math.abs(after - before) >= CHANGE_EPSILON) {
      acc.push({ variety, before, after });
    }

    return acc;
  }, []);

const buildNotificationCopy = (
  district: string,
  change: VarietyChange,
): { title: string; description: string } => {
  const { variety, before, after } = change;
  const title = `Average ${variety} price updated in ${district}`;

  if (after === null) {
    return {
      title,
      description: `Average ${variety} price is now unavailable in ${district}.`,
    };
  }

  if (before === null) {
    return {
      title,
      description: `District average for ${variety} is now Rs ${formatPrice(after)} / kg.`,
    };
  }

  return {
    title,
    description: `District average for ${variety} is now Rs ${formatPrice(after)} / kg (was Rs ${formatPrice(before)} / kg).`,
  };
};

export async function notifyFarmersForDistrictAverageChange({
  district,
  action,
  previousPricing,
  currentPricing,
}: {
  district: string;
  action: MarketNotificationAction;
  previousPricing?: PriceSnapshot | null;
  currentPricing?: PriceSnapshot | null;
}) {
  const normalizedDistrict = district.trim();
  if (!normalizedDistrict) {
    return;
  }

  await connectDB();

  const mills = await User.find({ role: "mill", district: normalizedDistrict })
    .select("clerkId")
    .lean<{ clerkId: string }[]>();

  if (mills.length === 0) {
    return;
  }

  const millIds = mills.map((mill) => mill.clerkId);

  const afterPrices = await Pricing.find({
    millId: { $in: millIds },
    isActive: true,
  })
    .select("variety pricePerKg isActive")
    .lean<PriceSnapshot[]>();

  let beforePrices = afterPrices;
  const currentId = currentPricing ? toId(currentPricing._id) : null;

  if (currentId) {
    beforePrices = beforePrices.filter(
      (price) => toId(price._id) !== currentId,
    );
  }

  if (action === "updated" || action === "deleted") {
    if (previousPricing?.isActive) {
      beforePrices = [...beforePrices, previousPricing];
    }
  }

  const beforeMap = buildAverageMap(beforePrices);
  const afterMap = buildAverageMap(afterPrices);
  const changes = buildVarietyChanges(beforeMap, afterMap);

  if (changes.length === 0) {
    return;
  }

  const farmers = await User.find({
    role: "farmer",
    district: normalizedDistrict,
  })
    .select("clerkId")
    .lean<{ clerkId: string }[]>();

  if (farmers.length === 0) {
    return;
  }

  const baseNotifications = changes.map((change) => ({
    type: "market" as const,
    ...buildNotificationCopy(normalizedDistrict, change),
  }));

  const notifications = farmers.flatMap((farmer) =>
    baseNotifications.map((base) => ({
      clerkId: farmer.clerkId,
      ...base,
    })),
  );

  const created = await Notification.insertMany(notifications);

  if (!isPusherConfigured()) {
    console.warn(
      `[market-prices] Pusher is not configured. Missing env vars: ${getMissingPusherEnvVars().join(", ")}`,
    );
    return;
  }

  await Promise.all(
    created.map((notification) =>
      pusherServer.trigger(
        `private-user-${notification.clerkId}`,
        NOTIFICATION_EVENT_NEW,
        {
          id: notification._id.toString(),
          type: notification.type,
          title: notification.title,
          description: notification.description,
          read: notification.read,
          createdAt: notification.createdAt.toISOString(),
        },
      ),
    ),
  );
}

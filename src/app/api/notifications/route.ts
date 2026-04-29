import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Notification, { NotificationType } from "@/lib/models/Notification";
import {
  getMissingPusherEnvVars,
  isPusherConfigured,
  default as pusherServer,
} from "@/lib/pusher-server";

type NotificationMetadata = {
  scanId?: string;
  disease?: string;
  confidence?: number;
  imageUrl?: string;
};

type NotificationPayload = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
  metadata?: NotificationMetadata;
};

const EVENT_NEW = "notification:new";
const EVENT_UPDATED = "notification:updated";

function toPayload(notification: {
  _id: { toString: () => string };
  type: NotificationType;
  title: string;
  description: string;
  read: boolean;
  createdAt: Date;
  metadata?: NotificationMetadata;
}): NotificationPayload {
  return {
    id: notification._id.toString(),
    type: notification.type,
    title: notification.title,
    description: notification.description,
    read: notification.read,
    createdAt: notification.createdAt.toISOString(),
    metadata: notification.metadata,
  };
}

export async function GET(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const countOnly = searchParams.get("countOnly") === "true";

  await connectDB();

  if (countOnly) {
    const unreadCount = await Notification.countDocuments({
      clerkId: userId,
      read: false,
    });

    return Response.json({ unreadCount });
  }

  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ clerkId: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean<
        {
          _id: { toString: () => string };
          type: NotificationType;
          title: string;
          description: string;
          read: boolean;
          createdAt: Date;
          metadata?: NotificationMetadata;
        }[]
      >(),
    Notification.countDocuments({ clerkId: userId, read: false }),
  ]);

  return Response.json({
    notifications: notifications.map((notification) => toPayload(notification)),
    unreadCount,
  });
}

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = (await req.json()) as {
    type?: NotificationType;
    title?: string;
    description?: string;
    metadata?: NotificationMetadata;
  };

  const type = payload.type || "alert";
  const title = payload.title?.trim();
  const description = payload.description?.trim();

  if (!title || !description) {
    return new Response("title and description are required", { status: 400 });
  }

  await connectDB();

  const created = await Notification.create({
    clerkId: userId,
    type,
    title,
    description,
    metadata: payload.metadata || {},
  });

  const notificationPayload = toPayload(created);

  if (!isPusherConfigured()) {
    console.warn(
      `[notifications] Pusher is not configured. Missing env vars: ${getMissingPusherEnvVars().join(", ")}`,
    );
    return Response.json(
      { notification: notificationPayload },
      { status: 201 },
    );
  }

  try {
    await pusherServer.trigger(
      `private-user-${userId}`,
      EVENT_NEW,
      notificationPayload,
    );
  } catch (error) {
    console.error("[notifications] Failed to publish Pusher event", error);
  }

  return Response.json({ notification: notificationPayload }, { status: 201 });
}

export async function PATCH(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = (await req.json()) as {
    id?: string;
    markAll?: boolean;
  };

  await connectDB();

  let updatedCount = 0;

  if (payload.markAll) {
    const result = await Notification.updateMany(
      { clerkId: userId, read: false },
      { $set: { read: true } },
    );
    updatedCount = result.modifiedCount;
  } else if (payload.id) {
    const result = await Notification.updateOne(
      { _id: payload.id, clerkId: userId, read: false },
      { $set: { read: true } },
    );
    updatedCount = result.modifiedCount;
  } else {
    return new Response("id or markAll is required", { status: 400 });
  }

  const unreadCount = await Notification.countDocuments({
    clerkId: userId,
    read: false,
  });

  if (updatedCount > 0 && isPusherConfigured()) {
    try {
      await pusherServer.trigger(`private-user-${userId}`, EVENT_UPDATED, {
        unreadCount,
      });
    } catch (error) {
      console.error("[notifications] Failed to publish update", error);
    }
  }

  return Response.json({ updatedCount, unreadCount });
}

export async function DELETE(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("id is required", { status: 400 });
  }

  await connectDB();

  const deleted = await Notification.findOneAndDelete({
    _id: id,
    clerkId: userId,
  }).lean();

  if (!deleted) {
    return new Response("Notification not found", { status: 404 });
  }

  const unreadCount = await Notification.countDocuments({
    clerkId: userId,
    read: false,
  });

  if (isPusherConfigured()) {
    try {
      await pusherServer.trigger(`private-user-${userId}`, EVENT_UPDATED, {
        unreadCount,
        deletedId: id,
      });
    } catch (error) {
      console.error("[notifications] Failed to publish update", error);
    }
  }

  return Response.json({ success: true, unreadCount });
}

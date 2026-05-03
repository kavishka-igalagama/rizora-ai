import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Message from "@/lib/models/Message";
import Notification from "@/lib/models/Notification";
import User from "@/lib/models/User";
import {
  getMissingPusherEnvVars,
  isPusherConfigured,
  default as pusherServer,
} from "@/lib/pusher-server";
import { getConversationId } from "@/lib/chat";

const EVENT_NAME = "new-message";
const READ_EVENT_NAME = "messages-read";

type MessagePayload = {
  _id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

type ChatRole = "farmer" | "mill" | "officer";

function toChatRole(role?: string): ChatRole | null {
  if (role === "farmer" || role === "mill" || role === "officer") {
    return role;
  }
  return null;
}

function isAllowedChatPair(roleA: ChatRole, roleB: ChatRole): boolean {
  return (
    (roleA === "farmer" && (roleB === "mill" || roleB === "officer")) ||
    (roleA === "mill" && roleB === "farmer") ||
    (roleA === "officer" && roleB === "farmer")
  );
}

export async function GET(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const contactId = searchParams.get("contactId");

  if (!contactId) {
    return new Response("Missing contactId", { status: 400 });
  }

  await connectDB();

  const [me, contact] = await Promise.all([
    User.findOne({ clerkId: userId }).select("clerkId role").lean<{
      clerkId: string;
      role?: "farmer" | "mill" | "officer" | "none";
    } | null>(),
    User.findOne({ clerkId: contactId }).select("clerkId role").lean<{
      clerkId: string;
      role?: "farmer" | "mill" | "officer" | "none";
    } | null>(),
  ]);

  const myRole = toChatRole(me?.role);
  const contactRole = toChatRole(contact?.role);

  if (!me || !contact || !myRole || !contactRole) {
    return new Response("Invalid contact", { status: 404 });
  }

  if (!isAllowedChatPair(myRole, contactRole)) {
    return new Response("You are not allowed to chat with this user", {
      status: 403,
    });
  }

  const conversationId = getConversationId(userId, contactId);
  const messages = await Message.find({ conversationId })
    .sort({ createdAt: 1 })
    .lean<
      {
        _id: { toString: () => string };
        conversationId: string;
        senderId: string;
        recipientId: string;
        body: string;
        readAt?: Date | null;
        createdAt: Date;
      }[]
    >();

  const mapped = messages.map((message) => ({
    _id: message._id.toString(),
    conversationId: message.conversationId,
    senderId: message.senderId,
    recipientId: message.recipientId,
    body: message.body,
    createdAt: message.createdAt.toISOString(),
    readAt: message.readAt ? message.readAt.toISOString() : null,
  }));

  return Response.json({ messages: mapped });
}

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = (await req.json()) as { contactId?: string; body?: string };
  const contactId = payload.contactId?.trim();
  const body = payload.body?.trim();

  if (!contactId || !body) {
    return new Response("contactId and body are required", { status: 400 });
  }

  await connectDB();

  const [me, contact] = await Promise.all([
    User.findOne({ clerkId: userId })
      .select("role")
      .lean<{ role?: "farmer" | "mill" | "officer" | "none" } | null>(),
    User.findOne({ clerkId: contactId })
      .select("role")
      .lean<{ role?: "farmer" | "mill" | "officer" | "none" } | null>(),
  ]);

  if (!me || !contact) {
    return new Response("User not found", { status: 404 });
  }

  const myRole = toChatRole(me.role);
  const contactRole = toChatRole(contact.role);

  if (!myRole || !contactRole || !isAllowedChatPair(myRole, contactRole)) {
    return new Response("You are not allowed to chat with this user", {
      status: 403,
    });
  }

  const conversationId = getConversationId(userId, contactId);
  const created = await Message.create({
    conversationId,
    senderId: userId,
    recipientId: contactId,
    body,
  });

  const messagePayload: MessagePayload = {
    _id: created._id.toString(),
    conversationId,
    senderId: userId,
    recipientId: contactId,
    body: created.body,
    createdAt: created.createdAt.toISOString(),
    readAt: created.readAt ? created.readAt.toISOString() : null,
  };

  if (userId !== contactId) {
    try {
      const notification = await Notification.create({
        clerkId: contactId,
        type: "message",
        title: "New chat message",
        description: created.body,
      });

      if (isPusherConfigured()) {
        await pusherServer.trigger(
          `private-user-${contactId}`,
          "notification:new",
          {
            id: notification._id.toString(),
            type: notification.type,
            title: notification.title,
            description: notification.description,
            read: notification.read,
            createdAt: notification.createdAt.toISOString(),
          },
        );
      }
    } catch (notifyError) {
      console.error("[chat] Failed to create notification", notifyError);
    }
  }

  if (!isPusherConfigured()) {
    console.warn(
      `[chat] Pusher is not configured. Missing env vars: ${getMissingPusherEnvVars().join(", ")}`,
    );
    return Response.json({ message: messagePayload }, { status: 201 });
  }

  try {
    await Promise.all([
      pusherServer.trigger(
        `private-user-${contactId}`,
        EVENT_NAME,
        messagePayload,
      ),
      pusherServer.trigger(
        `private-user-${userId}`,
        EVENT_NAME,
        messagePayload,
      ),
    ]);
  } catch (error) {
    // Persisted message is still valid; realtime delivery can be retried by clients via fetch.
    console.error("[chat] Failed to publish Pusher event", error);
  }

  return Response.json({ message: messagePayload }, { status: 201 });
}

export async function PATCH(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = (await req.json()) as { contactId?: string };
  const contactId = payload.contactId?.trim();

  if (!contactId) {
    return new Response("contactId is required", { status: 400 });
  }

  await connectDB();

  const [me, contact] = await Promise.all([
    User.findOne({ clerkId: userId })
      .select("role")
      .lean<{ role?: "farmer" | "mill" | "officer" | "none" } | null>(),
    User.findOne({ clerkId: contactId })
      .select("role")
      .lean<{ role?: "farmer" | "mill" | "officer" | "none" } | null>(),
  ]);

  const myRole = toChatRole(me?.role);
  const contactRole = toChatRole(contact?.role);

  if (!myRole || !contactRole || !isAllowedChatPair(myRole, contactRole)) {
    return new Response("Invalid contact", { status: 404 });
  }

  const conversationId = getConversationId(userId, contactId);
  const now = new Date();

  const result = await Message.updateMany(
    {
      conversationId,
      senderId: contactId,
      recipientId: userId,
      readAt: null,
    },
    {
      $set: {
        readAt: now,
      },
    },
  );

  if (result.modifiedCount > 0 && isPusherConfigured()) {
    try {
      await pusherServer.trigger(`private-user-${contactId}`, READ_EVENT_NAME, {
        conversationId,
        readerId: userId,
        contactId,
        readAt: now.toISOString(),
      });
    } catch (error) {
      console.error("[chat] Failed to publish read receipt", error);
    }
  }

  return Response.json({
    conversationId,
    contactId,
    markedCount: result.modifiedCount,
    readAt: now.toISOString(),
  });
}

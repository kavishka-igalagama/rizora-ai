import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import {
  getMissingPusherEnvVars,
  isPusherConfigured,
  default as pusherServer,
} from "@/lib/pusher-server";
import { getConversationId } from "@/lib/chat";

const TYPING_EVENT_NAME = "typing";

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

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = (await req.json()) as {
    contactId?: string;
    isTyping?: boolean;
  };

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

  const eventPayload = {
    conversationId: getConversationId(userId, contactId),
    senderId: userId,
    recipientId: contactId,
    isTyping: Boolean(payload.isTyping),
    sentAt: new Date().toISOString(),
  };

  if (!isPusherConfigured()) {
    console.warn(
      `[chat] Pusher is not configured. Missing env vars: ${getMissingPusherEnvVars().join(", ")}`,
    );
    return Response.json({ typing: eventPayload });
  }

  try {
    await pusherServer.trigger(
      `private-user-${contactId}`,
      TYPING_EVENT_NAME,
      eventPayload,
    );
  } catch (error) {
    console.error("[chat] Failed to publish typing event", error);
  }

  return Response.json({ typing: eventPayload });
}

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

  const validRoles = new Set(["farmer", "mill"]);
  if (!validRoles.has(me.role || "") || !validRoles.has(contact.role || "")) {
    return new Response("Only farmer and mill users can chat", { status: 403 });
  }

  if (me.role === contact.role) {
    return new Response("Farmer can only chat with mill and vice versa", {
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

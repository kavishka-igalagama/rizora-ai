import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Message from "@/lib/models/Message";
import User from "@/lib/models/User";
import { getConversationId } from "@/lib/chat";

type ContactResponse = {
  clerkId: string;
  name: string;
  role: "farmer" | "mill";
  district?: string;
  millName?: string;
  imageUrl?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
};

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  await connectDB();

  const me = await User.findOne({ clerkId: userId })
    .select("clerkId role")
    .lean<{
      clerkId: string;
      role?: "farmer" | "mill" | "officer" | "none";
    } | null>();

  if (!me) {
    return new Response("User not found", { status: 404 });
  }

  if (me.role !== "farmer" && me.role !== "mill") {
    return Response.json({ contacts: [] as ContactResponse[] });
  }

  const oppositeRole = me.role === "farmer" ? "mill" : "farmer";
  const contacts = await User.find({ role: oppositeRole })
    .select("clerkId firstName lastName district millName imageUrl role")
    .lean<
      {
        clerkId: string;
        firstName?: string;
        lastName?: string;
        district?: string;
        millName?: string;
        imageUrl?: string;
        role?: "farmer" | "mill";
      }[]
    >();

  const mappedContacts = await Promise.all(
    contacts.map(async (contact) => {
      const conversationId = getConversationId(userId, contact.clerkId);
      const lastMessage = await Message.findOne({ conversationId })
        .sort({ createdAt: -1 })
        .select("body createdAt")
        .lean<{ body: string; createdAt: Date } | null>();

      const name =
        contact.role === "mill"
          ? contact.millName ||
            `${contact.firstName || ""} ${contact.lastName || ""}`.trim() ||
            "Mill"
          : `${contact.firstName || ""} ${contact.lastName || ""}`.trim() ||
            "Farmer";

      return {
        clerkId: contact.clerkId,
        name,
        role: (contact.role || oppositeRole) as "farmer" | "mill",
        district: contact.district,
        millName: contact.millName,
        imageUrl: contact.imageUrl,
        lastMessage: lastMessage?.body,
        lastMessageAt: lastMessage?.createdAt?.toISOString(),
        unreadCount: await Message.countDocuments({
          conversationId,
          recipientId: userId,
          readAt: null,
        }),
      } satisfies ContactResponse;
    }),
  );

  mappedContacts.sort((a, b) => {
    if (!a.lastMessageAt && !b.lastMessageAt)
      return a.name.localeCompare(b.name);
    if (!a.lastMessageAt) return 1;
    if (!b.lastMessageAt) return -1;
    return (
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  });

  return Response.json({ contacts: mappedContacts });
}

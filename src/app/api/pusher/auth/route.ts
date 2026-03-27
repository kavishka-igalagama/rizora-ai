import { auth } from "@clerk/nextjs/server";
import {
  getMissingPusherEnvVars,
  isPusherConfigured,
  default as pusherServer,
} from "@/lib/pusher-server";

export async function POST(req: Request) {
  if (!isPusherConfigured()) {
    return Response.json(
      {
        error: "Pusher is not configured",
        missing: getMissingPusherEnvVars(),
      },
      { status: 500 },
    );
  }

  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const formData = await req.formData();
  const socketId = formData.get("socket_id")?.toString();
  const channelName = formData.get("channel_name")?.toString();

  if (!socketId || !channelName) {
    return new Response("Missing auth parameters", { status: 400 });
  }

  if (!channelName.startsWith("private-user-")) {
    return new Response("Invalid channel", { status: 403 });
  }

  const currentUserChannel = `private-user-${userId}`;
  if (channelName !== currentUserChannel) {
    return new Response("Forbidden", { status: 403 });
  }

  const authResponse = pusherServer.authorizeChannel(socketId, channelName);
  return Response.json(authResponse);
}

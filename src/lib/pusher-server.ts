import Pusher from "pusher";

const pusherConfig = {
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
};

export function isPusherConfigured(): boolean {
  return Boolean(
    pusherConfig.appId &&
    pusherConfig.key &&
    pusherConfig.secret &&
    pusherConfig.cluster,
  );
}

export function getMissingPusherEnvVars(): string[] {
  const missing: string[] = [];

  if (!pusherConfig.appId) missing.push("PUSHER_APP_ID");
  if (!pusherConfig.key) missing.push("NEXT_PUBLIC_PUSHER_KEY");
  if (!pusherConfig.secret) missing.push("PUSHER_SECRET");
  if (!pusherConfig.cluster) missing.push("NEXT_PUBLIC_PUSHER_CLUSTER");

  return missing;
}

const pusherServer = new Pusher({
  appId: pusherConfig.appId || "",
  key: pusherConfig.key || "",
  secret: pusherConfig.secret || "",
  cluster: pusherConfig.cluster || "",
  useTLS: true,
});

export default pusherServer;

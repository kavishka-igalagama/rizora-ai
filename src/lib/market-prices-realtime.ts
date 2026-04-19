import {
  default as pusherServer,
  getMissingPusherEnvVars,
  isPusherConfigured,
} from "@/lib/pusher-server";

export const MARKET_PRICES_CHANNEL = "market-prices";
export const MARKET_PRICES_EVENT = "prices-updated";

type MarketPriceRealtimeAction = "created" | "updated" | "deleted";

type MarketPriceRealtimePayload = {
  action: MarketPriceRealtimeAction;
  pricingId: string;
  millId: string;
  updatedAt: string;
};

export async function publishMarketPricesUpdate(
  payload: MarketPriceRealtimePayload,
): Promise<void> {
  if (!isPusherConfigured()) {
    console.warn(
      `[market-prices] Pusher is not configured. Missing env vars: ${getMissingPusherEnvVars().join(", ")}`,
    );
    return;
  }

  try {
    await pusherServer.trigger(
      MARKET_PRICES_CHANNEL,
      MARKET_PRICES_EVENT,
      payload,
    );
  } catch (error) {
    console.error("[market-prices] Failed to publish realtime update", error);
  }
}

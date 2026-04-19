"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Phone,
  MessageSquare,
  RefreshCw,
  BarChart3,
  LineChart,
  Building2,
  Wheat,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  AlertTriangle,
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import { getPusherClient } from "@/lib/pusher-client";
import {
  normalizeRiceVariety,
  RICE_VARIETIES,
  type RiceVariety,
} from "@/lib/rice-varieties";
import Loading from "@/components/loading";

type ApiMarketPrice = {
  id: string;
  millId: string;
  millName: string;
  millDistrict: string;
  millPhone?: string;
  region: string;
  variety: string;
  qualityGrade: "Grade A" | "Grade B" | "Grade C" | "Grade D";
  pricePerKg: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse = {
  prices: ApiMarketPrice[];
  total: number;
  generatedAt: string;
  userDistrict?: string | null;
};

type PriceBucket = "whiteRice" | "redRice" | "parboiled" | "basmati";

const MARKET_PRICES_CHANNEL = "market-prices";
const MARKET_PRICES_EVENT = "prices-updated";

const priceBuckets: Array<{ key: PriceBucket; label: string; icon: string }> = [
  { key: "whiteRice", label: "White Rice", icon: "WR" },
  { key: "redRice", label: "Red Rice", icon: "RR" },
  { key: "parboiled", label: "Parboiled", icon: "PB" },
  { key: "basmati", label: "Basmati / Samba", icon: "BS" },
];

const getBucketFromVariety = (variety: string): PriceBucket => {
  const normalized = normalizeRiceVariety(variety);

  if (normalized === "At 362" || normalized === "Pachchaperumal") {
    return "redRice";
  }

  if (
    normalized === "Samba" ||
    normalized === "Keeri Samba" ||
    normalized === "Suwandel"
  ) {
    return "basmati";
  }

  if (
    normalized === "Nadu" ||
    normalized === "Bg 300" ||
    normalized === "Bg 352"
  ) {
    return "whiteRice";
  }

  return "parboiled";
};

const average = (values: number[]) => {
  if (values.length === 0) return 0;
  return values.reduce((sum, n) => sum + n, 0) / values.length;
};

const getEmptyVarietyPriceMap = (): Record<RiceVariety, number | null> =>
  RICE_VARIETIES.reduce(
    (acc, variety) => {
      acc[variety] = null;
      return acc;
    },
    {} as Record<RiceVariety, number | null>,
  );

const trendFromDiff = (diff: number) => {
  if (diff > 0.25) return "up" as const;
  if (diff < -0.25) return "down" as const;
  return "stable" as const;
};

const getQualityLabel = (prices: ApiMarketPrice[]) => {
  const grades = prices.reduce<Record<string, number>>((acc, price) => {
    acc[price.qualityGrade] = (acc[price.qualityGrade] || 0) + 1;
    return acc;
  }, {});

  const sorted = Object.entries(grades).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || "Grade A";
};

const buildWindowAverage = (
  prices: ApiMarketPrice[],
  bucket: PriceBucket,
  start: Date,
  end: Date,
) => {
  const values = prices
    .filter((price) => {
      if (!price.isActive) return false;
      if (getBucketFromVariety(price.variety) !== bucket) return false;
      const updated = new Date(price.updatedAt).getTime();
      return updated >= start.getTime() && updated < end.getTime();
    })
    .map((price) => price.pricePerKg);

  return average(values);
};

const MarketPrices = () => {
  const [prices, setPrices] = useState<ApiMarketPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [userDistrict, setUserDistrict] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [hasAutoSelectedDistrict, setHasAutoSelectedDistrict] = useState(false);

  const fetchPrices = useCallback(async (silent = false) => {
    if (silent) {
      setIsSyncing(true);
    } else {
      setIsLoading(true);
      setError(null);
    }

    try {
      const response = await fetch("/api/market-prices", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch prices (${response.status})`);
      }

      const data = (await response.json()) as ApiResponse;
      setPrices(data.prices);
      setLastSyncedAt(new Date(data.generatedAt));
      setUserDistrict(data.userDistrict ?? null);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load data";
      setError(message);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    void fetchPrices();
  }, [fetchPrices]);

  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(MARKET_PRICES_CHANNEL);

    const handleRealtimeUpdate = () => {
      void fetchPrices(true);
    };

    channel.bind(MARKET_PRICES_EVENT, handleRealtimeUpdate);

    return () => {
      channel.unbind(MARKET_PRICES_EVENT, handleRealtimeUpdate);
      pusher.unsubscribe(MARKET_PRICES_CHANNEL);
    };
  }, [fetchPrices]);

  const activePrices = useMemo(
    () => prices.filter((price) => price.isActive),
    [prices],
  );

  const currentPrices = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    return priceBuckets.map((bucket) => {
      const current = buildWindowAverage(
        activePrices,
        bucket.key,
        sevenDaysAgo,
        now,
      );
      const previous = buildWindowAverage(
        activePrices,
        bucket.key,
        fourteenDaysAgo,
        sevenDaysAgo,
      );

      const fallbackCurrent = average(
        activePrices
          .filter((price) => getBucketFromVariety(price.variety) === bucket.key)
          .map((price) => price.pricePerKg),
      );

      const currentPrice = current > 0 ? current : fallbackCurrent;
      const diff = currentPrice - previous;
      const change = previous > 0 ? (diff / previous) * 100 : 0;
      const bucketPrices = activePrices.filter(
        (price) => getBucketFromVariety(price.variety) === bucket.key,
      );

      return {
        variety: bucket.label,
        price: Number(currentPrice.toFixed(1)),
        change: Number(change.toFixed(1)),
        trend: trendFromDiff(diff),
        quality: getQualityLabel(bucketPrices),
        icon: bucket.icon,
      };
    });
  }, [activePrices]);

  const regionalPrices = useMemo(() => {
    const grouped = activePrices.reduce<Record<string, ApiMarketPrice[]>>(
      (acc, price) => {
        if (!acc[price.region]) acc[price.region] = [];
        acc[price.region].push(price);
        return acc;
      },
      {},
    );

    const overallAvg = average(activePrices.map((price) => price.pricePerKg));

    return Object.entries(grouped)
      .map(([region, values]) => {
        const byVarietyValues = values.reduce<Record<RiceVariety, number[]>>(
          (acc, price) => {
            const normalized = normalizeRiceVariety(price.variety);
            if (!normalized) return acc;

            acc[normalized] = [...acc[normalized], price.pricePerKg];
            return acc;
          },
          RICE_VARIETIES.reduce(
            (acc, variety) => {
              acc[variety] = [];
              return acc;
            },
            {} as Record<RiceVariety, number[]>,
          ),
        );

        const pricesByVariety = getEmptyVarietyPriceMap();
        RICE_VARIETIES.forEach((variety) => {
          const valuesForVariety = byVarietyValues[variety];
          pricesByVariety[variety] =
            valuesForVariety.length > 0
              ? Number(average(valuesForVariety).toFixed(1))
              : null;
        });

        const regionAvg = average(values.map((price) => price.pricePerKg));

        return {
          region,
          pricesByVariety,
          trend: trendFromDiff(regionAvg - overallAvg),
        };
      })
      .sort((a, b) => a.region.localeCompare(b.region));
  }, [activePrices]);

  const millPrices = useMemo(() => {
    const grouped = activePrices.reduce<Record<string, ApiMarketPrice[]>>(
      (acc, price) => {
        if (!acc[price.millId]) acc[price.millId] = [];
        acc[price.millId].push(price);
        return acc;
      },
      {},
    );

    return Object.values(grouped)
      .map((entries) => {
        const first = entries[0];
        const byVarietyValues = entries.reduce<Record<RiceVariety, number[]>>(
          (acc, price) => {
            const normalized = normalizeRiceVariety(price.variety);
            if (!normalized) return acc;

            acc[normalized] = [...acc[normalized], price.pricePerKg];
            return acc;
          },
          RICE_VARIETIES.reduce(
            (acc, variety) => {
              acc[variety] = [];
              return acc;
            },
            {} as Record<RiceVariety, number[]>,
          ),
        );

        const pricesByVariety = getEmptyVarietyPriceMap();
        RICE_VARIETIES.forEach((variety) => {
          const valuesForVariety = byVarietyValues[variety];
          pricesByVariety[variety] =
            valuesForVariety.length > 0
              ? Number(average(valuesForVariety).toFixed(1))
              : null;
        });

        const latestUpdate = entries
          .map((price) => new Date(price.updatedAt).getTime())
          .sort((a, b) => b - a)[0];

        return {
          mill: first.millName,
          location: first.region,
          district: first.millDistrict,
          pricesByVariety,
          quality: getQualityLabel(entries),
          contact: first.millPhone || "Contact unavailable",
          lastUpdated: new Date(latestUpdate).toLocaleString(),
        };
      })
      .sort((a, b) => a.mill.localeCompare(b.mill));
  }, [activePrices]);

  const availableDistricts = useMemo(
    () => [...new Set(millPrices.map((mill) => mill.district))].sort(),
    [millPrices],
  );

  useEffect(() => {
    if (hasAutoSelectedDistrict) return;
    if (selectedDistrict !== "all") return;
    if (!userDistrict) return;
    if (!availableDistricts.includes(userDistrict)) return;

    setSelectedDistrict(userDistrict);
    setHasAutoSelectedDistrict(true);
  }, [
    userDistrict,
    availableDistricts,
    selectedDistrict,
    hasAutoSelectedDistrict,
  ]);

  const filteredMillPrices = useMemo(() => {
    if (selectedDistrict === "all") return millPrices;
    return millPrices.filter((mill) => mill.district === selectedDistrict);
  }, [millPrices, selectedDistrict]);

  const weeklyPriceTrend = useMemo(() => {
    const now = new Date();
    const rows: Array<{
      week: string;
      whiteRice: number;
      redRice: number;
      parboiled: number;
    }> = [];

    for (let i = 3; i >= 0; i -= 1) {
      const end = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

      rows.push({
        week: `Week ${4 - i}`,
        whiteRice: Number(
          buildWindowAverage(activePrices, "whiteRice", start, end).toFixed(1),
        ),
        redRice: Number(
          buildWindowAverage(activePrices, "redRice", start, end).toFixed(1),
        ),
        parboiled: Number(
          buildWindowAverage(activePrices, "parboiled", start, end).toFixed(1),
        ),
      });
    }

    const fallbackWhite = average(
      activePrices
        .filter((p) => getBucketFromVariety(p.variety) === "whiteRice")
        .map((p) => p.pricePerKg),
    );
    const fallbackRed = average(
      activePrices
        .filter((p) => getBucketFromVariety(p.variety) === "redRice")
        .map((p) => p.pricePerKg),
    );
    const fallbackParboiled = average(
      activePrices
        .filter((p) => getBucketFromVariety(p.variety) === "parboiled")
        .map((p) => p.pricePerKg),
    );

    return rows.map((row) => ({
      ...row,
      whiteRice: row.whiteRice || Number(fallbackWhite.toFixed(1)),
      redRice: row.redRice || Number(fallbackRed.toFixed(1)),
      parboiled: row.parboiled || Number(fallbackParboiled.toFixed(1)),
    }));
  }, [activePrices]);

  const monthlyPriceTrend = useMemo(() => {
    const now = new Date();
    const rows: Array<{
      month: string;
      whiteRice: number;
      redRice: number;
      basmati: number;
    }> = [];

    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const month = date.toLocaleDateString("en-LK", { month: "short" });

      rows.push({
        month,
        whiteRice: Number(
          buildWindowAverage(activePrices, "whiteRice", date, nextDate).toFixed(
            1,
          ),
        ),
        redRice: Number(
          buildWindowAverage(activePrices, "redRice", date, nextDate).toFixed(
            1,
          ),
        ),
        basmati: Number(
          buildWindowAverage(activePrices, "basmati", date, nextDate).toFixed(
            1,
          ),
        ),
      });
    }

    const defaultWhite = average(
      activePrices
        .filter((p) => getBucketFromVariety(p.variety) === "whiteRice")
        .map((p) => p.pricePerKg),
    );
    const defaultRed = average(
      activePrices
        .filter((p) => getBucketFromVariety(p.variety) === "redRice")
        .map((p) => p.pricePerKg),
    );
    const defaultBasmati = average(
      activePrices
        .filter((p) => getBucketFromVariety(p.variety) === "basmati")
        .map((p) => p.pricePerKg),
    );

    return rows.map((row) => ({
      ...row,
      whiteRice: row.whiteRice || Number(defaultWhite.toFixed(1)),
      redRice: row.redRice || Number(defaultRed.toFixed(1)),
      basmati: row.basmati || Number(defaultBasmati.toFixed(1)),
    }));
  }, [activePrices]);

  const varietyComparison = useMemo(() => {
    const grouped = activePrices.reduce<Record<string, number[]>>(
      (acc, price) => {
        const normalizedVariety = normalizeRiceVariety(price.variety);
        if (!normalizedVariety) return acc;

        if (!acc[normalizedVariety]) acc[normalizedVariety] = [];
        acc[normalizedVariety].push(price.pricePerKg);
        return acc;
      },
      {},
    );

    return Object.entries(grouped)
      .map(([variety, values]) => ({
        variety,
        price: Number(average(values).toFixed(1)),
      }))
      .sort((a, b) => b.price - a.price)
      .slice(0, 8);
  }, [activePrices]);

  const stats = useMemo(() => {
    const all = activePrices.map((price) => price.pricePerKg);
    const averagePrice = average(all);
    const highest = all.length > 0 ? Math.max(...all) : 0;
    const lowest = all.length > 0 ? Math.min(...all) : 0;

    const now = new Date();
    const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const prev60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentAvg = average(
      activePrices
        .filter((price) => new Date(price.updatedAt) >= last30)
        .map((price) => price.pricePerKg),
    );

    const previousAvg = average(
      activePrices
        .filter((price) => {
          const updated = new Date(price.updatedAt);
          return updated >= prev60 && updated < last30;
        })
        .map((price) => price.pricePerKg),
    );

    const monthlyChange =
      previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

    return {
      lowest,
      highest,
      averagePrice,
      monthlyChange,
      lowestMeta:
        activePrices.find((price) => price.pricePerKg === lowest) || null,
      highestMeta:
        activePrices.find((price) => price.pricePerKg === highest) || null,
    };
  }, [activePrices]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto px-8 py-8">
        <div className="mx-auto">
          <div className="mb-8 animate-fade-in flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-3">
                Real-Time Paddy Market Prices
              </h1>
              <p className="text-muted-foreground text-lg">
                Live market data from mill price updates across regions
              </p>
              {lastSyncedAt ? (
                <p className="text-xs text-muted-foreground mt-2">
                  Last synced: {lastSyncedAt.toLocaleString("en-LK")}
                </p>
              ) : null}
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                void fetchPrices(true);
              }}
            >
              <RefreshCw
                className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
              />
              {isSyncing ? "Syncing..." : "Refresh"}
            </Button>
          </div>

          {error ? (
            <Card className="border-destructive/40 mb-6">
              <CardContent className="p-4 flex items-center gap-3 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                <p>{error}</p>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
            {currentPrices.map((item) => (
              <Card
                key={item.variety}
                className="border-border hover:shadow-lg transition-all group overflow-hidden"
              >
                <CardContent className="p-6 relative">
                  <div
                    className={`absolute top-0 right-0 w-20 h-20 opacity-10 ${
                      item.trend === "up"
                        ? "text-success"
                        : item.trend === "down"
                          ? "text-destructive"
                          : "text-muted-foreground"
                    }`}
                  >
                    <span className="text-6xl">{item.icon}</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {item.variety}
                        </p>
                        <p className="text-3xl font-bold text-foreground">
                          LKR {item.price}
                        </p>
                        <p className="text-xs text-muted-foreground">per kg</p>
                      </div>
                      <Badge
                        variant={
                          item.trend === "up"
                            ? "default"
                            : item.trend === "down"
                              ? "destructive"
                              : "secondary"
                        }
                        className="gap-1"
                      >
                        {item.trend === "up" ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : item.trend === "down" ? (
                          <ArrowDownRight className="w-3 h-3" />
                        ) : (
                          <Minus className="w-3 h-3" />
                        )}
                        {item.quality}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {item.trend === "up" ? (
                        <div className="flex items-center gap-1 text-success bg-success/10 px-2 py-1 rounded-full">
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-semibold">+{item.change}%</span>
                        </div>
                      ) : item.trend === "down" ? (
                        <div className="flex items-center gap-1 text-destructive bg-destructive/10 px-2 py-1 rounded-full">
                          <TrendingDown className="w-4 h-4" />
                          <span className="font-semibold">{item.change}%</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-muted-foreground bg-muted px-2 py-1 rounded-full">
                          <Minus className="w-4 h-4" />
                          <span className="font-semibold">0%</span>
                        </div>
                      )}
                      <span className="text-muted-foreground">
                        from previous window
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="regional" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 h-14">
              <TabsTrigger
                value="regional"
                className="gap-2 data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
              >
                <MapPin className="w-4 h-4" />
                Regional Prices
              </TabsTrigger>
              <TabsTrigger
                value="mills"
                className="gap-2 data-[state=active]:bg-linear-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white"
              >
                <Building2 className="w-4 h-4" />
                Mill Prices
              </TabsTrigger>
              <TabsTrigger
                value="trends"
                className="gap-2 data-[state=active]:bg-linear-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
              >
                <LineChart className="w-4 h-4" />
                Price Trends
              </TabsTrigger>
            </TabsList>

            <TabsContent value="regional" className="space-y-4">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Prices by Region</CardTitle>
                  <CardDescription>
                    Live averages across registered mill listings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4">Region</th>
                          {RICE_VARIETIES.map((variety) => (
                            <th key={variety} className="text-center py-3 px-4">
                              {variety}
                            </th>
                          ))}
                          <th className="text-center py-3 px-4">Trend</th>
                        </tr>
                      </thead>
                      <tbody>
                        {regionalPrices.map((region) => (
                          <tr
                            key={region.region}
                            className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                          >
                            <td className="py-4 px-4 font-semibold">
                              {region.region}
                            </td>
                            {RICE_VARIETIES.map((variety) => (
                              <td
                                key={variety}
                                className="text-center py-4 px-4"
                              >
                                {region.pricesByVariety[variety] === null
                                  ? "-"
                                  : `LKR ${region.pricesByVariety[variety]}`}
                              </td>
                            ))}
                            <td className="text-center py-4 px-4">
                              {region.trend === "up" ? (
                                <Badge className="bg-success/10 text-success border-success/20">
                                  Up
                                </Badge>
                              ) : region.trend === "down" ? (
                                <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                                  Down
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Stable</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mills" className="space-y-4">
              <Card className="border-border">
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle>Paddy Mill Purchase Prices</CardTitle>
                      <CardDescription>
                        Live prices published by mills
                      </CardDescription>
                    </div>
                    <div className="w-full md:w-56">
                      <Select
                        value={selectedDistrict}
                        onValueChange={(value) => {
                          setSelectedDistrict(value);
                          setHasAutoSelectedDistrict(true);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by district" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Districts</SelectItem>
                          {availableDistricts.map((district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredMillPrices.map((mill) => (
                      <div
                        key={`${mill.mill}-${mill.location}-${mill.district}`}
                        className="p-5 rounded-xl bg-muted/50 hover:bg-muted transition-all border border-transparent hover:border-amber-500/20"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-foreground">
                              {mill.mill}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span>
                                {mill.location} ({mill.district})
                              </span>
                            </div>
                          </div>
                          <Badge variant="outline">{mill.quality}</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {RICE_VARIETIES.map((variety) => (
                            <div
                              key={variety}
                              className="p-3 rounded-lg bg-background/50"
                            >
                              <p className="text-xs text-muted-foreground mb-1">
                                {variety}
                              </p>
                              <p className="text-base font-semibold text-primary">
                                {mill.pricesByVariety[variety] === null
                                  ? "-"
                                  : `LKR ${mill.pricesByVariety[variety]}/kg`}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="text-xs text-muted-foreground mb-4">
                          Updated: {mill.lastUpdated}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-1"
                            disabled={mill.contact === "Contact unavailable"}
                          >
                            <Phone className="w-3 h-3" />
                            {mill.contact === "Contact unavailable"
                              ? "No Contact"
                              : "Call"}
                          </Button>
                          <Button size="sm" className="flex-1 gap-1" asChild>
                            <Link href="/messages">
                              <MessageSquare className="w-3 h-3" />
                              Message
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Weekly Price Trend</CardTitle>
                  <CardDescription>Last 4 weekly windows</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyPriceTrend}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-muted"
                        />
                        <XAxis
                          dataKey="week"
                          className="text-muted-foreground"
                        />
                        <YAxis className="text-muted-foreground" />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="whiteRice"
                          stroke="#10b981"
                          fill="#10b98133"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="redRice"
                          stroke="#f59e0b"
                          fill="#f59e0b33"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      6-Month Price History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart data={monthlyPriceTrend}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            className="stroke-muted"
                          />
                          <XAxis
                            dataKey="month"
                            className="text-muted-foreground"
                          />
                          <YAxis className="text-muted-foreground" />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="whiteRice"
                            stroke="#10b981"
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="redRice"
                            stroke="#f59e0b"
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="basmati"
                            stroke="#0ea5e9"
                            strokeWidth={2}
                          />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Variety Price Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={varietyComparison} layout="vertical">
                          <CartesianGrid
                            strokeDasharray="3 3"
                            className="stroke-muted"
                          />
                          <XAxis
                            type="number"
                            className="text-muted-foreground"
                          />
                          <YAxis
                            type="category"
                            dataKey="variety"
                            className="text-muted-foreground"
                            width={95}
                          />
                          <Tooltip />
                          <Bar
                            dataKey="price"
                            fill="#14b8a6"
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Price Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                      <p className="text-sm text-muted-foreground mb-1">
                        Lowest Price
                      </p>
                      <p className="text-3xl font-bold text-destructive">
                        LKR {stats.lowest.toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.lowestMeta?.variety || "-"}
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <p className="text-sm text-muted-foreground mb-1">
                        Average Price
                      </p>
                      <p className="text-3xl font-bold text-foreground">
                        LKR {stats.averagePrice.toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        All active listings
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                      <p className="text-sm text-muted-foreground mb-1">
                        Highest Price
                      </p>
                      <p className="text-3xl font-bold text-success">
                        LKR {stats.highest.toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.highestMeta?.variety || "-"}
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-teal-500/10 border border-teal-500/20">
                      <p className="text-sm text-muted-foreground mb-1">
                        Monthly Change
                      </p>
                      <p className="text-3xl font-bold text-primary">
                        {stats.monthlyChange.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Compared with previous 30 days
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-linear-to-r from-primary/5 to-emerald-500/5">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Wheat className="w-5 h-5" />
                    Market Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-background/50">
                      <h4 className="font-semibold text-foreground mb-1">
                        Most Active Region
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {regionalPrices[0]?.region || "No data yet"} currently
                        has live listings from mills.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50">
                      <h4 className="font-semibold text-foreground mb-1">
                        Current Average
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Active market average is LKR{" "}
                        {stats.averagePrice.toFixed(1)} per kg across varieties.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50">
                      <h4 className="font-semibold text-foreground mb-1">
                        Realtime Enabled
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        This page auto-updates when mills publish price changes
                        via Pusher.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default MarketPrices;

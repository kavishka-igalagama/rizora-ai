"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileWarning,
  Activity,
  MapPin,
  Megaphone,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type MarketPrice = {
  id: string;
  variety: string;
  pricePerKg: number;
  previousPrice?: number;
  isActive: boolean;
};

type MarketPricesResponse = {
  prices: MarketPrice[];
};

const diseaseFrequency = [
  { name: "Blast", count: 48 },
  { name: "Brown Spot", count: 32 },
  { name: "Sheath Blight", count: 21 },
  { name: "Bacterial Blight", count: 18 },
  { name: "Tungro", count: 9 },
];

const regionData = [
  { name: "Anuradhapura", value: 34 },
  { name: "Polonnaruwa", value: 26 },
  { name: "Kurunegala", value: 22 },
  { name: "Hambantota", value: 15 },
  { name: "Ampara", value: 31 },
];

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--destructive))",
];

const advisoryPosts = [
  {
    id: 1,
    title: "Brown Spot මර්දනයට නිර්දේශිත කෘමිනාශක",
    date: "2026-04-15",
    category: "Disease Control",
  },
  {
    id: 2,
    title: "අස්වැන්න කාලයට පෙර ජල කළමනාකරණය",
    date: "2026-04-12",
    category: "Best Practice",
  },
  {
    id: 3,
    title: "වැහි කාලය සඳහා පූර්ව සූදානම - අනතුරු ඇඟවීම",
    date: "2026-04-10",
    category: "Weather Alert",
  },
  {
    id: 4,
    title: "Samba වර්ගයට නිර්දේශිත පොහොර මාත්‍රාව",
    date: "2026-04-08",
    category: "Fertilizer",
  },
];

const OfficerDashboard = () => {
  const [millPrices, setMillPrices] = useState<MarketPrice[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadPrices = async () => {
      try {
        const response = await fetch("/api/market-prices", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as MarketPricesResponse;
        if (!isMounted || !Array.isArray(data.prices)) {
          return;
        }

        setMillPrices(data.prices.filter((price) => price.isActive));
      } catch {
        // Keep dashboard functional even if price API is temporarily unavailable.
      }
    };

    void loadPrices();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalFarmers = 1247;
  const totalReports = 128;
  const mostCommon = diseaseFrequency[0];

  const priceSummary = useMemo(
    () =>
      Array.from(
        millPrices.reduce((acc, p) => {
          if (!acc.has(p.variety))
            acc.set(p.variety, { total: 0, count: 0, prev: 0 });
          const entry = acc.get(p.variety)!;
          entry.total += p.pricePerKg;
          entry.prev += p.previousPrice ?? p.pricePerKg;
          entry.count += 1;
          return acc;
        }, new Map<string, { total: number; count: number; prev: number }>()),
      )
        .map(([variety, v]) => ({
          variety,
          avg: v.total / v.count,
          change: v.prev > 0 ? ((v.total - v.prev) / v.prev) * 100 : 0,
        }))
        .slice(0, 5),
    [millPrices],
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <main className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Officer Dashboard
            </h1>
            <p className="text-muted-foreground text-md mt-1">
              Monitoring & analytical control center
            </p>
          </div>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Farmers
              </CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {totalFarmers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Registered in system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Disease Reports
              </CardTitle>
              <FileWarning className="w-4 h-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {totalReports}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total submissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Most Common (This Month)
              </CardTitle>
              <Activity className="w-4 h-4 text-accent-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {mostCommon.name}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {mostCommon.count} reports
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Disease Frequency</CardTitle>
              <CardDescription>
                Most reported diseases this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={diseaseFrequency}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Region-wise Disease Summary
              </CardTitle>
              <CardDescription>
                Reports distribution by district
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={regionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(e) => `${e.name}: ${e.value}`}
                    labelLine={false}
                    fontSize={11}
                  >
                    {regionData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Megaphone className="w-4 h-4" /> Recent Advisory Posts
              </CardTitle>
              <CardDescription>Latest published guidance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {advisoryPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-1">
                      {post.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {post.date}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {post.category}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Mill Price Summary
              </CardTitle>
              <CardDescription>
                Average prices across active mills (LKR/kg)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {priceSummary.map((p) => {
                const up = p.change >= 0;
                return (
                  <div
                    key={p.variety}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {p.variety}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Avg across grades
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-foreground">
                        Rs. {p.avg.toFixed(0)}
                      </p>
                      <p
                        className={`text-xs flex items-center gap-1 justify-end ${up ? "text-primary" : "text-destructive"}`}
                      >
                        {up ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {Math.abs(p.change).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default OfficerDashboard;

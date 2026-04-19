"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RICE_VARIETIES, type RiceVariety } from "@/lib/rice-varieties";
import {
  getOfficerMillPricings,
  type OfficerMillPriceItem,
} from "@/lib/actions/officer/mill-pricing";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Factory,
  MapPin,
  Filter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Loading from "@/components/loading";

type QualityGrade = "A" | "B" | "C" | "D";

interface PriceEntry {
  id: string;
  variety: RiceVariety;
  grade: QualityGrade;
  pricePerKg: number;
  previousPrice: number;
  isActive: boolean;
  lastUpdated: string;
}

const paddyVarieties: RiceVariety[] = [...RICE_VARIETIES];

interface EnrichedPrice extends PriceEntry {
  millId: string;
  millName: string;
  region: string;
}

function toEntry(item: OfficerMillPriceItem): EnrichedPrice {
  return {
    id: item.id,
    millId: item.millId,
    millName: item.millName,
    region: item.region,
    variety: item.variety,
    grade: item.grade,
    pricePerKg: item.pricePerKg,
    previousPrice: item.previousPrice,
    isActive: item.isActive,
    lastUpdated: item.lastUpdated,
  };
}

// Mock historical price points (last 7 days) per variety
function buildHistory(prices: EnrichedPrice[]) {
  const days = [
    "Day -6",
    "Day -5",
    "Day -4",
    "Day -3",
    "Day -2",
    "Day -1",
    "Today",
  ];
  return days.map((day, i) => {
    const point: Record<string, string | number> = { day };
    paddyVarieties.forEach((v) => {
      const matches = prices.filter((p) => p.variety === v);
      if (!matches.length) return;
      const avg =
        matches.reduce((s, p) => s + p.pricePerKg, 0) / matches.length;
      // Simulate small daily fluctuation
      const drift = Math.sin((i + v.length) / 2) * 4;
      point[v] = Math.round(avg + drift);
    });
    return point;
  });
}

const VARIETY_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(142 70% 45%)",
  "hsl(25 90% 55%)",
  "hsl(200 80% 50%)",
];

const OfficerMillPricingPage = () => {
  const [allPrices, setAllPrices] = useState<EnrichedPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [region, setRegion] = useState<string>("all");
  const [variety, setVariety] = useState<string>("all");
  const [grade, setGrade] = useState<string>("all");
  const [mill, setMill] = useState<string>("all");
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    getOfficerMillPricings()
      .then((result) => {
        if (!isMounted) return;

        if (result.success && result.prices) {
          setAllPrices(result.prices.map(toEntry));
          setLoadError(null);
        } else {
          setAllPrices([]);
          setLoadError(result.error || "Failed to load mill prices");
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setAllPrices([]);
        setLoadError("Failed to load mill prices");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const mills = useMemo(
    () =>
      Array.from(
        new Map(
          allPrices.map((p) => [p.millId, { id: p.millId, name: p.millName }]),
        ).values(),
      ),
    [allPrices],
  );

  const regions = useMemo(
    () => [...new Set(allPrices.map((p) => p.region))].sort(),
    [allPrices],
  );

  const filtered = useMemo(() => {
    return allPrices.filter((p) => {
      if (region !== "all" && p.region !== region) return false;
      if (variety !== "all" && p.variety !== variety) return false;
      if (grade !== "all" && p.grade !== grade) return false;
      if (mill !== "all" && p.millId !== mill) return false;
      if (date && !p.lastUpdated.startsWith(date)) return false;
      return true;
    });
  }, [allPrices, region, variety, grade, mill, date]);

  const stats = useMemo(() => {
    if (!filtered.length) return { min: 0, avg: 0, max: 0, count: 0 };
    const vals = filtered.map((p) => p.pricePerKg);
    return {
      min: Math.min(...vals),
      avg: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
      max: Math.max(...vals),
      count: filtered.length,
    };
  }, [filtered]);

  const regionalComparison = useMemo(() => {
    return regions
      .map((r) => {
        const inRegion = filtered.filter((p) => p.region === r);
        if (!inRegion.length) return { region: r, avg: 0, min: 0, max: 0 };
        const vals = inRegion.map((p) => p.pricePerKg);
        return {
          region: r,
          avg: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
          min: Math.min(...vals),
          max: Math.max(...vals),
        };
      })
      .filter((r) => r.avg > 0);
  }, [filtered, regions]);

  const history = useMemo(() => buildHistory(filtered), [filtered]);

  const resetFilters = () => {
    setRegion("all");
    setVariety("all");
    setGrade("all");
    setMill("all");
    setDate("");
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 p-6 space-y-6">
        <header className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Mill Pricing Monitoring
            </h1>
            <p className="text-muted-foreground mt-1">
              Oversee paddy prices across registered mills and regions.
            </p>
          </div>
          <Badge variant="outline" className="gap-2">
            <Factory className="w-3.5 h-3.5" />
            {mills.length} mills · {regions.length} regions
          </Badge>
        </header>

        {loadError ? (
          <Card className="border-destructive/40">
            <CardContent className="py-4 text-sm text-destructive">
              {loadError}
            </CardContent>
          </Card>
        ) : null}

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              <div>
                <Label className="text-xs">Region</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All regions</SelectItem>
                    {regions.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Variety</Label>
                <Select value={variety} onValueChange={setVariety}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All varieties</SelectItem>
                    {paddyVarieties.map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Grade</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All grades</SelectItem>
                    {["A", "B", "C", "D"].map((g) => (
                      <SelectItem key={g} value={g}>
                        Grade {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Mill</Label>
                <Select value={mill} onValueChange={setMill}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All mills</SelectItem>
                    {mills.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="text-sm text-primary hover:underline"
                >
                  Reset filters
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Entries</CardDescription>
              <CardTitle className="text-3xl">{stats.count}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" /> Min Price
              </CardDescription>
              <CardTitle className="text-3xl">Rs. {stats.min}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Minus className="w-3.5 h-3.5" /> Avg Price
              </CardDescription>
              <CardTitle className="text-3xl">Rs. {stats.avg}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Max Price
              </CardDescription>
              <CardTitle className="text-3xl">Rs. {stats.max}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs: Comparison / History / Entries */}
        <Tabs defaultValue="regional" className="space-y-4">
          <TabsList className="h-12 w-full">
            <TabsTrigger value="regional">Regional Comparison</TabsTrigger>
            <TabsTrigger value="history">Price History</TabsTrigger>
            <TabsTrigger value="entries">All Entries</TabsTrigger>
          </TabsList>

          <TabsContent value="regional">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Region-wise Price Comparison
                </CardTitle>
                <CardDescription>
                  Min, average and max prices grouped by region (filtered).
                </CardDescription>
              </CardHeader>
              <CardContent>
                {regionalComparison.length ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={regionalComparison}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="region" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="min"
                        fill="hsl(var(--muted-foreground))"
                        name="Min"
                      />
                      <Bar
                        dataKey="avg"
                        fill="hsl(var(--primary))"
                        name="Avg"
                      />
                      <Bar
                        dataKey="max"
                        fill="hsl(var(--secondary))"
                        name="Max"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground py-12 text-center">
                    No data for the selected filters.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>7-Day Price History by Variety</CardTitle>
                <CardDescription>
                  Average daily price trend for each paddy variety.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={340}>
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {paddyVarieties.map((v, i) => (
                      <Line
                        key={v}
                        type="monotone"
                        dataKey={v}
                        stroke={VARIETY_COLORS[i % VARIETY_COLORS.length]}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="entries">
            <Card>
              <CardHeader>
                <CardTitle>All Mill Price Entries</CardTitle>
                <CardDescription>
                  {filtered.length} entries match current filters.
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mill</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Variety</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead className="text-right">
                        Price (Rs/kg)
                      </TableHead>
                      <TableHead className="text-right">Change</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length ? (
                      filtered.map((p) => {
                        const diff = p.pricePerKg - p.previousPrice;
                        return (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium">
                              {p.millName}
                            </TableCell>
                            <TableCell>{p.region}</TableCell>
                            <TableCell>{p.variety}</TableCell>
                            <TableCell>
                              <Badge variant="outline">Grade {p.grade}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {p.pricePerKg}
                            </TableCell>
                            <TableCell className="text-right">
                              <span
                                className={`inline-flex items-center gap-1 text-xs ${
                                  diff > 0
                                    ? "text-primary"
                                    : diff < 0
                                      ? "text-destructive"
                                      : "text-muted-foreground"
                                }`}
                              >
                                {diff > 0 ? (
                                  <TrendingUp className="w-3 h-3" />
                                ) : diff < 0 ? (
                                  <TrendingDown className="w-3 h-3" />
                                ) : (
                                  <Minus className="w-3 h-3" />
                                )}
                                {diff > 0 ? "+" : ""}
                                {diff}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {new Date(p.lastUpdated).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={p.isActive ? "default" : "secondary"}
                              >
                                {p.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center text-muted-foreground py-8"
                        >
                          No entries match the selected filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default OfficerMillPricingPage;

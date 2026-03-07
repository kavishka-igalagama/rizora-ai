"use client";

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
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Calendar,
  Phone,
  MessageSquare,
  RefreshCw,
  BarChart3,
  LineChart,
  Building2,
  Wheat,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Info,
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

const MarketPrices = () => {
  const currentPrices = [
    {
      variety: "White Rice (BG 300)",
      price: 85,
      change: 2.5,
      trend: "up",
      quality: "Grade A",
      icon: "🌾",
    },
    {
      variety: "Red Rice (AT 362)",
      price: 95,
      change: 0,
      trend: "stable",
      quality: "Grade A",
      icon: "🍚",
    },
    {
      variety: "Parboiled Rice",
      price: 78,
      change: -1.2,
      trend: "down",
      quality: "Grade B",
      icon: "🌾",
    },
    {
      variety: "Basmati (Samba)",
      price: 120,
      change: 3.8,
      trend: "up",
      quality: "Premium",
      icon: "✨",
    },
  ];

  const regionalPrices = [
    {
      region: "Colombo",
      whiteRice: 85,
      redRice: 95,
      parboiled: 78,
      basmati: 120,
      trend: "up",
    },
    {
      region: "Kurunegala",
      whiteRice: 82,
      redRice: 92,
      parboiled: 75,
      basmati: 115,
      trend: "up",
    },
    {
      region: "Anuradhapura",
      whiteRice: 80,
      redRice: 90,
      parboiled: 73,
      basmati: 112,
      trend: "stable",
    },
    {
      region: "Polonnaruwa",
      whiteRice: 81,
      redRice: 91,
      parboiled: 74,
      basmati: 114,
      trend: "up",
    },
    {
      region: "Ampara",
      whiteRice: 79,
      redRice: 89,
      parboiled: 72,
      basmati: 110,
      trend: "down",
    },
    {
      region: "Hambantota",
      whiteRice: 80,
      redRice: 90,
      parboiled: 73,
      basmati: 113,
      trend: "stable",
    },
  ];

  const millPrices = [
    {
      mill: "Lanka Paddy Mills Ltd.",
      location: "Kurunegala",
      bgPrice: 83,
      atPrice: 92,
      quality: "Grade A",
      contact: "+94 77 123 4567",
      rating: 4.8,
      capacity: "50 MT/day",
    },
    {
      mill: "Ceylon Rice Industries",
      location: "Anuradhapura",
      bgPrice: 81,
      atPrice: 90,
      quality: "Grade A",
      contact: "+94 77 234 5678",
      rating: 4.6,
      capacity: "75 MT/day",
    },
    {
      mill: "Eastern Grain Processors",
      location: "Ampara",
      bgPrice: 80,
      atPrice: 89,
      quality: "Grade B",
      contact: "+94 77 345 6789",
      rating: 4.4,
      capacity: "40 MT/day",
    },
    {
      mill: "Southern Paddy Corporation",
      location: "Hambantota",
      bgPrice: 82,
      atPrice: 91,
      quality: "Grade A",
      contact: "+94 77 456 7890",
      rating: 4.7,
      capacity: "60 MT/day",
    },
  ];

  // Price trend data for charts
  const weeklyPriceTrend = [
    { week: "Week 1", whiteRice: 78, redRice: 88, parboiled: 72 },
    { week: "Week 2", whiteRice: 80, redRice: 90, parboiled: 74 },
    { week: "Week 3", whiteRice: 82, redRice: 92, parboiled: 76 },
    { week: "Week 4", whiteRice: 85, redRice: 95, parboiled: 78 },
  ];

  const monthlyPriceTrend = [
    { month: "Jul", whiteRice: 72, redRice: 82, basmati: 105 },
    { month: "Aug", whiteRice: 74, redRice: 84, basmati: 108 },
    { month: "Sep", whiteRice: 76, redRice: 86, basmati: 110 },
    { month: "Oct", whiteRice: 80, redRice: 90, basmati: 115 },
    { month: "Nov", whiteRice: 83, redRice: 93, basmati: 118 },
    { month: "Dec", whiteRice: 85, redRice: 95, basmati: 120 },
  ];

  const varietyComparison = [
    { variety: "BG 300", price: 85 },
    { variety: "BG 352", price: 82 },
    { variety: "AT 362", price: 95 },
    { variety: "BG 450", price: 80 },
    { variety: "Samba", price: 120 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto px-4 py-4">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                <Clock className="w-4 h-4" />
                <span>Updated: Today, 10:00 AM</span>
              </div>
              <Button variant="outline" size="icon">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto px-8 py-8">
        <div className="mx-auto">
          <div className="mb-8 animate-fade-in">
            <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-3">
              Real-Time Paddy Market Prices
            </h1>
            <p className="text-muted-foreground text-lg">
              Stay updated with current paddy prices by region and mill, with
              price trend analysis
            </p>
          </div>

          {/* Current Prices Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
            {currentPrices.map((item, index) => (
              <Card
                key={index}
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
                        from last week
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs for different views */}
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

            {/* Regional Prices */}
            <TabsContent value="regional" className="space-y-4">
              <Card className="border-border">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>Prices by Region</CardTitle>
                      <CardDescription>
                        Compare paddy prices across different districts in Sri
                        Lanka
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-semibold text-foreground">
                            Region
                          </th>
                          <th className="text-center py-3 px-4 font-semibold text-foreground">
                            White Rice (BG)
                          </th>
                          <th className="text-center py-3 px-4 font-semibold text-foreground">
                            Red Rice (AT)
                          </th>
                          <th className="text-center py-3 px-4 font-semibold text-foreground">
                            Parboiled
                          </th>
                          <th className="text-center py-3 px-4 font-semibold text-foreground">
                            Basmati
                          </th>
                          <th className="text-center py-3 px-4 font-semibold text-foreground">
                            Trend
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {regionalPrices.map((region, index) => (
                          <tr
                            key={index}
                            className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span className="font-semibold text-foreground">
                                  {region.region}
                                </span>
                              </div>
                            </td>
                            <td className="text-center py-4 px-4">
                              <span className="font-medium text-foreground">
                                LKR {region.whiteRice}
                              </span>
                            </td>
                            <td className="text-center py-4 px-4">
                              <span className="font-medium text-foreground">
                                LKR {region.redRice}
                              </span>
                            </td>
                            <td className="text-center py-4 px-4">
                              <span className="font-medium text-foreground">
                                LKR {region.parboiled}
                              </span>
                            </td>
                            <td className="text-center py-4 px-4">
                              <span className="font-medium text-foreground">
                                LKR {region.basmati}
                              </span>
                            </td>
                            <td className="text-center py-4 px-4">
                              {region.trend === "up" ? (
                                <Badge className="bg-success/10 text-success border-success/20">
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  Up
                                </Badge>
                              ) : region.trend === "down" ? (
                                <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                                  <TrendingDown className="w-3 h-3 mr-1" />
                                  Down
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <Minus className="w-3 h-3 mr-1" />
                                  Stable
                                </Badge>
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

            {/* Mill Prices */}
            <TabsContent value="mills" className="space-y-4">
              <Card className="border-border">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>Paddy Mill Purchase Prices</CardTitle>
                      <CardDescription>
                        Current buying prices from registered mills near you
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {millPrices.map((mill, index) => (
                      <div
                        key={index}
                        className="p-5 rounded-xl bg-muted/50 hover:bg-muted transition-all border border-transparent hover:border-amber-500/20"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground">
                                {mill.mill}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                <span>{mill.location}</span>
                              </div>
                            </div>
                          </div>
                          <Badge className="bg-success/10 text-success border-success/20">
                            ⭐ {mill.rating}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="p-3 rounded-lg bg-background/50">
                            <p className="text-xs text-muted-foreground mb-1">
                              BG Varieties
                            </p>
                            <p className="text-xl font-bold text-primary">
                              LKR {mill.bgPrice}/kg
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-background/50">
                            <p className="text-xs text-muted-foreground mb-1">
                              AT Varieties
                            </p>
                            <p className="text-xl font-bold text-primary">
                              LKR {mill.atPrice}/kg
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm mb-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{mill.quality}</Badge>
                            <span className="text-muted-foreground">
                              Capacity: {mill.capacity}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            Call
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

            {/* Price Trends */}
            <TabsContent value="trends" className="space-y-6">
              {/* Weekly Trend Chart */}
              <Card className="border-border">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <LineChart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>Weekly Price Trend</CardTitle>
                      <CardDescription>
                        Price movement over the last 4 weeks
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyPriceTrend}>
                        <defs>
                          <linearGradient
                            id="whiteRiceGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#10b981"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#10b981"
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="redRiceGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#f59e0b"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#f59e0b"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-muted"
                        />
                        <XAxis
                          dataKey="week"
                          className="text-muted-foreground"
                        />
                        <YAxis className="text-muted-foreground" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="whiteRice"
                          stroke="#10b981"
                          fill="url(#whiteRiceGradient)"
                          strokeWidth={2}
                          name="White Rice (BG)"
                        />
                        <Area
                          type="monotone"
                          dataKey="redRice"
                          stroke="#f59e0b"
                          fill="url(#redRiceGradient)"
                          strokeWidth={2}
                          name="Red Rice (AT)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="text-sm text-muted-foreground">
                        White Rice (BG)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span className="text-sm text-muted-foreground">
                        Red Rice (AT)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Trend & Variety Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      6-Month Price History
                    </CardTitle>
                    <CardDescription>
                      Long-term price trends by variety
                    </CardDescription>
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
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--background))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="whiteRice"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ fill: "#10b981" }}
                            name="White Rice"
                          />
                          <Line
                            type="monotone"
                            dataKey="redRice"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={{ fill: "#f59e0b" }}
                            name="Red Rice"
                          />
                          <Line
                            type="monotone"
                            dataKey="basmati"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            dot={{ fill: "#8b5cf6" }}
                            name="Basmati"
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
                    <CardDescription>
                      Current prices by rice variety
                    </CardDescription>
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
                            width={80}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--background))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar
                            dataKey="price"
                            fill="url(#barGradient)"
                            radius={[0, 4, 4, 0]}
                            name="Price (LKR/kg)"
                          />
                          <defs>
                            <linearGradient
                              id="barGradient"
                              x1="0"
                              y1="0"
                              x2="1"
                              y2="0"
                            >
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="100%" stopColor="#14b8a6" />
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Price Statistics */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Price Statistics & Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 rounded-xl bg-linear-to-br from-red-500/10 to-rose-500/10 border border-red-500/20">
                      <p className="text-sm text-muted-foreground mb-1">
                        Lowest Price
                      </p>
                      <p className="text-3xl font-bold text-destructive">
                        LKR 72
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Parboiled (Ampara)
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-linear-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
                      <p className="text-sm text-muted-foreground mb-1">
                        Average Price
                      </p>
                      <p className="text-3xl font-bold text-foreground">
                        LKR 85
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        All varieties
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-linear-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                      <p className="text-sm text-muted-foreground mb-1">
                        Highest Price
                      </p>
                      <p className="text-3xl font-bold text-success">LKR 120</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Basmati (Colombo)
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-linear-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                      <p className="text-sm text-muted-foreground mb-1">
                        Monthly Change
                      </p>
                      <p className="text-3xl font-bold text-primary">+8.9%</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Overall trend
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Market Insights */}
              <Card className="border-border bg-linear-to-r from-primary/5 to-emerald-500/5">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Wheat className="w-5 h-5" />
                    Market Insights & Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
                      <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                        <TrendingUp className="w-4 h-4 text-success" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">
                          Price Increase Expected
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Prices have increased by 8.9% over the past month due
                          to high demand
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">
                          Best Selling Region
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Colombo district offers the best prices for Grade A
                          quality paddy
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">
                          Best Time to Sell
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Next 2 weeks before harvest season peak for maximum
                          prices
                        </p>
                      </div>
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

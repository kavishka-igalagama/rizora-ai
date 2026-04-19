"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Factory,
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

type DashboardCountRow = {
  name: string;
  count: number;
};

type DashboardRegionRow = {
  name: string;
  value: number;
};

type DashboardAdvisory = {
  id: string;
  title: string;
  date: string;
  category: string;
};

type DashboardPriceSummary = {
  variety: string;
  avg: number;
  change: number;
};

type OfficerDashboardResponse = {
  summary: {
    totalFarmers: number;
    totalMills: number;
    totalReports: number;
    mostCommon: DashboardCountRow;
    officerDistrict: string | null;
  };
  diseaseFrequency: DashboardCountRow[];
  regionData: DashboardRegionRow[];
  advisoryPosts: DashboardAdvisory[];
  priceSummary: DashboardPriceSummary[];
  generatedAt: string;
};

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--destructive))",
];

const OfficerDashboard = () => {
  const [dashboardData, setDashboardData] =
    useState<OfficerDashboardResponse | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const response = await fetch("/api/officer/dashboard", {
          method: "GET",
          cache: "no-store",
        });

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          return;
        }

        const data = (await response.json()) as OfficerDashboardResponse;

        if (!response.ok) {
          return;
        }

        if (!isMounted || !Array.isArray(data.diseaseFrequency)) {
          return;
        }

        setDashboardData(data);
      } catch {
        // Keep dashboard functional even if dashboard API is temporarily unavailable.
      }
    };

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalFarmers = dashboardData?.summary.totalFarmers ?? 0;
  const totalMills = dashboardData?.summary.totalMills ?? 0;
  const totalReports = dashboardData?.summary.totalReports ?? 0;
  const diseaseFrequency = dashboardData?.diseaseFrequency ?? [];
  const regionData = dashboardData?.regionData ?? [];
  const advisoryPosts = dashboardData?.advisoryPosts ?? [];
  const priceSummary = dashboardData?.priceSummary ?? [];
  const mostCommon = dashboardData?.summary.mostCommon ||
    diseaseFrequency[0] || { name: "N/A", count: 0 };

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                Total Mills
              </CardTitle>
              <Factory className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {totalMills.toLocaleString()}
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
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Megaphone className="w-4 h-4" /> Recent Advisory Posts
                </CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/advisory">View All</Link>
                </Button>
              </div>
              <CardDescription>Latest published guidance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {advisoryPosts.length > 0 ? (
                advisoryPosts.map((post) => (
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
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No published advisories found.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Mill Price Summary
                </CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/mill-pricing">View All</Link>
                </Button>
              </div>
              <CardDescription>
                Average prices across active mills (LKR/kg)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {priceSummary.length > 0 ? (
                priceSummary.map((p) => {
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
                })
              ) : (
                <p className="text-sm text-muted-foreground">
                  No active mill prices found.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default OfficerDashboard;

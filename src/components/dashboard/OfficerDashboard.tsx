import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";
import {
  MapPin,
  TrendingUp,
  Users,
  AlertTriangle,
  BookOpen,
  BarChart3,
  CheckCircle,
} from "lucide-react";

type StatColor = "primary" | "warning" | "success" | "accent";
type StatCard = {
  label: string;
  value: string;
  icon: LucideIcon;
  color: StatColor;
};

type RegionStatus = "good" | "warning";
type RegionalStat = {
  region: string;
  farmers: number;
  diseases: number;
  avgYield: number;
  status: RegionStatus;
};

type Trend = "increasing" | "stable" | "decreasing";
type Severity = "high" | "medium" | "low";
type DiseaseHotspot = {
  region: string;
  disease: string;
  cases: number;
  trend: Trend;
  severity: Severity;
};

type QueryStatus = "pending" | "responded";
type RecentQuery = {
  id: number;
  farmer: string;
  location: string;
  query: string;
  date: string;
  status: QueryStatus;
};

const colorStyles: Record<StatColor, { bg: string; text: string }> = {
  primary: { bg: "bg-primary/10", text: "text-primary" },
  warning: { bg: "bg-warning/10", text: "text-warning" },
  success: { bg: "bg-success/10", text: "text-success" },
  accent: { bg: "bg-accent/10", text: "text-accent" },
};

const severityBadgeVariant: Record<
  Severity,
  "destructive" | "secondary" | "default"
> = {
  high: "destructive",
  medium: "secondary",
  low: "default",
};

const trendColor: Record<Trend, string> = {
  increasing: "text-destructive",
  decreasing: "text-success",
  stable: "text-muted-foreground",
};

const regionStatusVariant: Record<RegionStatus, "default" | "secondary"> = {
  good: "default",
  warning: "secondary",
};

const queryBadgeVariant: Record<QueryStatus, "secondary" | "default"> = {
  pending: "secondary",
  responded: "default",
};

const OfficerDashboard = () => {
  const stats: StatCard[] = [
    {
      label: "Registered Farmers",
      value: "1,248",
      icon: Users,
      color: "primary",
    },
    {
      label: "Disease Reports",
      value: "45",
      icon: AlertTriangle,
      color: "warning",
    },
    {
      label: "Avg Yield",
      value: "4.2 tons/acre",
      icon: TrendingUp,
      color: "success",
    },
    {
      label: "Knowledge Articles",
      value: "128",
      icon: BookOpen,
      color: "accent",
    },
  ];

  const regionalStats: RegionalStat[] = [
    {
      region: "Kurunegala",
      farmers: 425,
      diseases: 15,
      avgYield: 4.5,
      status: "good",
    },
    {
      region: "Anuradhapura",
      farmers: 380,
      diseases: 12,
      avgYield: 4.3,
      status: "good",
    },
    {
      region: "Polonnaruwa",
      farmers: 290,
      diseases: 18,
      avgYield: 3.8,
      status: "warning",
    },
    {
      region: "Ampara",
      farmers: 153,
      diseases: 8,
      avgYield: 4.0,
      status: "good",
    },
  ];

  const diseaseHotspots: DiseaseHotspot[] = [
    {
      region: "Polonnaruwa North",
      disease: "Leaf Blast",
      cases: 18,
      trend: "increasing",
      severity: "high",
    },
    {
      region: "Kurunegala West",
      disease: "Brown Spot",
      cases: 12,
      trend: "stable",
      severity: "medium",
    },
    {
      region: "Anuradhapura East",
      disease: "Bacterial Blight",
      cases: 8,
      trend: "decreasing",
      severity: "low",
    },
  ];

  const recentQueries: RecentQuery[] = [
    {
      id: 1,
      farmer: "Kamal Perera",
      location: "Kurunegala",
      query: "Treatment for brown spot disease",
      date: "2 hours ago",
      status: "pending",
    },
    {
      id: 2,
      farmer: "Nimal Silva",
      location: "Anuradhapura",
      query: "Best fertilizer for current season",
      date: "5 hours ago",
      status: "responded",
    },
    {
      id: 3,
      farmer: "Sunil Fernando",
      location: "Polonnaruwa",
      query: "Irrigation schedule guidance",
      date: "1 day ago",
      status: "responded",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="mx-auto px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display font-bold text-3xl text-foreground mb-2">
            Welcome, Agricultural Officer 🌾
          </h1>
          <p className="text-muted-foreground">
            Monitor regional farming activities and provide expert guidance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="border-border hover:shadow-medium transition-all"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-lg ${colorStyles[stat.color].bg} flex items-center justify-center`}
                  >
                    <stat.icon
                      className={`w-6 h-6 ${colorStyles[stat.color].text}`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Disease Hotspots Map */}
        <Card className="mb-8 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Disease Hotspot Monitor
            </CardTitle>
            <CardDescription>
              AI-generated disease distribution across regions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {diseaseHotspots.map((hotspot) => (
                <div
                  key={`${hotspot.region}-${hotspot.disease}`}
                  className={`p-6 rounded-lg border ${
                    hotspot.severity === "high"
                      ? "bg-destructive/10 border-destructive/20"
                      : hotspot.severity === "medium"
                        ? "bg-warning/10 border-warning/20"
                        : "bg-success/10 border-success/20"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        {hotspot.region}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {hotspot.disease}
                      </p>
                    </div>
                    <Badge variant={severityBadgeVariant[hotspot.severity]}>
                      {hotspot.severity}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Reported Cases
                      </span>
                      <span className="font-bold text-foreground">
                        {hotspot.cases}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Trend</span>
                      <span
                        className={`font-semibold capitalize ${trendColor[hotspot.trend]}`}
                      >
                        {hotspot.trend}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Regional Statistics */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Regional Statistics
              </CardTitle>
              <CardDescription>Performance metrics by district</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regionalStats.map((region) => (
                  <div
                    key={region.region}
                    className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-foreground">
                        {region.region}
                      </h4>
                      <Badge variant={regionStatusVariant[region.status]}>
                        {region.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Farmers</p>
                        <p className="font-semibold text-foreground">
                          {region.farmers}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Diseases</p>
                        <p className="font-semibold text-foreground">
                          {region.diseases}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Avg Yield</p>
                        <p className="font-semibold text-foreground">
                          {region.avgYield}t
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Generate Full Report
              </Button>
            </CardContent>
          </Card>

          {/* Recent Queries */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Farmer Queries
              </CardTitle>
              <CardDescription>Recent questions from farmers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentQueries.map((query) => (
                  <div
                    key={query.id}
                    className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">
                            {query.farmer}
                          </h4>
                          {query.status === "responded" && (
                            <CheckCircle className="w-4 h-4 text-success" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{query.location}</span>
                        </div>
                      </div>
                      <Badge variant={queryBadgeVariant[query.status]}>
                        {query.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground mb-2">
                      {query.query}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {query.date}
                    </p>
                    {query.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3"
                      >
                        Respond
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Queries
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mt-8">
          <Button variant="outline" className="h-24 flex-col gap-2">
            <BookOpen className="w-6 h-6" />
            Manage Knowledge Base
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2">
            <AlertTriangle className="w-6 h-6" />
            Disease Alerts
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2">
            <BarChart3 className="w-6 h-6" />
            Generate Reports
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2">
            <Users className="w-6 h-6" />
            Farmer Directory
          </Button>
        </div>
      </main>
    </div>
  );
};

export default OfficerDashboard;

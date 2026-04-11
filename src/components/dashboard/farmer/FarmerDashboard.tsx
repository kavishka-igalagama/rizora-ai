import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FarmerDashboardData } from "@/lib/actions/farmer/dashboard";
import {
  Microscope,
  BookOpen,
  TrendingUp,
  MessageSquare,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react";

interface FarmerDashboardProps {
  userName: string;
  dashboardData: FarmerDashboardData;
}

const formatLkr = (amount: number) =>
  `LKR ${new Intl.NumberFormat("en-LK", {
    maximumFractionDigits: 0,
  }).format(amount)}`;

const FarmerDashboard = ({ userName, dashboardData }: FarmerDashboardProps) => {
  const stats = [
    {
      label: "Total Scans",
      value: dashboardData.stats.totalScans.toString(),
      icon: Microscope,
      iconClass: "text-primary",
      iconBgClass: "bg-primary/10",
    },
    {
      label: "Healthy Crops",
      value: dashboardData.stats.healthyScans.toString(),
      icon: CheckCircle,
      iconClass: "text-success",
      iconBgClass: "bg-success/15",
    },
    {
      label: "Diseases Detected",
      value: dashboardData.stats.diseaseScans.toString(),
      icon: AlertCircle,
      iconClass: "text-warning",
      iconBgClass: "bg-warning/15",
    },
    {
      label: "This Month Revenue",
      value: formatLkr(dashboardData.stats.monthRevenue),
      icon: DollarSign,
      iconClass: "text-accent",
      iconBgClass: "bg-accent/15",
    },
  ];

  const quickActions = [
    {
      title: "Scan Rice Leaf",
      description: "Upload image for disease detection",
      icon: Microscope,
      link: "/dashboard/disease-detect",
      gradient: "from-emerald-500 to-teal-600",
      bgGlow: "bg-emerald-500/20",
    },
    {
      title: "Paddy Records",
      description: "View and manage your records",
      icon: BookOpen,
      link: "/dashboard/paddy-records",
      gradient: "from-amber-500 to-orange-600",
      bgGlow: "bg-amber-500/20",
    },
    {
      title: "Market Prices",
      description: "Check current paddy prices",
      icon: TrendingUp,
      link: "/dashboard/market-prices",
      gradient: "from-blue-500 to-indigo-600",
      bgGlow: "bg-blue-500/20",
    },
    {
      title: "Messages",
      description:
        dashboardData.stats.unreadMessages > 0
          ? `${dashboardData.stats.unreadMessages} unread messages`
          : "Chat with experts",
      icon: MessageSquare,
      link: "/dashboard/chat",
      gradient: "from-purple-500 to-pink-600",
      bgGlow: "bg-purple-500/20",
    },
  ];

  const recentScans = dashboardData.recentScans;
  const upcomingTasks = dashboardData.upcomingTasks;

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="mx-auto px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display font-bold text-3xl text-foreground mb-2">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your farm today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
          {stats.map((stat, index) => (
            <Card
              key={index}
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
                    className={`w-12 h-12 rounded-lg ${stat.iconBgClass} flex items-center justify-center`}
                  >
                    <stat.icon className={`w-6 h-6 ${stat.iconClass}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="font-display font-bold text-2xl text-foreground mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.link}>
                <Card className="group hover:shadow-glow hover:-translate-y-1 transition-all duration-300 cursor-pointer border-border overflow-hidden relative">
                  <div
                    className={`absolute inset-0 ${action.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />
                  <CardContent className="p-6 relative z-10">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div
                        className={`w-16 h-16 rounded-2xl bg-linear-to-br ${action.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                      >
                        <action.icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                        {action.title === "Messages" &&
                        dashboardData.stats.unreadMessages > 0 ? (
                          <Badge className="mt-2" variant="secondary">
                            {dashboardData.stats.unreadMessages} unread
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Scans */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Microscope className="w-5 h-5 text-primary" />
                Recent Disease Scans
              </CardTitle>
              <CardDescription>
                Your latest disease detection results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentScans.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    No scan history yet. Start with your first leaf scan.
                  </p>
                ) : (
                  recentScans.map((scan) => (
                    <div
                      key={scan.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                          {scan.status === "success" ? (
                            <CheckCircle className="w-5 h-5 text-success" />
                          ) : scan.status === "warning" ? (
                            <AlertCircle className="w-5 h-5 text-warning" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-destructive" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {scan.result}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {scan.date}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          scan.status === "success" ? "default" : "secondary"
                        }
                      >
                        {scan.confidence}%
                      </Badge>
                    </div>
                  ))
                )}
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/dashboard/disease-detect">View All Scans</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Upcoming Tasks
              </CardTitle>
              <CardDescription>Your scheduled farm activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    No upcoming tasks right now. Add planting records to track
                    your season.
                  </p>
                ) : (
                  upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shrink-0">
                          <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {task.task}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {task.date}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/dashboard/paddy-records">Manage Tasks</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Market Update */}
        <Card className="mt-8 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Market Price Update
            </CardTitle>
            <CardDescription>
              {dashboardData.marketRegion
                ? `Current paddy prices in ${dashboardData.marketRegion}`
                : "Current paddy prices in your region"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.marketSummary.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No market price updates yet. Check again after mills publish
                rates.
              </p>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {dashboardData.marketSummary.map((item) => {
                  const trendText =
                    item.change > 0
                      ? `↑ ${item.change}% from last week`
                      : item.change < 0
                        ? `↓ ${Math.abs(item.change)}% from last week`
                        : "↔ No change";

                  const toneClass =
                    item.change > 0
                      ? "bg-success/10 border-success/20 text-success"
                      : item.change < 0
                        ? "bg-warning/10 border-warning/20 text-warning"
                        : "bg-accent/10 border-accent/20 text-accent";

                  return (
                    <div
                      key={item.label}
                      className={`p-4 rounded-lg border ${toneClass}`}
                    >
                      <p className="text-lg font-bold text-foreground mb-1">
                        {item.label} - {formatLkr(item.price)}/kg
                      </p>
                      <p className="text-sm mt-1">{trendText}</p>
                    </div>
                  );
                })}
              </div>
            )}
            <Button variant="outline" className="w-full mt-6" asChild>
              <Link href="/dashboard/market-prices">
                View Detailed Market Analysis
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default FarmerDashboard;

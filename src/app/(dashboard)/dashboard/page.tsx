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
import {
  Leaf,
  Microscope,
  BookOpen,
  TrendingUp,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Upload,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";

const FarmerDashboard = () => {
  const stats = [
    {
      label: "Total Scans",
      value: "24",
      icon: Microscope,
      color: "text-primary",
    },
    {
      label: "Healthy Crops",
      value: "18",
      icon: CheckCircle,
      color: "text-success",
    },
    {
      label: "Diseases Detected",
      value: "6",
      icon: AlertCircle,
      color: "text-warning",
    },
    {
      label: "This Month Revenue",
      value: "LKR 45,000",
      icon: DollarSign,
      color: "text-accent",
    },
  ];

  const recentScans = [
    {
      id: 1,
      date: "2025-11-08",
      result: "Healthy",
      confidence: "98%",
      status: "success",
    },
    {
      id: 2,
      date: "2025-11-05",
      result: "Brown Spot",
      confidence: "94%",
      status: "warning",
    },
    {
      id: 3,
      date: "2025-11-03",
      result: "Leaf Blast",
      confidence: "92%",
      status: "destructive",
    },
  ];

  const quickActions = [
    {
      title: "Scan Rice Leaf",
      description: "Upload image for disease detection",
      icon: Microscope,
      link: "/disease-detection",
      gradient: "from-emerald-500 to-teal-600",
      bgGlow: "bg-emerald-500/20",
    },
    {
      title: "Farm Records",
      description: "View and manage your records",
      icon: BookOpen,
      link: "/farm-records",
      gradient: "from-amber-500 to-orange-600",
      bgGlow: "bg-amber-500/20",
    },
    {
      title: "Market Prices",
      description: "Check current paddy prices",
      icon: TrendingUp,
      link: "/market-prices",
      gradient: "from-blue-500 to-indigo-600",
      bgGlow: "bg-blue-500/20",
    },
    {
      title: "Messages",
      description: "Chat with experts",
      icon: MessageSquare,
      link: "/messages",
      gradient: "from-purple-500 to-pink-600",
      bgGlow: "bg-purple-500/20",
    },
  ];

  const upcomingTasks = [
    {
      id: 1,
      task: "Apply fertilizer - Field A",
      date: "Nov 12",
      priority: "high",
    },
    {
      id: 2,
      task: "Irrigation check - Field B",
      date: "Nov 14",
      priority: "medium",
    },
    { id: 3, task: "Harvest - Field C", date: "Nov 20", priority: "high" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full group-hover:bg-primary/40 transition-all duration-300" />
                <div className="relative w-11 h-11 rounded-xl bg-linear-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300 group-hover:scale-105">
                  <Leaf className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-xl text-foreground tracking-tight">
                  Rizora AI
                </span>
                <span className="text-2xs text-muted-foreground font-medium hidden sm:block">
                  Smart Rice Farming
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <UserButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display font-bold text-3xl text-foreground mb-2">
            Welcome back, Farmer! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your farm today.
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
                    className={`w-12 h-12 rounded-lg bg-${
                      stat.color.split("-")[1]
                    }/10 flex items-center justify-center`}
                  >
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
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
                {recentScans.map((scan) => (
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
                      {scan.confidence}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/scan-history">View All Scans</Link>
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
                {upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
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
                    <Badge
                      variant={
                        task.priority === "high" ? "destructive" : "secondary"
                      }
                    >
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/farm-records">Manage Tasks</Link>
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
              Current paddy prices in your region
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <p className="text-sm text-muted-foreground mb-1">White Rice</p>
                <p className="text-2xl font-bold text-foreground">LKR 85/kg</p>
                <p className="text-sm text-success mt-1">
                  ↑ 2.5% from last week
                </p>
              </div>
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-sm text-muted-foreground mb-1">Red Rice</p>
                <p className="text-2xl font-bold text-foreground">LKR 95/kg</p>
                <p className="text-sm text-accent mt-1">↔ No change</p>
              </div>
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-sm text-muted-foreground mb-1">
                  Parboiled Rice
                </p>
                <p className="text-2xl font-bold text-foreground">LKR 78/kg</p>
                <p className="text-sm text-warning mt-1">
                  ↓ 1.2% from last week
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-6" asChild>
              <Link href="/market-prices">View Detailed Market Analysis</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default FarmerDashboard;

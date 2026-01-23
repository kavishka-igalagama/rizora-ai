"use client";

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
  Users,
  TrendingUp,
  Calendar,
  Package,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

type StatColor =
  | "text-primary"
  | "text-success"
  | "text-accent"
  | "text-warning";

type Stat = {
  label: string;
  value: string;
  icon: LucideIcon;
  color: StatColor;
};

type UpcomingCollection = {
  id: number;
  farmer: string;
  location: string;
  date: string;
  quantity: string;
  status: "scheduled" | "pending";
};

type Delivery = {
  id: number;
  farmer: string;
  date: string;
  quantity: string;
  quality: string;
  status: "accepted" | "rejected";
  price: string;
};

type Severity = "high" | "medium" | "low";

type DiseaseAlert = {
  region: string;
  disease: string;
  count: number;
  severity: Severity;
};

type MillDashboardProps = {
  userName: string;
};

const statColorToBg: Record<StatColor, string> = {
  "text-primary": "bg-primary/10",
  "text-success": "bg-success/10",
  "text-accent": "bg-accent/10",
  "text-warning": "bg-warning/10",
};

const statusBadgeVariant: Record<
  UpcomingCollection["status"],
  "default" | "secondary"
> = {
  scheduled: "default",
  pending: "secondary",
};

const severityBadgeVariant: Record<
  Severity,
  "destructive" | "secondary" | "default"
> = {
  high: "destructive",
  medium: "secondary",
  low: "default",
};

const severityContainerClasses: Record<Severity, string> = {
  high: "bg-destructive/10 border-destructive/20",
  medium: "bg-warning/10 border-warning/20",
  low: "bg-success/10 border-success/20",
};

const MillDashboard = ({ userName }: MillDashboardProps) => {
  const stats: Stat[] = [
    {
      label: "Registered Farmers",
      value: "148",
      icon: Users,
      color: "text-primary",
    },
    {
      label: "Monthly Collection",
      value: "45,000 kg",
      icon: Package,
      color: "text-success",
    },
    {
      label: "Active Procurements",
      value: "12",
      icon: Clock,
      color: "text-accent",
    },
    {
      label: "This Month Revenue",
      value: "LKR 3.8M",
      icon: DollarSign,
      color: "text-warning",
    },
  ];

  const upcomingCollections: UpcomingCollection[] = [
    {
      id: 1,
      farmer: "Kamal Perera",
      location: "Kurunegala",
      date: "Nov 12",
      quantity: "2,500 kg",
      status: "scheduled",
    },
    {
      id: 2,
      farmer: "Nimal Silva",
      location: "Anuradhapura",
      date: "Nov 14",
      quantity: "3,200 kg",
      status: "scheduled",
    },
    {
      id: 3,
      farmer: "Sunil Fernando",
      location: "Polonnaruwa",
      date: "Nov 15",
      quantity: "1,800 kg",
      status: "pending",
    },
  ];

  const recentDeliveries: Delivery[] = [
    {
      id: 1,
      farmer: "Priyantha Bandara",
      date: "Nov 8, 2025",
      quantity: "4,200 kg",
      quality: "Grade A",
      status: "accepted",
      price: "LKR 357,000",
    },
    {
      id: 2,
      farmer: "Chaminda Rathnayake",
      date: "Nov 7, 2025",
      quantity: "3,800 kg",
      quality: "Grade B",
      status: "accepted",
      price: "LKR 304,000",
    },
    {
      id: 3,
      farmer: "Jayasena Wickrama",
      date: "Nov 6, 2025",
      quantity: "2,100 kg",
      quality: "Grade A",
      status: "rejected",
      price: "LKR 0",
    },
  ];

  const diseaseAlerts: DiseaseAlert[] = [
    {
      region: "Kurunegala",
      disease: "Brown Spot",
      count: 12,
      severity: "medium",
    },
    {
      region: "Anuradhapura",
      disease: "Leaf Blast",
      count: 8,
      severity: "high",
    },
    {
      region: "Polonnaruwa",
      disease: "Bacterial Blight",
      count: 5,
      severity: "low",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="mx-auto px-8 py-8 transition-all duration-300">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display font-bold text-3xl text-foreground mb-2">
            Welcome to Ceylon Rice Mill 🏭
          </h1>
          <p className="text-muted-foreground">
            Manage your procurement, quality control, and farmer relations,{" "}
            {userName}.
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
                    className={`w-12 h-12 rounded-lg ${statColorToBg[stat.color]} flex items-center justify-center`}
                  >
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upcoming Collections */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Upcoming Collections
              </CardTitle>
              <CardDescription>
                Scheduled paddy procurement from farmers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingCollections.map((collection) => (
                  <div
                    key={collection.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-foreground">
                          {collection.farmer}
                        </h4>
                        <Badge variant={statusBadgeVariant[collection.status]}>
                          {collection.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <span>{collection.location}</span>
                        <span>{collection.date}</span>
                        <span>{collection.quantity}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Schedule New Collection
              </Button>
            </CardContent>
          </Card>

          {/* Recent Deliveries */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Recent Deliveries
              </CardTitle>
              <CardDescription>
                Latest paddy deliveries and quality checks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDeliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">
                          {delivery.farmer}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {delivery.date}
                        </p>
                      </div>
                      {delivery.status === "accepted" ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Quantity</p>
                        <p className="font-semibold text-foreground">
                          {delivery.quantity}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Quality</p>
                        <p className="font-semibold text-foreground">
                          {delivery.quality}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p
                          className={`font-semibold ${delivery.status === "accepted" ? "text-success" : "text-destructive"}`}
                        >
                          {delivery.price}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Deliveries
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Disease Alerts */}
        <Card className="mt-8 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Regional Disease Alerts
            </CardTitle>
            <CardDescription>
              Disease trends from nearby farming regions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {diseaseAlerts.map((alert) => (
                <div
                  key={alert.region}
                  className={`p-4 rounded-lg border ${severityContainerClasses[alert.severity]}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-foreground">
                      {alert.region}
                    </h4>
                    <Badge variant={severityBadgeVariant[alert.severity]}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {alert.disease}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {alert.count} cases
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mt-8">
          <Button variant="outline" className="h-24 flex-col gap-2">
            <Users className="w-6 h-6" />
            Manage Farmers
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2">
            <DollarSign className="w-6 h-6" />
            Update Prices
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2">
            <TrendingUp className="w-6 h-6" />
            View Reports
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2">
            <Package className="w-6 h-6" />
            Quality Control
          </Button>
        </div>
      </main>
    </div>
  );
};

export default MillDashboard;

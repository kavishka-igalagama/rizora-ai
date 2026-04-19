"use client";

import { useEffect, useMemo, useState } from "react";
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
  ArrowRight,
  Calendar,
  Clock,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import Loading from "@/components/loading";
import { getPricings } from "@/lib/actions/mill/pricing";
import { getMillPaddyCollections } from "@/lib/actions/mill/paddy-collections";
import { getMillPurchaseRecords } from "@/lib/actions/mill/purchase-records";

type MillDashboardProps = {
  userName: string;
  millName?: string;
};

type PricingEntry = {
  id: string;
  variety: string;
  qualityGrade: string;
  pricePerKg: number;
  isActive: boolean;
  region?: string;
};

type CollectionEntry = {
  id: string;
  farmerName: string;
  variety: string;
  estimatedQuantity: number;
  actualQuantity?: number;
  totalAmount?: number;
  paidAmount?: number;
  paymentStatus: "pending" | "partial" | "paid";
  status: "pending" | "approved" | "collected" | "completed" | "cancelled";
  scheduledDate: string;
  scheduledTime: string;
};

type PurchaseEntry = {
  id: string;
  farmerName: string;
  variety: string;
  quantity: number;
  qualityGrade: "A" | "B" | "C" | "D";
  totalAmount: number;
  paymentStatus: "pending" | "partial" | "paid";
  purchaseDate: string;
};

const formatShortId = (id: string) =>
  id.length > 12 ? `${id.slice(0, 6)}...${id.slice(-4)}` : id;

const formatDisplayDate = (date: string) => {
  if (!date) return "Date not set";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }
  return parsed.toLocaleDateString("en-LK", {
    month: "short",
    day: "numeric",
  });
};

const getGradeBadgeClass = (grade: "A" | "B" | "C" | "D") => {
  const styles: Record<"A" | "B" | "C" | "D", string> = {
    A: "bg-success/10 text-success border-success/20",
    B: "bg-accent/10 text-accent border-accent/20",
    C: "bg-warning/10 text-warning border-warning/20",
    D: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return styles[grade];
};

const getCollectionStatusBadgeClass = (
  status: "pending" | "approved" | "collected" | "completed" | "cancelled",
) => {
  const styles: Record<
    "pending" | "approved" | "collected" | "completed" | "cancelled",
    string
  > = {
    pending: "bg-warning/10 text-warning border-warning/20",
    approved: "bg-primary/10 text-primary border-primary/20",
    collected: "bg-accent/10 text-accent border-accent/20",
    completed: "bg-success/10 text-success border-success/20",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return styles[status];
};

const MillDashboard = ({ userName, millName }: MillDashboardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [pricings, setPricings] = useState<PricingEntry[]>([]);
  const [collections, setCollections] = useState<CollectionEntry[]>([]);
  const [purchases, setPurchases] = useState<PurchaseEntry[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadDashboardData = async () => {
      setIsLoading(true);
      const [pricingRes, collectionsRes, purchasesRes] = await Promise.all([
        getPricings(),
        getMillPaddyCollections(),
        getMillPurchaseRecords(),
      ]);

      if (cancelled) {
        return;
      }

      if (pricingRes.success && pricingRes.pricings) {
        setPricings(
          pricingRes.pricings.map((p) => ({
            id: p._id.toString(),
            variety: p.variety,
            qualityGrade: p.qualityGrade,
            pricePerKg: p.pricePerKg,
            isActive: p.isActive,
            region: p.region,
          })),
        );
      } else if (pricingRes.error) {
        toast.error(pricingRes.error);
      }

      if (collectionsRes.success && collectionsRes.collections) {
        setCollections(collectionsRes.collections);
      } else if (collectionsRes.error) {
        toast.error(collectionsRes.error);
      }

      if (purchasesRes.success && purchasesRes.records) {
        setPurchases(purchasesRes.records);
      } else if (purchasesRes.error) {
        toast.error(purchasesRes.error);
      }

      setIsLoading(false);
    };

    loadDashboardData().catch(() => {
      if (cancelled) {
        return;
      }
      setIsLoading(false);
      toast.error("Failed to load dashboard data");
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const dashboardStats = useMemo(() => {
    const activePrices = pricings.filter((p) => p.isActive).length;
    const completedCollections = collections.filter(
      (c) => c.status === "completed",
    ).length;
    const totalCollectedWeight = collections
      .filter((c) => c.status === "completed")
      .reduce((sum, c) => sum + (c.actualQuantity || 0), 0);
    const totalPurchasedWeight = purchases.reduce(
      (sum, p) => sum + p.quantity,
      0,
    );
    const pendingPayments = purchases
      .filter((p) => p.paymentStatus !== "paid")
      .reduce((sum, p) => sum + p.totalAmount, 0);

    return {
      activePrices,
      completedCollections,
      totalCollectedWeight,
      totalPurchasedWeight,
      pendingPayments,
    };
  }, [pricings, collections, purchases]);

  const latestPurchases = useMemo(
    () =>
      [...purchases]
        .sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate))
        .slice(0, 5),
    [purchases],
  );

  const activePricingRows = useMemo(
    () => pricings.filter((p) => p.isActive).slice(0, 6),
    [pricings],
  );

  const farmerDeliveryRequests = useMemo(
    () =>
      [...collections]
        .filter((c) => c.status === "pending" || c.status === "approved")
        .sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate))
        .slice(0, 5),
    [collections],
  );

  const collectionSchedule = useMemo(
    () =>
      [...collections]
        .filter((c) => c.status !== "completed" && c.status !== "cancelled")
        .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
        .slice(0, 5),
    [collections],
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto px-8 py-8 transition-all duration-300">
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display font-bold text-3xl text-foreground mb-2">
            Welcome back, {millName} 🏭
          </h1>
          <p className="text-muted-foreground">
            Overview of your mill operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
          <Card className="border-border hover:shadow-medium transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Active Prices
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {dashboardStats.activePrices.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border hover:shadow-medium transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Completed Collections
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {dashboardStats.completedCollections.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border hover:shadow-medium transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Purchased
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {dashboardStats.totalPurchasedWeight.toLocaleString()} kg
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border hover:shadow-medium transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Pending Payments
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    Rs {dashboardStats.pendingPayments.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Active Price Listings
                </CardTitle>
                <CardDescription>
                  Current paddy prices visible to farmers
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/pricing">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {activePricingRows.length > 0 ? (
                activePricingRows.slice(0, 5).map((pricing) => (
                  <div
                    key={pricing.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {pricing.variety}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {pricing.qualityGrade} •{" "}
                        {pricing.region || "All regions"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        Rs {pricing.pricePerKg.toLocaleString()}/kg
                      </p>
                      <p className="text-xs text-success">Active now</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No active prices set
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Farmer Delivery Requests
                </CardTitle>
                <CardDescription>
                  Pending and approved collection requests
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/paddy-collections">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {farmerDeliveryRequests.length > 0 ? (
                farmerDeliveryRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-foreground">
                          {request.farmerName}
                        </p>
                        <Badge
                          variant="outline"
                          className={getCollectionStatusBadgeClass(
                            request.status,
                          )}
                        >
                          {request.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {request.variety} •{" "}
                        {request.estimatedQuantity.toLocaleString()} kg •{" "}
                        {formatDisplayDate(request.scheduledDate)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatShortId(request.id)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No pending requests
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Collection Schedule
                </CardTitle>
                <CardDescription>
                  Upcoming pickups from active booking pipeline
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/paddy-collections">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {collectionSchedule.length > 0 ? (
                  collectionSchedule.map((collection) => (
                    <div
                      key={collection.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {collection.farmerName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {collection.variety} •{" "}
                          {formatDisplayDate(collection.scheduledDate)} •{" "}
                          {collection.scheduledTime}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {collection.estimatedQuantity.toLocaleString()} kg
                        </p>
                        <Badge
                          variant="outline"
                          className={getCollectionStatusBadgeClass(
                            collection.status,
                          )}
                        >
                          {collection.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4 md:col-span-2">
                    No upcoming collections
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Purchase Records</span>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/dashboard/purchase-records">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </CardTitle>
              <CardDescription>Recent completed purchases</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {latestPurchases.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No purchases yet.
                </p>
              ) : (
                latestPurchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {purchase.farmerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {purchase.variety} •{" "}
                        {purchase.quantity.toLocaleString()} kg • Rs{" "}
                        {purchase.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={getGradeBadgeClass(purchase.qualityGrade)}
                    >
                      Grade {purchase.qualityGrade}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 border-border">
          <CardHeader>
            <CardTitle>Collected Weight from Collections</CardTitle>
            <CardDescription>
              Total completed intake tracked from collection records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm text-muted-foreground">Current total</p>
              <p className="text-xl font-bold text-foreground">
                {dashboardStats.totalCollectedWeight.toLocaleString()} kg
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MillDashboard;

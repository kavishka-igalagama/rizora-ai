"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Truck,
  Calendar,
  Weight,
  DollarSign,
  Search,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  User,
  Package,
  Download,
  Eye,
  ArrowRight,
  Droplets,
  Star,
  CreditCard,
  Banknote,
  History,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import Loading from "@/components/loading";
import {
  addPaddyCollection,
  getMillPaddyCollections,
  recordPaddyCollectionPayment,
  recordPaddyCollectionWeight,
  schedulePaddyCollection,
  updatePaddyCollectionStatus,
} from "@/lib/actions/mill/paddy-collections";

// Types
type BookingStatus =
  | "pending"
  | "approved"
  | "collected"
  | "completed"
  | "cancelled";
type PaymentStatus = "pending" | "partial" | "paid";
type PaymentMethod = "cash" | "bank";
type QualityGrade = "A" | "B" | "C" | "D";

interface CollectionBooking {
  id: string;
  farmerName: string;
  farmerPhone: string;
  location: string;
  district: string;
  variety: string;
  estimatedQuantity: number;
  actualQuantity?: number;
  moistureLevel?: number;
  qualityGrade?: QualityGrade;
  scheduledDate: string;
  scheduledTime: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  pricePerKg: number;
  totalAmount?: number;
  vehicleNumber?: string;
  driverName?: string;
  remarks?: string;
  collectedDate?: string;
  paidAmount?: number;
  createdAt: string;
}

const formatShortId = (id: string) =>
  id.length > 12 ? `${id.slice(0, 6)}...${id.slice(-4)}` : id;

const PaddyCollections = () => {
  const [collections, setCollections] = useState<CollectionBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [varietyFilter, setVarietyFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [farmerFilter, setFarmerFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isWeightDialogOpen, setIsWeightDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] =
    useState<CollectionBooking | null>(null);

  // New booking form
  const [newBooking, setNewBooking] = useState({
    farmerName: "",
    farmerPhone: "",
    location: "",
    district: "",
    variety: "",
    estimatedQuantity: "",
    scheduledDate: "",
    scheduledTime: "",
    remarks: "",
    pricePerKg: "",
  });

  // Weight record form
  const [weightForm, setWeightForm] = useState({
    actualQuantity: "",
    moistureLevel: "",
    qualityGrade: "" as string,
    remarks: "",
  });

  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "cash" as PaymentMethod,
  });

  // Schedule form
  const [scheduleForm, setScheduleForm] = useState({
    vehicleNumber: "",
    driverName: "",
    scheduledDate: "",
    scheduledTime: "",
  });

  useEffect(() => {
    let cancelled = false;

    const loadCollections = async () => {
      setLoading(true);
      const response = await getMillPaddyCollections();

      if (cancelled) {
        return;
      }

      if (response.success && response.collections) {
        setCollections(response.collections);
      } else {
        toast.error(response.error ?? "Failed to load paddy collections");
      }

      setLoading(false);
    };

    loadCollections().catch(() => {
      if (cancelled) {
        return;
      }

      setLoading(false);
      toast.error("Failed to load paddy collections");
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Stats
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCollections = collections.filter(
    (c) => c.collectedDate === todayStr || c.scheduledDate === todayStr,
  ).length;
  const totalPaddyCollected = collections
    .filter((c) => c.status === "completed")
    .reduce((s, c) => s + (c.actualQuantity || 0), 0);
  const pendingDeliveries = collections.filter(
    (c) => c.status === "pending" || c.status === "approved",
  ).length;
  const pendingPayments = collections
    .filter((c) => c.status === "completed" && c.paymentStatus !== "paid")
    .reduce((s, c) => s + ((c.totalAmount || 0) - (c.paidAmount || 0)), 0);

  // Unique values for filters
  const uniqueFarmers = [...new Set(collections.map((c) => c.farmerName))];
  const uniqueVarieties = [...new Set(collections.map((c) => c.variety))];

  // Filtering
  const filteredCollections = collections.filter((c) => {
    const matchesSearch =
      c.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.variety.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesPayment =
      paymentFilter === "all" || c.paymentStatus === paymentFilter;
    const matchesVariety =
      varietyFilter === "all" || c.variety === varietyFilter;
    const matchesMonth =
      monthFilter === "all" ||
      c.scheduledDate.startsWith(`2025-${monthFilter}`);
    const matchesFarmer =
      farmerFilter === "all" || c.farmerName === farmerFilter;
    return (
      matchesSearch &&
      matchesStatus &&
      matchesPayment &&
      matchesVariety &&
      matchesMonth &&
      matchesFarmer
    );
  });

  // Status badge
  const getStatusBadge = (status: BookingStatus) => {
    const config: Record<
      BookingStatus,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
      }
    > = {
      pending: { variant: "secondary", label: "Pending" },
      approved: { variant: "outline", label: "Approved" },
      collected: { variant: "default", label: "Collected" },
      completed: { variant: "default", label: "Completed" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };
    const c = config[status];
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    const config: Record<
      PaymentStatus,
      { variant: "default" | "secondary" | "destructive"; label: string }
    > = {
      pending: { variant: "destructive", label: "Pending" },
      partial: { variant: "secondary", label: "Partial" },
      paid: { variant: "default", label: "Paid" },
    };
    const c = config[status];
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const getGradeBadge = (grade?: QualityGrade) => {
    if (!grade) return <span className="text-muted-foreground">—</span>;
    const styles: Record<QualityGrade, string> = {
      A: "bg-success/10 text-success border-success/20",
      B: "bg-accent/10 text-accent border-accent/20",
      C: "bg-warning/10 text-warning border-warning/20",
      D: "bg-destructive/10 text-destructive border-destructive/20",
    };
    return (
      <Badge variant="outline" className={styles[grade]}>
        Grade {grade}
      </Badge>
    );
  };

  // CRUD Functions
  const handleCreateBooking = async () => {
    const response = await addPaddyCollection({
      farmerName: newBooking.farmerName,
      farmerPhone: newBooking.farmerPhone,
      location: newBooking.location,
      district: newBooking.district,
      variety: newBooking.variety,
      estimatedQuantity: Number(newBooking.estimatedQuantity),
      scheduledDate: newBooking.scheduledDate,
      scheduledTime: newBooking.scheduledTime,
      remarks: newBooking.remarks,
      pricePerKg: Number(newBooking.pricePerKg) || 85,
    });

    if (!response.success || !response.collection) {
      toast.error(response.error ?? "Failed to create booking");
      return;
    }

    setCollections((prev) => [response.collection!, ...prev]);
    setNewBooking({
      farmerName: "",
      farmerPhone: "",
      location: "",
      district: "",
      variety: "",
      estimatedQuantity: "",
      scheduledDate: "",
      scheduledTime: "",
      remarks: "",
      pricePerKg: "",
    });
    setIsAddDialogOpen(false);
    toast.success("Booking created successfully");
  };

  const handleApprove = async (id: string) => {
    const response = await updatePaddyCollectionStatus(id, "approved");

    if (!response.success || !response.collection) {
      toast.error(response.error ?? "Failed to approve booking");
      return;
    }

    setCollections((prev) =>
      prev.map((c) => (c.id === id ? response.collection! : c)),
    );
    toast.success("Booking approved");
  };

  const handleSchedulePickup = (id: string) => {
    const col = collections.find((c) => c.id === id);
    if (col) {
      setSelectedCollection(col);
      setScheduleForm({
        vehicleNumber: col.vehicleNumber || "",
        driverName: col.driverName || "",
        scheduledDate: col.scheduledDate,
        scheduledTime: col.scheduledTime,
      });
      setIsScheduleDialogOpen(true);
    }
  };

  const handleSaveSchedule = async () => {
    if (!selectedCollection) return;

    const response = await schedulePaddyCollection(selectedCollection.id, {
      vehicleNumber: scheduleForm.vehicleNumber,
      driverName: scheduleForm.driverName,
      scheduledDate: scheduleForm.scheduledDate,
      scheduledTime: scheduleForm.scheduledTime,
    });

    if (!response.success || !response.collection) {
      toast.error(response.error ?? "Failed to save schedule");
      return;
    }

    setCollections((prev) =>
      prev.map((c) =>
        c.id === selectedCollection.id ? response.collection! : c,
      ),
    );
    setIsScheduleDialogOpen(false);
    setSelectedCollection(null);
    toast.success("Pickup schedule saved");
  };

  const handleCancelBooking = async (id: string) => {
    const response = await updatePaddyCollectionStatus(id, "cancelled");

    if (!response.success || !response.collection) {
      toast.error(response.error ?? "Failed to cancel booking");
      return;
    }

    setCollections((prev) =>
      prev.map((c) => (c.id === id ? response.collection! : c)),
    );
    toast.success("Booking cancelled");
  };

  const handleOpenWeightDialog = (col: CollectionBooking) => {
    setSelectedCollection(col);
    setWeightForm({
      actualQuantity: col.actualQuantity?.toString() || "",
      moistureLevel: col.moistureLevel?.toString() || "",
      qualityGrade: col.qualityGrade || "",
      remarks: col.remarks || "",
    });
    setIsWeightDialogOpen(true);
  };

  const handleSaveWeight = async () => {
    if (!selectedCollection) return;

    const response = await recordPaddyCollectionWeight(selectedCollection.id, {
      actualQuantity: Number(weightForm.actualQuantity),
      moistureLevel: Number(weightForm.moistureLevel),
      qualityGrade: weightForm.qualityGrade as QualityGrade,
      remarks: weightForm.remarks,
      collectedDate: todayStr,
    });

    if (!response.success || !response.collection) {
      toast.error(response.error ?? "Failed to save weight record");
      return;
    }

    setCollections((prev) =>
      prev.map((c) =>
        c.id === selectedCollection.id ? response.collection! : c,
      ),
    );
    setIsWeightDialogOpen(false);
    setSelectedCollection(null);
    toast.success("Weight record saved");
  };

  const handleOpenPaymentDialog = (col: CollectionBooking) => {
    setSelectedCollection(col);
    setPaymentForm({
      amount: ((col.totalAmount || 0) - (col.paidAmount || 0)).toString(),
      method: col.paymentMethod || "cash",
    });
    setIsPaymentDialogOpen(true);
  };

  const handleSavePayment = async () => {
    if (!selectedCollection) return;

    const response = await recordPaddyCollectionPayment(selectedCollection.id, {
      amount: Number(paymentForm.amount),
      method: paymentForm.method,
    });

    if (!response.success || !response.collection) {
      toast.error(response.error ?? "Failed to record payment");
      return;
    }

    setCollections((prev) =>
      prev.map((c) =>
        c.id === selectedCollection.id ? response.collection! : c,
      ),
    );
    setIsPaymentDialogOpen(false);
    setSelectedCollection(null);
    toast.success("Payment recorded");
  };

  const handleViewDetails = (col: CollectionBooking) => {
    setSelectedCollection(col);
    setIsDetailDialogOpen(true);
  };

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Farmer",
      "Variety",
      "Estimated(kg)",
      "Actual(kg)",
      "Moisture%",
      "Grade",
      "Price/kg",
      "Total",
      "Status",
      "Payment",
      "Date",
    ];
    const rows = filteredCollections.map((c) => [
      c.id,
      c.farmerName,
      c.variety,
      c.estimatedQuantity,
      c.actualQuantity || "",
      c.moistureLevel || "",
      c.qualityGrade || "",
      c.pricePerKg,
      c.totalAmount || "",
      c.status,
      c.paymentStatus,
      c.scheduledDate,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "paddy-collections.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    {
      label: "Collections Today",
      value: todayCollections.toString(),
      icon: Truck,
      description: "Scheduled & collected",
    },
    {
      label: "Total Paddy Collected",
      value: `${totalPaddyCollected.toLocaleString()} kg`,
      icon: Package,
      description: "All time weight",
    },
    {
      label: "Pending Deliveries",
      value: pendingDeliveries.toString(),
      icon: Clock,
      description: "Awaiting collection",
    },
    {
      label: "Payments Pending",
      value: `Rs ${pendingPayments.toLocaleString()}`,
      icon: AlertCircle,
      description: "Outstanding amount",
    },
  ];

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <main className="flex-1 p-8 transition-all duration-300">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-3xl text-foreground mb-1">
                Paddy Collections
              </h1>
              <p className="text-muted-foreground">
                Manage farmer deliveries, weight records & payments
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" /> New Booking
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>New Delivery Booking</DialogTitle>
                    <DialogDescription>
                      Schedule a new paddy collection from a farmer
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Farmer Name</Label>
                        <Input
                          placeholder="Enter farmer name"
                          value={newBooking.farmerName}
                          onChange={(e) =>
                            setNewBooking((p) => ({
                              ...p,
                              farmerName: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          placeholder="07X-XXXXXXX"
                          value={newBooking.farmerPhone}
                          onChange={(e) =>
                            setNewBooking((p) => ({
                              ...p,
                              farmerPhone: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>District</Label>
                        <Select
                          value={newBooking.district}
                          onValueChange={(v) =>
                            setNewBooking((p) => ({ ...p, district: v }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select district" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              "Kurunegala",
                              "Anuradhapura",
                              "Polonnaruwa",
                              "Matale",
                              "Hambantota",
                              "Badulla",
                            ].map((d) => (
                              <SelectItem key={d} value={d}>
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                          placeholder="Enter location"
                          value={newBooking.location}
                          onChange={(e) =>
                            setNewBooking((p) => ({
                              ...p,
                              location: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Paddy Variety</Label>
                        <Select
                          value={newBooking.variety}
                          onValueChange={(v) =>
                            setNewBooking((p) => ({ ...p, variety: v }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select variety" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              "BG 352",
                              "BG 300",
                              "Samba",
                              "Keeri Samba",
                              "Red Nadu",
                              "Nadu",
                            ].map((v) => (
                              <SelectItem key={v} value={v}>
                                {v}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Estimated Quantity (kg)</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={newBooking.estimatedQuantity}
                          onChange={(e) =>
                            setNewBooking((p) => ({
                              ...p,
                              estimatedQuantity: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Price per kg (Rs)</Label>
                        <Input
                          type="number"
                          placeholder="85"
                          value={newBooking.pricePerKg}
                          onChange={(e) =>
                            setNewBooking((p) => ({
                              ...p,
                              pricePerKg: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Scheduled Date</Label>
                        <Input
                          type="date"
                          value={newBooking.scheduledDate}
                          onChange={(e) =>
                            setNewBooking((p) => ({
                              ...p,
                              scheduledDate: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Scheduled Time</Label>
                        <Input
                          type="time"
                          value={newBooking.scheduledTime}
                          onChange={(e) =>
                            setNewBooking((p) => ({
                              ...p,
                              scheduledTime: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Remarks</Label>
                      <Textarea
                        placeholder="Additional notes (optional)"
                        value={newBooking.remarks}
                        onChange={(e) =>
                          setNewBooking((p) => ({
                            ...p,
                            remarks: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateBooking}
                      disabled={
                        !newBooking.farmerName ||
                        !newBooking.variety ||
                        !newBooking.estimatedQuantity
                      }
                    >
                      Create Booking
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <Card
              key={i}
              className="border-border hover:shadow-md transition-all"
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
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid h-full grid-cols-6 w-full max-w-3xl">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="weights">Weight</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search farmer, ID, variety..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-35">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="collected">Collected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={varietyFilter} onValueChange={setVarietyFilter}>
              <SelectTrigger className="w-35">
                <SelectValue placeholder="Variety" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Varieties</SelectItem>
                {uniqueVarieties.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-35">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 1. Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Bookings</CardTitle>
                <CardDescription>
                  All farmer delivery requests and their current status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Farmer</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Variety</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCollections.map((col) => (
                      <TableRow key={col.id}>
                        <TableCell className="font-medium text-muted-foreground">
                          {formatShortId(col.id)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">
                              {col.farmerName}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {col.farmerPhone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            {col.location}, {col.district}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{col.variety}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {col.estimatedQuantity.toLocaleString()} kg
                            </p>
                            {col.actualQuantity && (
                              <p className="text-xs text-muted-foreground">
                                Actual: {col.actualQuantity.toLocaleString()} kg
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{col.scheduledDate}</p>
                            <p className="text-xs text-muted-foreground">
                              {col.scheduledTime}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(col.status)}</TableCell>
                        <TableCell>
                          {getPaymentBadge(col.paymentStatus)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(col)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {col.status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleApprove(col.id)}
                                  title="Approve"
                                >
                                  <CheckCircle className="w-4 h-4 text-primary" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleCancelBooking(col.id)}
                                  title="Cancel"
                                >
                                  <XCircle className="w-4 h-4 text-destructive" />
                                </Button>
                              </>
                            )}
                            {col.status === "approved" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleSchedulePickup(col.id)}
                                title="Schedule Pickup"
                              >
                                <Truck className="w-4 h-4" />
                              </Button>
                            )}
                            {(col.status === "approved" ||
                              col.status === "collected") && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenWeightDialog(col)}
                                title="Record Weight"
                              >
                                <Weight className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredCollections.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No collections found</p>
                    <p className="text-sm">
                      Try adjusting your search or filters
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 2. Pickup Schedule Tab */}
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" /> Pickup
                      Schedule
                    </CardTitle>
                    <CardDescription>
                      Manage delivery dates, vehicles & driver assignments
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-secondary inline-block" />{" "}
                      Pending
                    </span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary inline-block" />{" "}
                      Approved
                    </span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-accent inline-block" />{" "}
                      Collected
                    </span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary inline-block" />{" "}
                      Completed
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  {collections
                    .filter(
                      (c) =>
                        c.status !== "completed" && c.status !== "cancelled",
                    )
                    .sort((a, b) =>
                      a.scheduledDate.localeCompare(b.scheduledDate),
                    )
                    .map((col) => (
                      <div
                        key={col.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-lg bg-muted flex flex-col items-center justify-center">
                            <span className="text-xs text-muted-foreground">
                              {new Date(col.scheduledDate).toLocaleDateString(
                                "en",
                                { month: "short" },
                              )}
                            </span>
                            <span className="text-lg font-bold text-foreground">
                              {new Date(col.scheduledDate).getDate()}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-foreground">
                                {col.farmerName}
                              </h4>
                              {getStatusBadge(col.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {col.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {col.scheduledTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <Package className="w-3 h-3" />
                                {col.estimatedQuantity.toLocaleString()} kg{" "}
                                {col.variety}
                              </span>
                            </div>
                            {col.vehicleNumber && (
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <Truck className="w-3 h-3" />
                                  {col.vehicleNumber}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {col.driverName}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {col.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => handleApprove(col.id)}
                            >
                              Approve
                            </Button>
                          )}
                          {col.status === "approved" && !col.vehicleNumber && (
                            <Button
                              size="sm"
                              onClick={() => handleSchedulePickup(col.id)}
                            >
                              Schedule Pickup
                            </Button>
                          )}
                          {col.status === "approved" && col.vehicleNumber && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSchedulePickup(col.id)}
                            >
                              Reschedule
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelBooking(col.id)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ))}
                  {collections.filter(
                    (c) => c.status !== "completed" && c.status !== "cancelled",
                  ).length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No pending pickups</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 3. Weight Records Tab */}
          <TabsContent value="weights">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Weight className="w-5 h-5 text-primary" /> Weight & Quality
                  Records
                </CardTitle>
                <CardDescription>
                  Record actual weight, moisture level, and quality grade at
                  collection
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Awaiting weight recording */}
                {collections.filter(
                  (c) =>
                    (c.status === "approved" || c.status === "collected") &&
                    !c.actualQuantity,
                ).length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-foreground mb-3">
                      Awaiting Weight Recording
                    </h3>
                    <div className="space-y-2">
                      {collections
                        .filter(
                          (c) =>
                            (c.status === "approved" ||
                              c.status === "collected") &&
                            !c.actualQuantity,
                        )
                        .map((col) => (
                          <div
                            key={col.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-dashed border-border bg-muted/30"
                          >
                            <div className="flex items-center gap-3">
                              <Weight className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium text-foreground">
                                  {col.farmerName} — {col.variety}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Estimated:{" "}
                                  {col.estimatedQuantity.toLocaleString()} kg
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleOpenWeightDialog(col)}
                            >
                              Record Weight
                            </Button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Recorded weights table */}
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Completed Records
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Farmer</TableHead>
                      <TableHead>Variety</TableHead>
                      <TableHead>Estimated</TableHead>
                      <TableHead>Actual</TableHead>
                      <TableHead>Difference</TableHead>
                      <TableHead>Moisture</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Price/kg</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {collections
                      .filter((c) => c.actualQuantity)
                      .map((col) => {
                        const diff =
                          (col.actualQuantity || 0) - col.estimatedQuantity;
                        return (
                          <TableRow key={col.id}>
                            <TableCell className="font-medium text-muted-foreground">
                              {formatShortId(col.id)}
                            </TableCell>
                            <TableCell className="font-medium">
                              {col.farmerName}
                            </TableCell>
                            <TableCell>{col.variety}</TableCell>
                            <TableCell>
                              {col.estimatedQuantity.toLocaleString()} kg
                            </TableCell>
                            <TableCell className="font-semibold">
                              {col.actualQuantity?.toLocaleString()} kg
                            </TableCell>
                            <TableCell>
                              <span
                                className={
                                  diff >= 0
                                    ? "text-primary"
                                    : "text-destructive"
                                }
                              >
                                {diff >= 0 ? "+" : ""}
                                {diff.toLocaleString()} kg
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="flex items-center gap-1">
                                <Droplets className="w-3 h-3 text-muted-foreground" />
                                {col.moistureLevel}%
                              </span>
                            </TableCell>
                            <TableCell>
                              {getGradeBadge(col.qualityGrade)}
                            </TableCell>
                            <TableCell>Rs {col.pricePerKg}</TableCell>
                            <TableCell className="font-semibold">
                              Rs {col.totalAmount?.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    {collections.filter((c) => c.actualQuantity).length} records
                  </p>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Total Collected Weight
                    </p>
                    <p className="text-xl font-bold text-foreground">
                      {totalPaddyCollected.toLocaleString()} kg
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 4. Payment Management Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" /> Payment
                  Management
                </CardTitle>
                <CardDescription>
                  Calculate, record, and track farmer payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Payment summary cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-muted-foreground">Unpaid</p>
                    <p className="text-xl font-bold text-foreground">
                      Rs{" "}
                      {collections
                        .filter(
                          (c) => c.paymentStatus === "pending" && c.totalAmount,
                        )
                        .reduce((s, c) => s + (c.totalAmount || 0), 0)
                        .toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {
                        collections.filter(
                          (c) => c.paymentStatus === "pending" && c.totalAmount,
                        ).length
                      }{" "}
                      collections
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary border border-border">
                    <p className="text-sm text-muted-foreground">
                      Partially Paid
                    </p>
                    <p className="text-xl font-bold text-foreground">
                      Rs{" "}
                      {collections
                        .filter((c) => c.paymentStatus === "partial")
                        .reduce(
                          (s, c) =>
                            s + ((c.totalAmount || 0) - (c.paidAmount || 0)),
                          0,
                        )
                        .toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {
                        collections.filter((c) => c.paymentStatus === "partial")
                          .length
                      }{" "}
                      collections
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm text-muted-foreground">Fully Paid</p>
                    <p className="text-xl font-bold text-foreground">
                      Rs{" "}
                      {collections
                        .filter((c) => c.paymentStatus === "paid")
                        .reduce((s, c) => s + (c.totalAmount || 0), 0)
                        .toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {
                        collections.filter((c) => c.paymentStatus === "paid")
                          .length
                      }{" "}
                      collections
                    </p>
                  </div>
                </div>

                {/* Payment list */}
                <div className="space-y-3">
                  {collections
                    .filter((c) => c.totalAmount)
                    .map((col) => (
                      <div
                        key={col.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            {col.paymentStatus === "paid" ? (
                              <CheckCircle className="w-5 h-5 text-primary" />
                            ) : col.paymentStatus === "partial" ? (
                              <Clock className="w-5 h-5 text-accent-foreground" />
                            ) : (
                              <XCircle className="w-5 h-5 text-destructive" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-foreground">
                                {col.farmerName}
                              </h4>
                              <span className="text-sm text-muted-foreground">
                                {formatShortId(col.id)}
                              </span>
                              {getPaymentBadge(col.paymentStatus)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>
                                {col.actualQuantity?.toLocaleString()} kg × Rs{" "}
                                {col.pricePerKg}/kg
                              </span>
                              <span>
                                {col.paymentMethod && (
                                  <span className="flex items-center gap-1">
                                    {col.paymentMethod === "cash" ? (
                                      <Banknote className="w-3 h-3" />
                                    ) : (
                                      <CreditCard className="w-3 h-3" />
                                    )}
                                    {col.paymentMethod === "cash"
                                      ? "Cash"
                                      : "Bank Transfer"}
                                  </span>
                                )}
                              </span>
                            </div>
                            {col.remarks && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {col.remarks}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-foreground">
                              Rs {col.totalAmount?.toLocaleString()}
                            </p>
                            {col.paidAmount !== undefined &&
                              col.paidAmount < (col.totalAmount || 0) && (
                                <p className="text-xs text-muted-foreground">
                                  Paid: Rs {col.paidAmount.toLocaleString()}
                                </p>
                              )}
                          </div>
                          {col.paymentStatus !== "paid" && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenPaymentDialog(col)}
                            >
                              <DollarSign className="w-4 h-4 mr-1" /> Pay
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 5. Collection History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <History className="w-5 h-5 text-primary" /> Collection
                      History
                    </CardTitle>
                    <CardDescription>
                      View past collections with filters
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={handleExportCSV}>
                    <Download className="w-4 h-4 mr-2" /> Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 mb-4">
                  <Select value={monthFilter} onValueChange={setMonthFilter}>
                    <SelectTrigger className="w-35">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Months</SelectItem>
                      <SelectItem value="11">November</SelectItem>
                      <SelectItem value="10">October</SelectItem>
                      <SelectItem value="09">September</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={farmerFilter} onValueChange={setFarmerFilter}>
                    <SelectTrigger className="w-45">
                      <SelectValue placeholder="Farmer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Farmers</SelectItem>
                      {uniqueFarmers.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Farmer</TableHead>
                      <TableHead>Variety</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCollections
                      .sort((a, b) =>
                        b.scheduledDate.localeCompare(a.scheduledDate),
                      )
                      .map((col) => (
                        <TableRow key={col.id}>
                          <TableCell className="font-medium text-muted-foreground">
                            {formatShortId(col.id)}
                          </TableCell>
                          <TableCell>{col.scheduledDate}</TableCell>
                          <TableCell className="font-medium">
                            {col.farmerName}
                          </TableCell>
                          <TableCell>{col.variety}</TableCell>
                          <TableCell>
                            {col.actualQuantity
                              ? `${col.actualQuantity.toLocaleString()} kg`
                              : `${col.estimatedQuantity.toLocaleString()} kg (est)`}
                          </TableCell>
                          <TableCell>
                            {getGradeBadge(col.qualityGrade)}
                          </TableCell>
                          <TableCell>
                            {col.totalAmount
                              ? `Rs ${col.totalAmount.toLocaleString()}`
                              : "—"}
                          </TableCell>
                          <TableCell>{getStatusBadge(col.status)}</TableCell>
                          <TableCell>
                            {getPaymentBadge(col.paymentStatus)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(col)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 6. Quick Stats Tab */}
          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Collection Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: "Total Bookings", value: collections.length },
                      {
                        label: "Pending",
                        value: collections.filter((c) => c.status === "pending")
                          .length,
                      },
                      {
                        label: "Approved",
                        value: collections.filter(
                          (c) => c.status === "approved",
                        ).length,
                      },
                      {
                        label: "Collected",
                        value: collections.filter(
                          (c) => c.status === "collected",
                        ).length,
                      },
                      {
                        label: "Completed",
                        value: collections.filter(
                          (c) => c.status === "completed",
                        ).length,
                      },
                      {
                        label: "Cancelled",
                        value: collections.filter(
                          (c) => c.status === "cancelled",
                        ).length,
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <span className="text-sm text-muted-foreground">
                          {item.label}
                        </span>
                        <span className="font-bold text-foreground">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        label: "Total Revenue",
                        value: `Rs ${collections.reduce((s, c) => s + (c.totalAmount || 0), 0).toLocaleString()}`,
                      },
                      {
                        label: "Total Paid",
                        value: `Rs ${collections.reduce((s, c) => s + (c.paidAmount || 0), 0).toLocaleString()}`,
                      },
                      {
                        label: "Outstanding",
                        value: `Rs ${collections.reduce((s, c) => s + ((c.totalAmount || 0) - (c.paidAmount || 0)), 0).toLocaleString()}`,
                      },
                      {
                        label: "Avg Price/kg",
                        value: `Rs ${(collections.reduce((s, c) => s + c.pricePerKg, 0) / collections.length).toFixed(0)}`,
                      },
                      {
                        label: "Total Weight Collected",
                        value: `${totalPaddyCollected.toLocaleString()} kg`,
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <span className="text-sm text-muted-foreground">
                          {item.label}
                        </span>
                        <span className="font-bold text-foreground">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Variety Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {uniqueVarieties.map((variety) => {
                      const count = collections.filter(
                        (c) => c.variety === variety,
                      ).length;
                      const weight = collections
                        .filter((c) => c.variety === variety)
                        .reduce(
                          (s, c) =>
                            s + (c.actualQuantity || c.estimatedQuantity),
                          0,
                        );
                      return (
                        <div
                          key={variety}
                          className="flex items-center justify-between py-2 border-b border-border last:border-0"
                        >
                          <div>
                            <p className="font-medium text-foreground">
                              {variety}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {count} collections
                            </p>
                          </div>
                          <span className="font-bold text-foreground">
                            {weight.toLocaleString()} kg
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Top Farmers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {uniqueFarmers
                      .map((f) => ({
                        name: f,
                        total: collections
                          .filter((c) => c.farmerName === f)
                          .reduce(
                            (s, c) =>
                              s + (c.actualQuantity || c.estimatedQuantity),
                            0,
                          ),
                        count: collections.filter((c) => c.farmerName === f)
                          .length,
                      }))
                      .sort((a, b) => b.total - a.total)
                      .slice(0, 5)
                      .map((farmer, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between py-2 border-b border-border last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-bold text-primary">
                                {i + 1}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {farmer.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {farmer.count} deliveries
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-foreground">
                            {farmer.total.toLocaleString()} kg
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Weight Recording Dialog */}
        <Dialog open={isWeightDialogOpen} onOpenChange={setIsWeightDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record Weight & Quality</DialogTitle>
              <DialogDescription>
                {selectedCollection &&
                  `${selectedCollection.farmerName} — ${selectedCollection.variety} (Est: ${selectedCollection.estimatedQuantity.toLocaleString()} kg)`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Weight className="w-4 h-4" /> Actual Weight (kg)
                </Label>
                <Input
                  type="number"
                  placeholder="Enter actual weight"
                  value={weightForm.actualQuantity}
                  onChange={(e) =>
                    setWeightForm((p) => ({
                      ...p,
                      actualQuantity: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Droplets className="w-4 h-4" /> Moisture Level (%)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="14.0"
                    value={weightForm.moistureLevel}
                    onChange={(e) =>
                      setWeightForm((p) => ({
                        ...p,
                        moistureLevel: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Star className="w-4 h-4" /> Quality Grade
                  </Label>
                  <Select
                    value={weightForm.qualityGrade}
                    onValueChange={(v) =>
                      setWeightForm((p) => ({ ...p, qualityGrade: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Grade A — Premium</SelectItem>
                      <SelectItem value="B">Grade B — Good</SelectItem>
                      <SelectItem value="C">Grade C — Average</SelectItem>
                      <SelectItem value="D">Grade D — Below Avg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {weightForm.actualQuantity && selectedCollection && (
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">
                    Calculated Total
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    Rs{" "}
                    {(
                      Number(weightForm.actualQuantity) *
                      selectedCollection.pricePerKg
                    ).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {weightForm.actualQuantity} kg × Rs{" "}
                    {selectedCollection.pricePerKg}/kg
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label>Remarks</Label>
                <Textarea
                  placeholder="Quality notes, observations..."
                  value={weightForm.remarks}
                  onChange={(e) =>
                    setWeightForm((p) => ({ ...p, remarks: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsWeightDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveWeight}
                disabled={!weightForm.actualQuantity}
              >
                Save Record
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog
          open={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>
                {selectedCollection &&
                  `${selectedCollection.farmerName} — Total: Rs ${selectedCollection.totalAmount?.toLocaleString()}`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {selectedCollection && (
                <div className="p-3 rounded-lg bg-muted space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="font-medium">
                      Rs {selectedCollection.totalAmount?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Already Paid</span>
                    <span className="font-medium">
                      Rs {(selectedCollection.paidAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t border-border pt-1">
                    <span>Balance</span>
                    <span>
                      Rs{" "}
                      {(
                        (selectedCollection.totalAmount || 0) -
                        (selectedCollection.paidAmount || 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label>Payment Amount (Rs)</Label>
                <Input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm((p) => ({ ...p, amount: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select
                  value={paymentForm.method}
                  onValueChange={(v) =>
                    setPaymentForm((p) => ({
                      ...p,
                      method: v as PaymentMethod,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">
                      <span className="flex items-center gap-2">
                        <Banknote className="w-4 h-4" /> Cash
                      </span>
                    </SelectItem>
                    <SelectItem value="bank">
                      <span className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" /> Bank Transfer
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsPaymentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSavePayment}
                disabled={!paymentForm.amount}
              >
                Record Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Schedule Pickup Dialog */}
        <Dialog
          open={isScheduleDialogOpen}
          onOpenChange={setIsScheduleDialogOpen}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Pickup</DialogTitle>
              <DialogDescription>
                {selectedCollection &&
                  `Assign vehicle & driver for ${selectedCollection.farmerName}'s delivery`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Vehicle Number</Label>
                <Input
                  placeholder="e.g. WP KA-1234"
                  value={scheduleForm.vehicleNumber}
                  onChange={(e) =>
                    setScheduleForm((p) => ({
                      ...p,
                      vehicleNumber: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Driver Name</Label>
                <Input
                  placeholder="Enter driver name"
                  value={scheduleForm.driverName}
                  onChange={(e) =>
                    setScheduleForm((p) => ({
                      ...p,
                      driverName: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Delivery Date</Label>
                  <Input
                    type="date"
                    value={scheduleForm.scheduledDate}
                    onChange={(e) =>
                      setScheduleForm((p) => ({
                        ...p,
                        scheduledDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={scheduleForm.scheduledTime}
                    onChange={(e) =>
                      setScheduleForm((p) => ({
                        ...p,
                        scheduledTime: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsScheduleDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveSchedule}
                disabled={
                  !scheduleForm.vehicleNumber || !scheduleForm.driverName
                }
              >
                Save Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Booking Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Collection Details —
                {selectedCollection
                  ? ` ${formatShortId(selectedCollection.id)}`
                  : ""}
              </DialogTitle>
            </DialogHeader>
            {selectedCollection && (
              <div className="grid gap-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Farmer</p>
                      <p className="font-medium text-foreground">
                        {selectedCollection.farmerName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-foreground">
                        {selectedCollection.farmerPhone}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-foreground">
                        {selectedCollection.location},{" "}
                        {selectedCollection.district}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Paddy Variety
                      </p>
                      <p className="text-foreground">
                        {selectedCollection.variety}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <div className="mt-1">
                        {getStatusBadge(selectedCollection.status)}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Payment</p>
                      <div className="mt-1">
                        {getPaymentBadge(selectedCollection.paymentStatus)}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Scheduled Date
                      </p>
                      <p className="text-foreground">
                        {selectedCollection.scheduledDate} at{" "}
                        {selectedCollection.scheduledTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="text-foreground">
                        {selectedCollection.createdAt}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-border pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Estimated Weight
                      </p>
                      <p className="font-medium text-foreground">
                        {selectedCollection.estimatedQuantity.toLocaleString()}{" "}
                        kg
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Actual Weight
                      </p>
                      <p className="font-medium text-foreground">
                        {selectedCollection.actualQuantity
                          ? `${selectedCollection.actualQuantity.toLocaleString()} kg`
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Moisture Level
                      </p>
                      <p className="text-foreground">
                        {selectedCollection.moistureLevel
                          ? `${selectedCollection.moistureLevel}%`
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Quality Grade
                      </p>
                      <div className="mt-1">
                        {getGradeBadge(selectedCollection.qualityGrade)}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Price per kg
                      </p>
                      <p className="text-foreground">
                        Rs {selectedCollection.pricePerKg}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Total Amount
                      </p>
                      <p className="font-bold text-foreground">
                        {selectedCollection.totalAmount
                          ? `Rs ${selectedCollection.totalAmount.toLocaleString()}`
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
                {(selectedCollection.vehicleNumber ||
                  selectedCollection.driverName) && (
                  <div className="border-t border-border pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Vehicle</p>
                        <p className="text-foreground">
                          {selectedCollection.vehicleNumber || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Driver</p>
                        <p className="text-foreground">
                          {selectedCollection.driverName || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {selectedCollection.remarks && (
                  <div className="border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground">Remarks</p>
                    <p className="text-foreground text-sm">
                      {selectedCollection.remarks}
                    </p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDetailDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default PaddyCollections;

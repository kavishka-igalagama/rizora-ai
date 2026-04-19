"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Package,
  Search,
  Download,
  Eye,
  DollarSign,
  Users,
  FileText,
  CheckCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import Loading from "@/components/loading";
import {
  getMillPurchaseRecords,
  markPurchaseAsPaid,
} from "@/lib/actions/mill/purchase-records";

type PaymentStatus = "paid" | "pending" | "partial";
type QualityGrade = "A" | "B" | "C" | "D";

interface PurchaseRecord {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  variety: string;
  quantity: number;
  qualityGrade: QualityGrade;
  moistureLevel: number;
  pricePerKg: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  purchaseDate: string;
  notes?: string;
}

const formatShortId = (id: string) =>
  id.length > 12 ? `${id.slice(0, 6)}...${id.slice(-4)}` : id;

const MillPurchases = () => {
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedPurchase, setSelectedPurchase] =
    useState<PurchaseRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadPurchases = async () => {
      setLoading(true);
      const response = await getMillPurchaseRecords();

      if (cancelled) {
        return;
      }

      if (response.success && response.records) {
        setPurchases(response.records);
      } else {
        toast.error(response.error ?? "Failed to load purchase records");
      }

      setLoading(false);
    };

    loadPurchases().catch(() => {
      if (cancelled) {
        return;
      }

      setLoading(false);
      toast.error("Failed to load purchase records");
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPurchases = purchases.filter((p) => {
    const matchesSearch =
      p.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.variety.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade =
      gradeFilter === "all" || p.qualityGrade === gradeFilter;
    const matchesPayment =
      paymentFilter === "all" || p.paymentStatus === paymentFilter;
    return matchesSearch && matchesGrade && matchesPayment;
  });

  const totalPurchased = purchases.reduce((s, p) => s + p.quantity, 0);
  const totalSpent = purchases.reduce((s, p) => s + p.totalAmount, 0);
  const pendingPayments = purchases
    .filter((p) => p.paymentStatus !== "paid")
    .reduce((s, p) => s + p.totalAmount, 0);
  const uniqueFarmers = new Set(purchases.map((p) => p.farmerId)).size;

  const getPaymentBadge = (status: PaymentStatus) => {
    const styles: Record<PaymentStatus, string> = {
      paid: "bg-success/10 text-success border-success/20",
      pending: "bg-warning/10 text-warning border-warning/20",
      partial: "bg-accent/10 text-accent border-accent/20",
    };
    return (
      <Badge variant="outline" className={styles[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getGradeBadge = (grade: QualityGrade) => {
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

  const handleMarkPaid = async (id: string) => {
    const response = await markPurchaseAsPaid(id);

    if (!response.success) {
      toast.error(response.error ?? "Failed to update payment status");
      return;
    }

    setPurchases((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, paymentStatus: "paid" as PaymentStatus } : p,
      ),
    );
    toast.success("Payment marked as paid");
  };

  if (loading) {
    return <Loading />;
  }

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Farmer",
      "Variety",
      "Quantity (kg)",
      "Grade",
      "Price/kg",
      "Total (Rs)",
      "Payment Status",
      "Date",
    ];
    const rows = filteredPurchases.map((p) => [
      p.id,
      p.farmerName,
      p.variety,
      p.quantity,
      p.qualityGrade,
      p.pricePerKg,
      p.totalAmount,
      p.paymentStatus,
      p.purchaseDate,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "purchase_records.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully");
  };

  return (
    <div className="min-h-screen bg-background flex">
      <main className="flex-1 p-8 transition-all duration-300">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-3xl text-foreground mb-2">
                Purchase Records
              </h1>
              <p className="text-muted-foreground">
                Track all paddy purchases from farmers
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
          {[
            {
              label: "Total Purchased",
              value: `${totalPurchased.toLocaleString()} kg`,
              icon: Package,
              color: "text-primary",
            },
            {
              label: "Total Spent",
              value: `Rs ${totalSpent.toLocaleString()}`,
              icon: DollarSign,
              color: "text-success",
            },
            {
              label: "Pending Payments",
              value: `Rs ${pendingPayments.toLocaleString()}`,
              icon: Clock,
              color: "text-warning",
            },
            {
              label: "Unique Farmers",
              value: uniqueFarmers.toString(),
              icon: Users,
              color: "text-accent",
            },
          ].map((stat, i) => (
            <Card
              key={i}
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
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="border-border mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-50">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by farmer, ID, or variety..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger className="w-37.5">
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  <SelectItem value="A">Grade A</SelectItem>
                  <SelectItem value="B">Grade B</SelectItem>
                  <SelectItem value="C">Grade C</SelectItem>
                  <SelectItem value="D">Grade D</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Purchase Records ({filteredPurchases.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Variety</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Price/kg</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases.map((p) => (
                    <TableRow key={p.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">
                        {formatShortId(p.id)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">
                            {p.farmerName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {p.farmerPhone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{p.variety}</TableCell>
                      <TableCell className="font-semibold">
                        {p.quantity.toLocaleString()} kg
                      </TableCell>
                      <TableCell>{getGradeBadge(p.qualityGrade)}</TableCell>
                      <TableCell>Rs {p.pricePerKg}</TableCell>
                      <TableCell className="font-semibold">
                        Rs {p.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>{getPaymentBadge(p.paymentStatus)}</TableCell>
                      <TableCell className="text-sm">
                        {p.purchaseDate}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPurchase(p);
                              setDetailOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {p.paymentStatus !== "paid" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-success"
                              onClick={() => handleMarkPaid(p.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Purchase Detail —
                {selectedPurchase
                  ? ` ${formatShortId(selectedPurchase.id)}`
                  : ""}
              </DialogTitle>
              <DialogDescription>
                Full record for this purchase
              </DialogDescription>
            </DialogHeader>
            {selectedPurchase && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ["Farmer", selectedPurchase.farmerName],
                    ["Phone", selectedPurchase.farmerPhone],
                    ["Variety", selectedPurchase.variety],
                    [
                      "Quantity",
                      `${selectedPurchase.quantity.toLocaleString()} kg`,
                    ],
                    ["Quality Grade", `Grade ${selectedPurchase.qualityGrade}`],
                    ["Moisture", `${selectedPurchase.moistureLevel}%`],
                    ["Price/kg", `Rs ${selectedPurchase.pricePerKg}`],
                    [
                      "Total Amount",
                      `Rs ${selectedPurchase.totalAmount.toLocaleString()}`,
                    ],
                    ["Payment Method", selectedPurchase.paymentMethod],
                    ["Payment Status", selectedPurchase.paymentStatus],
                    ["Date", selectedPurchase.purchaseDate],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="font-medium text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
                {selectedPurchase.notes && (
                  <div>
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <p className="text-sm text-foreground">
                      {selectedPurchase.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default MillPurchases;

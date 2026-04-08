"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  addNewPricing,
  getPricings,
  updatePricing,
  deletePricing,
  fetchCurrentUserDistrict,
} from "@/lib/actions/mill/pricing";
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  EyeOff,
  Clock,
  CheckCircle,
  Star,
  Wheat,
  BarChart3,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Loading from "@/components/loading";

// ─── Local types ───────────────────────────────────────────────
type QualityGrade = "A" | "B" | "C" | "D";
type PaddyVariety =
  | "Samba"
  | "Nadu"
  | "Red Raw"
  | "White Raw"
  | "Basmathi"
  | "Keeri Samba";

interface PriceEntry {
  id: string;
  variety: PaddyVariety;
  grade: QualityGrade;
  pricePerKg: number;
  previousPrice: number;
  isActive: boolean;
  lastUpdated: string;
  notes?: string;
  region?: string;
}

interface GradeDefinition {
  grade: QualityGrade;
  label: string;
  moistureMax: number;
  brokenMax: number;
  foreignMatterMax: number;
  description: string;
}

interface PriceFormFieldsProps {
  formVariety: PaddyVariety;
  formGrade: QualityGrade;
  formPrice: string;
  formNotes: string;
  onVarietyChange: (value: PaddyVariety) => void;
  onGradeChange: (value: QualityGrade) => void;
  onPriceChange: (value: string) => void;
  onNotesChange: (value: string) => void;
}

// ─── Pricing constants ─────────────────────────────────────────
const gradeDefinitions: GradeDefinition[] = [
  {
    grade: "A",
    label: "Premium",
    moistureMax: 12,
    brokenMax: 5,
    foreignMatterMax: 0.5,
    description: "Highest quality, minimal moisture and broken grains",
  },
  {
    grade: "B",
    label: "Standard",
    moistureMax: 14,
    brokenMax: 10,
    foreignMatterMax: 1.0,
    description: "Good quality, acceptable moisture levels",
  },
  {
    grade: "C",
    label: "Average",
    moistureMax: 16,
    brokenMax: 20,
    foreignMatterMax: 2.0,
    description: "Average quality, higher moisture content",
  },
  {
    grade: "D",
    label: "Below Average",
    moistureMax: 18,
    brokenMax: 30,
    foreignMatterMax: 3.0,
    description: "Lower quality, requires additional processing",
  },
];

const paddyVarieties: PaddyVariety[] = [
  "Samba",
  "Nadu",
  "Red Raw",
  "White Raw",
  "Basmathi",
  "Keeri Samba",
];

const regions = [
  "Colombo",
  "Kurunegala",
  "Anuradhapura",
  "Polonnaruwa",
  "Ampara",
  "Hambantota",
];

const isPaddyVariety = (value: string): value is PaddyVariety =>
  paddyVarieties.includes(value as PaddyVariety);

const isQualityGrade = (value: string): value is QualityGrade =>
  gradeDefinitions.some((grade) => grade.grade === value);

// ─── Small UI helpers ──────────────────────────────────────────
const GradeBadge = ({ grade }: { grade: QualityGrade }) => {
  const variants: Record<
    QualityGrade,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    A: "default",
    B: "secondary",
    C: "outline",
    D: "outline",
  };
  return <Badge variant={variants[grade]}>Grade {grade}</Badge>;
};

const PriceChangeIndicator = ({
  diff,
  percent,
}: {
  diff: number;
  percent: string;
}) => {
  if (diff === 0)
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="w-3 h-3" /> No change
      </span>
    );
  return diff > 0 ? (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
      <ArrowUpRight className="w-3 h-3" /> +{percent}%
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
      <ArrowDownRight className="w-3 h-3" /> {percent}%
    </span>
  );
};

const PriceFormFields = ({
  formVariety,
  formGrade,
  formPrice,
  formNotes,
  onVarietyChange,
  onGradeChange,
  onPriceChange,
  onNotesChange,
}: PriceFormFieldsProps) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Paddy Variety</Label>
        <Select
          value={formVariety}
          onValueChange={(value) => {
            if (isPaddyVariety(value)) {
              onVarietyChange(value);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {paddyVarieties.map((v) => (
              <SelectItem key={v} value={v}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Quality Grade</Label>
        <Select
          value={formGrade}
          onValueChange={(value) => {
            if (isQualityGrade(value)) {
              onGradeChange(value);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {gradeDefinitions.map((g) => (
              <SelectItem key={g.grade} value={g.grade}>
                Grade {g.grade} — {g.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
    <div className="space-y-2">
      <Label>Price per kg (Rs)</Label>
      <Input
        type="number"
        placeholder="e.g. 105"
        value={formPrice}
        onChange={(e) => onPriceChange(e.target.value)}
        min={0}
      />
    </div>
    <div className="space-y-2">
      <Label>
        Notes{" "}
        <span className="text-muted-foreground font-normal">(optional)</span>
      </Label>
      <Textarea
        placeholder="Any additional notes about this price..."
        value={formNotes}
        onChange={(e) => onNotesChange(e.target.value)}
        className="min-h-20 resize-none"
      />
    </div>
  </div>
);

// Map DB pricing to PriceEntry
function mapPricingToEntry(p: {
  _id: { toString?: () => string } | string;
  variety: string;
  qualityGrade: string;
  pricePerKg: number;
  isActive: boolean;
  updatedAt?: Date;
  notes?: string;
  region?: string;
}): PriceEntry {
  const grade = p.qualityGrade.replace("Grade ", "") as QualityGrade;
  const id =
    typeof p._id === "string" ? p._id : (p._id?.toString?.() ?? String(p._id));
  return {
    id,
    variety: p.variety as PaddyVariety,
    grade,
    pricePerKg: p.pricePerKg,
    previousPrice: p.pricePerKg,
    isActive: p.isActive,
    lastUpdated: p.updatedAt
      ? new Date(p.updatedAt).toLocaleString()
      : new Date().toLocaleString(),
    notes: p.notes,
    region: p.region,
  };
}

// ─── Main component ────────────────────────────────────────────
const PriceManagementPage = () => {
  const [prices, setPrices] = useState<PriceEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<PriceEntry | null>(null);
  const [filterVariety, setFilterVariety] = useState<string>("all");
  const [filterGrade, setFilterGrade] = useState<string>("all");

  const [formVariety, setFormVariety] = useState<PaddyVariety>("Samba");
  const [formGrade, setFormGrade] = useState<QualityGrade>("A");
  const [formPrice, setFormPrice] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [userDistrict, setUserDistrict] = useState<string | null>(null);
  const [formRegion, setFormRegion] = useState(regions[0]);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getPricings()
      .then((result) => {
        if (!isMounted) return;

        if (result.success && result.pricings) {
          setPrices(result.pricings.map(mapPricingToEntry));
        } else if (result.error) {
          toast.error(result.error);
        }
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

  useEffect(() => {
    fetchCurrentUserDistrict().then((res) => {
      if (res.success && res.district) {
        setUserDistrict(res.district);
        setFormRegion(res.district);
      }
    });
  }, []);

  const resetForm = () => {
    setFormVariety("Samba");
    setFormGrade("A");
    setFormPrice("");
    setFormNotes("");
    setFormRegion(userDistrict || regions[0]);
  };

  const handleAddPrice = async () => {
    if (!formPrice || parseFloat(formPrice) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    const exists = prices.find(
      (p) =>
        p.variety === formVariety &&
        p.grade === formGrade &&
        (p.region ?? "") === formRegion,
    );
    if (exists) {
      toast.error(
        `Price for ${formVariety} Grade ${formGrade} in ${formRegion} already exists. Use edit instead.`,
      );
      return;
    }
    setIsAdding(true);
    const regionToUse = formRegion || userDistrict || regions[0];
    const result = await addNewPricing({
      region: regionToUse,
      variety: formVariety,
      qualityGrade: `Grade ${formGrade}` as
        | "Grade A"
        | "Grade B"
        | "Grade C"
        | "Grade D",
      pricePerKg: parseFloat(formPrice),
      isActive: true,
      notes: formNotes || undefined,
    });
    setIsAdding(false);
    if (!result.success) {
      toast.error(result.error || "Failed to add pricing");
      return;
    }
    if (result.field) {
      const newEntry: PriceEntry = {
        id: result.field._id.toString(),
        variety: result.field.variety as PaddyVariety,
        grade: result.field.qualityGrade.replace("Grade ", "") as QualityGrade,
        pricePerKg: result.field.pricePerKg,
        previousPrice: result.field.pricePerKg,
        isActive: result.field.isActive,
        lastUpdated: result.field.updatedAt
          ? new Date(result.field.updatedAt).toLocaleString()
          : new Date().toLocaleString(),
        notes: result.field.notes,
        region: result.field.region,
      };
      setPrices((prev) => [...prev, newEntry]);
    }
    setIsAddDialogOpen(false);
    resetForm();
    toast.success(`Price added for ${formVariety} Grade ${formGrade}`);
  };

  const handleEditPrice = async () => {
    if (!editingPrice || !formPrice || parseFloat(formPrice) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    setIsUpdating(true);
    const result = await updatePricing(editingPrice.id, {
      region: formRegion,
      variety: formVariety,
      qualityGrade: `Grade ${formGrade}` as
        | "Grade A"
        | "Grade B"
        | "Grade C"
        | "Grade D",
      pricePerKg: parseFloat(formPrice),
      notes: formNotes || undefined,
    });
    setIsUpdating(false);
    if (!result.success) {
      toast.error(result.error || "Failed to update pricing");
      return;
    }
    if (result.field) {
      setPrices((prev) =>
        prev.map((p) =>
          p.id === editingPrice.id
            ? {
                ...mapPricingToEntry(result.field!),
                previousPrice: editingPrice.pricePerKg,
              }
            : p,
        ),
      );
    }
    setIsEditDialogOpen(false);
    setEditingPrice(null);
    resetForm();
    toast.success("Price updated successfully");
  };

  const handleDeletePrice = async (id: string) => {
    setDeletingId(id);
    const result = await deletePricing(id);
    setDeletingId(null);
    if (!result.success) {
      toast.error(result.error || "Failed to delete pricing");
      return;
    }
    setPrices((prev) => prev.filter((p) => p.id !== id));
    toast.success("Price entry removed");
  };

  const handleToggleActive = async (id: string) => {
    const entry = prices.find((p) => p.id === id);
    const newActive = !entry?.isActive;
    const result = await updatePricing(id, { isActive: newActive });
    if (!result.success) {
      toast.error(result.error || "Failed to update visibility");
      return;
    }
    setPrices((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: newActive } : p)),
    );
    toast.success(
      `${entry?.variety} Grade ${entry?.grade} ${newActive ? "now visible to" : "hidden from"} farmers`,
    );
  };

  const openEditDialog = (price: PriceEntry) => {
    setEditingPrice(price);
    setFormVariety(price.variety);
    setFormGrade(price.grade);
    setFormPrice(price.pricePerKg.toString());
    setFormNotes(price.notes || "");
    setFormRegion(price.region ?? regions[0]);
    setIsEditDialogOpen(true);
  };

  const getPriceChange = (current: number, previous: number) => {
    const diff = current - previous;
    const percent = previous > 0 ? ((diff / previous) * 100).toFixed(1) : "0";
    return { diff, percent };
  };

  const filteredPrices = prices.filter((p) => {
    if (filterVariety !== "all" && p.variety !== filterVariety) return false;
    if (filterGrade !== "all" && p.grade !== filterGrade) return false;
    return true;
  });

  const activePrices = prices.filter((p) => p.isActive);
  const avgPrice =
    activePrices.length > 0
      ? (
          activePrices.reduce((sum, p) => sum + p.pricePerKg, 0) /
          activePrices.length
        ).toFixed(0)
      : "0";
  const highestPrice =
    activePrices.length > 0
      ? Math.max(...activePrices.map((p) => p.pricePerKg))
      : 0;
  const lowestPrice =
    activePrices.length > 0
      ? Math.min(...activePrices.map((p) => p.pricePerKg))
      : 0;

  const stats = [
    {
      label: "Active Prices",
      value: activePrices.length.toString(),
      icon: DollarSign,
      color: "text-primary",
    },
    {
      label: "Avg Price/kg",
      value: `Rs ${avgPrice}`,
      icon: BarChart3,
      color: "text-accent",
    },
    {
      label: "Highest Price",
      value: `Rs ${highestPrice}`,
      icon: TrendingUp,
      color: "text-success",
    },
    {
      label: "Lowest Price",
      value: `Rs ${lowestPrice}`,
      icon: TrendingDown,
      color: "text-warning",
    },
  ];

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <main className="flex-1 p-8 transition-all duration-300">
        {/* Header */}
        <div className="mb-8 animate-fade-in flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-3xl text-foreground mb-2">
              Price Management 💰
            </h1>
            <p className="text-muted-foreground">
              Update daily paddy prices — visible to farmers in real-time
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2" onClick={resetForm}>
                <Plus className="w-5 h-5" />
                Add New Price
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Add New Price Entry
                </DialogTitle>
                <DialogDescription>
                  Set a new price for a paddy variety and quality grade. Region
                  is auto-set from your profile ({formRegion}).
                </DialogDescription>
              </DialogHeader>
              <PriceFormFields
                formVariety={formVariety}
                formGrade={formGrade}
                formPrice={formPrice}
                formNotes={formNotes}
                onVarietyChange={setFormVariety}
                onGradeChange={setFormGrade}
                onPriceChange={setFormPrice}
                onNotesChange={setFormNotes}
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isAdding}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddPrice} disabled={isAdding}>
                  {isAdding ? "Adding..." : "Add Price"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="prices">
          <TabsList className="h-12">
            <TabsTrigger value="prices" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Daily Prices
            </TabsTrigger>
            <TabsTrigger value="grades" className="gap-2">
              <Star className="w-4 h-4" />
              Quality Grades
            </TabsTrigger>
            <TabsTrigger value="summary" className="gap-2">
              <Wheat className="w-4 h-4" />
              Price Summary
            </TabsTrigger>
          </TabsList>

          {/* Daily Prices Tab */}
          <TabsContent value="prices" className="mt-4">
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      Current Paddy Prices
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Manage and update prices per variety and grade
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={filterVariety}
                      onValueChange={setFilterVariety}
                    >
                      <SelectTrigger className="w-37.5">
                        <SelectValue placeholder="All Varieties" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Varieties</SelectItem>
                        {paddyVarieties.map((v) => (
                          <SelectItem key={v} value={v}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filterGrade} onValueChange={setFilterGrade}>
                      <SelectTrigger className="w-32.5">
                        <SelectValue placeholder="All Grades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Grades</SelectItem>
                        {gradeDefinitions.map((g) => (
                          <SelectItem key={g.grade} value={g.grade}>
                            Grade {g.grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Variety</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Price/kg</TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPrices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2">
                            <DollarSign className="w-8 h-8 text-muted-foreground" />
                            <p className="text-muted-foreground font-medium">
                              No price entries found
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Try adjusting your filters or add a new price
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPrices.map((price) => {
                        const { diff, percent } = getPriceChange(
                          price.pricePerKg,
                          price.previousPrice,
                        );
                        return (
                          <TableRow
                            key={price.id}
                            className={`${!price.isActive ? "opacity-50" : ""}`}
                          >
                            <TableCell className="font-semibold text-foreground">
                              {price.variety}
                            </TableCell>
                            <TableCell>
                              <GradeBadge grade={price.grade} />
                            </TableCell>
                            <TableCell>
                              <span className="text-lg font-bold text-foreground">
                                Rs {price.pricePerKg.toFixed(0)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <PriceChangeIndicator
                                diff={diff}
                                percent={percent}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={price.isActive}
                                  onCheckedChange={() =>
                                    handleToggleActive(price.id)
                                  }
                                />
                                {price.isActive ? (
                                  <Eye className="w-4 h-4 text-success" />
                                ) : (
                                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Clock className="w-3.5 h-3.5" />
                                {price.lastUpdated}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => openEditDialog(price)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:text-destructive"
                                  onClick={() => handleDeletePrice(price.id)}
                                  disabled={deletingId === price.id}
                                >
                                  {deletingId === price.id ? (
                                    <span className="text-xs">...</span>
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
                {filteredPrices.length > 0 && (
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <p>
                      Showing {filteredPrices.length} of {prices.length} entries
                    </p>
                    <p className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {activePrices.length} visible to farmers
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quality Grades Tab */}
          <TabsContent value="grades" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {gradeDefinitions.map((grade) => (
                <Card
                  key={grade.grade}
                  className="border-border hover:shadow-medium transition-all"
                >
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">
                          {grade.grade}
                        </span>
                      </div>
                      <div>
                        <CardTitle>
                          Grade {grade.grade} — {grade.label}
                        </CardTitle>
                        <CardDescription>{grade.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 rounded-lg bg-muted/50 text-center">
                        <p className="text-sm text-muted-foreground mb-1">
                          Moisture Max
                        </p>
                        <p className="text-lg font-bold text-foreground">
                          {grade.moistureMax}%
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 text-center">
                        <p className="text-sm text-muted-foreground mb-1">
                          Broken Max
                        </p>
                        <p className="text-lg font-bold text-foreground">
                          {grade.brokenMax}%
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 text-center">
                        <p className="text-sm text-muted-foreground mb-1">
                          Foreign Matter
                        </p>
                        <p className="text-lg font-bold text-foreground">
                          {grade.foreignMatterMax}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary" className="mt-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wheat className="w-5 h-5 text-primary" />
                  Price Summary by Variety
                </CardTitle>
                <CardDescription>
                  Overview of all active prices grouped by paddy variety
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {paddyVarieties.map((variety) => {
                    const varietyPrices = activePrices.filter(
                      (p) => p.variety === variety,
                    );
                    if (varietyPrices.length === 0) return null;
                    return (
                      <div
                        key={variety}
                        className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-foreground flex items-center gap-2">
                            <Wheat className="w-4 h-4 text-primary" />
                            {variety}
                          </h3>
                          <Badge variant="secondary">
                            {varietyPrices.length} grade
                            {varietyPrices.length > 1 ? "s" : ""}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {varietyPrices.map((p) => {
                            const { diff } = getPriceChange(
                              p.pricePerKg,
                              p.previousPrice,
                            );
                            return (
                              <div
                                key={p.id}
                                className="p-4 rounded-lg bg-background border border-border"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <GradeBadge grade={p.grade} />
                                  {diff > 0 ? (
                                    <ArrowUpRight className="w-4 h-4 text-success" />
                                  ) : diff < 0 ? (
                                    <ArrowDownRight className="w-4 h-4 text-destructive" />
                                  ) : (
                                    <Minus className="w-3 h-3 text-muted-foreground" />
                                  )}
                                </div>
                                <p className="text-2xl font-bold text-foreground">
                                  Rs {p.pricePerKg}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  per kg
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6 border-border">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Real-Time Visibility
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      All active prices are automatically visible to farmers on
                      the Market Prices page. Toggle visibility using the switch
                      in the Daily Prices tab.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-120">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-primary" />
                Edit Price — {editingPrice?.variety} Grade {editingPrice?.grade}
              </DialogTitle>
              <DialogDescription>
                Current price:{" "}
                <span className="font-semibold text-foreground">
                  Rs {editingPrice?.pricePerKg}/kg
                </span>
              </DialogDescription>
            </DialogHeader>
            <PriceFormFields
              formVariety={formVariety}
              formGrade={formGrade}
              formPrice={formPrice}
              formNotes={formNotes}
              onVarietyChange={setFormVariety}
              onGradeChange={setFormGrade}
              onPriceChange={setFormPrice}
              onNotesChange={setFormNotes}
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button onClick={handleEditPrice} disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Price"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default PriceManagementPage;

"use client";

import { useState, useEffect } from "react";
import {
  addFertilizerRecord,
  addHarvestRecord,
  addPlantingRecord,
  deleteFertilizerRecord,
  deleteHarvestRecord,
  deletePlantingRecord,
  getFertilizerRecords,
  getFields,
  getHarvestRecords,
  getPlantingRecords,
  updateFertilizerRecord,
  updateHarvestRecord,
  updatePlantingRecord,
} from "@/lib/actions/farmer/paddy-records";
import FieldManagementSection, {
  type Field,
} from "@/components/dashboard/farmer/FieldManagementSection";
import PlantingRecordsSection, {
  type PlantingRecord,
} from "@/components/dashboard/farmer/PlantingRecordsSection";
import FertilizerRecordsSection, {
  type FertilizerRecord,
} from "@/components/dashboard/farmer/FertilizerRecordsSection";
import HarvestRecordsSection, {
  type HarvestRecord,
} from "@/components/dashboard/farmer/HarvestRecordsSection";
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
  Droplets,
  Sprout,
  TrendingUp,
  Edit,
  Eye,
  PieChart,
  DollarSign,
  Wheat,
  MapPin,
  Layers,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const FarmRecords = () => {
  const [activeTab, setActiveTab] = useState("planting");

  // Dialog states
  const [isAddPlantingOpen, setIsAddPlantingOpen] = useState(false);
  const [isAddFertilizerOpen, setIsAddFertilizerOpen] = useState(false);
  const [isAddHarvestOpen, setIsAddHarvestOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Selected record states
  const [selectedRecord, setSelectedRecord] = useState<
    PlantingRecord | FertilizerRecord | HarvestRecord | null
  >(null);
  const [selectedRecordType, setSelectedRecordType] = useState<
    "planting" | "fertilizer" | "harvest"
  >("planting");

  // Form states
  const [plantingForm, setPlantingForm] = useState({
    field: "",
    variety: "",
    date: "",
    area: "",
    seedQuantity: "",
    expectedHarvest: "",
    notes: "",
  });

  const [fertilizerForm, setFertilizerForm] = useState({
    field: "",
    type: "",
    quantity: "",
    date: "",
    cost: "",
    stage: "",
    method: "",
    notes: "",
  });

  const [harvestForm, setHarvestForm] = useState({
    field: "",
    date: "",
    yield: "",
    quality: "",
    pricePerKg: "",
    moisture: "",
    variety: "",
    soldTo: "",
    notes: "",
  });

  // Data states
  const [plantingRecords, setPlantingRecords] = useState<PlantingRecord[]>([]);

  const [fertilizerRecords, setFertilizerRecords] = useState<
    FertilizerRecord[]
  >([]);

  const [harvestRecords, setHarvestRecords] = useState<HarvestRecord[]>([]);

  const [fields, setFields] = useState<Field[]>([]);
  const [fieldsLoading, setFieldsLoading] = useState(true);
  const [plantingLoading, setPlantingLoading] = useState(true);
  const [fertilizerLoading, setFertilizerLoading] = useState(true);
  const [harvestLoading, setHarvestLoading] = useState(true);

  const toDateInput = (value?: string | Date) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toISOString().slice(0, 10);
  };

  const mapPlantingRecord = (record: {
    _id: { toString?: () => string } | string;
    field: string;
    variety: string;
    date: string | Date;
    area: string;
    status?: "Growing" | "Harvested" | "Preparing";
    progress?: number;
    expectedHarvest?: string | Date;
    seedQuantity?: string;
    notes?: string;
  }): PlantingRecord => ({
    id:
      typeof record._id === "string"
        ? record._id
        : (record._id?.toString?.() ?? ""),
    field: record.field,
    variety: record.variety,
    date: toDateInput(record.date),
    area: record.area,
    status: record.status ?? "Growing",
    progress: record.progress ?? 0,
    expectedHarvest: toDateInput(record.expectedHarvest),
    seedQuantity: record.seedQuantity ?? "",
    notes: record.notes,
  });

  const mapFertilizerRecord = (record: {
    _id: { toString?: () => string } | string;
    field: string;
    type: string;
    quantity: string;
    date: string | Date;
    cost: number;
    stage?: string;
    method?: string;
    notes?: string;
  }): FertilizerRecord => ({
    id:
      typeof record._id === "string"
        ? record._id
        : (record._id?.toString?.() ?? ""),
    field: record.field,
    type: record.type,
    quantity: record.quantity,
    date: toDateInput(record.date),
    cost: record.cost ?? 0,
    stage: record.stage ?? "",
    method: record.method ?? "",
    notes: record.notes,
  });

  const mapHarvestRecord = (record: {
    _id: { toString?: () => string } | string;
    field: string;
    date: string | Date;
    yield: number;
    quality: "Grade A" | "Grade B" | "Grade C";
    revenue?: number;
    pricePerKg?: number;
    moisture?: string;
    variety?: string;
    soldTo?: string;
    notes?: string;
  }): HarvestRecord => {
    const yieldValue = record.yield ?? 0;
    const pricePerKg = record.pricePerKg ?? 0;
    const revenue = record.revenue ?? yieldValue * pricePerKg;
    return {
      id:
        typeof record._id === "string"
          ? record._id
          : (record._id?.toString?.() ?? ""),
      field: record.field,
      date: toDateInput(record.date),
      yield: yieldValue,
      quality: record.quality,
      revenue,
      pricePerKg,
      moisture: record.moisture ?? "",
      variety: record.variety ?? "",
      soldTo: record.soldTo,
      notes: record.notes,
    };
  };

  // Load fields from server on mount
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getFields(),
      getPlantingRecords(),
      getFertilizerRecords(),
      getHarvestRecords(),
    ])
      .then(([fieldsRes, plantingRes, fertilizerRes, harvestRes]) => {
        if (cancelled) return;
        setFieldsLoading(false);
        setPlantingLoading(false);
        setFertilizerLoading(false);
        setHarvestLoading(false);

        if (fieldsRes.success && fieldsRes.fields) {
          setFields(
            fieldsRes.fields.map(
              (f: {
                _id: { toString?: () => string } | string;
                name: string;
                location: string;
                area: string;
                status: "Active" | "Fallow" | "Preparing";
                soilType: string;
                currentCrop?: string;
              }) => ({
                id:
                  typeof f._id === "string"
                    ? f._id
                    : (f._id?.toString?.() ?? ""),
                name: f.name,
                location: f.location,
                area: f.area,
                status: f.status,
                soilType: f.soilType,
                currentCrop: f.currentCrop,
              }),
            ),
          );
        }

        if (plantingRes.success && plantingRes.records) {
          setPlantingRecords(
            plantingRes.records.map(
              (r: Parameters<typeof mapPlantingRecord>[0]) =>
                mapPlantingRecord(r),
            ),
          );
        }

        if (fertilizerRes.success && fertilizerRes.records) {
          setFertilizerRecords(
            fertilizerRes.records.map(
              (r: Parameters<typeof mapFertilizerRecord>[0]) =>
                mapFertilizerRecord(r),
            ),
          );
        }

        if (harvestRes.success && harvestRes.records) {
          setHarvestRecords(
            harvestRes.records.map(
              (r: Parameters<typeof mapHarvestRecord>[0]) =>
                mapHarvestRecord(r),
            ),
          );
        }

        if (!fieldsRes.success && fieldsRes.error) toast.error(fieldsRes.error);
        if (!plantingRes.success && plantingRes.error)
          toast.error(plantingRes.error);
        if (!fertilizerRes.success && fertilizerRes.error)
          toast.error(fertilizerRes.error);
        if (!harvestRes.success && harvestRes.error)
          toast.error(harvestRes.error);
      })
      .catch(() => {
        if (cancelled) return;
        setFieldsLoading(false);
        setPlantingLoading(false);
        setFertilizerLoading(false);
        setHarvestLoading(false);
        toast.error("Failed to load paddy records");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Calculate statistics
  const totalArea = plantingRecords.reduce(
    (sum, r) => sum + parseFloat(r.area),
    0,
  );
  const activeFields = plantingRecords.filter(
    (r) => r.status === "Growing",
  ).length;
  const totalYield = harvestRecords.reduce((sum, r) => sum + (r.yield ?? 0), 0);
  const totalRevenue = harvestRecords.reduce(
    (sum, r) => sum + (r.revenue ?? 0),
    0,
  );
  const totalFertilizerCost = fertilizerRecords.reduce(
    (sum, r) => sum + (r.cost ?? 0),
    0,
  );
  const avgYieldPerAcre =
    totalYield /
    (plantingRecords.filter((r) => r.status === "Harvested").length > 0
      ? plantingRecords
          .filter((r) => r.status === "Harvested")
          .reduce((sum, r) => sum + parseFloat(r.area), 0)
      : 1);
  const netProfit = totalRevenue - totalFertilizerCost;

  // Production Summary
  const productionSummary = {
    totalSeeds: plantingRecords.reduce(
      (sum, r) => sum + parseInt(r.seedQuantity || "0", 10),
      0,
    ),
    varieties: [...new Set(plantingRecords.map((r) => r.variety))],
    harvestedFields: plantingRecords.filter((r) => r.status === "Harvested")
      .length,
    growingFields: plantingRecords.filter((r) => r.status === "Growing").length,
  };

  // Reset form functions
  const resetPlantingForm = () =>
    setPlantingForm({
      field: "",
      variety: "",
      date: "",
      area: "",
      seedQuantity: "",
      expectedHarvest: "",
      notes: "",
    });
  const resetFertilizerForm = () =>
    setFertilizerForm({
      field: "",
      type: "",
      quantity: "",
      date: "",
      cost: "",
      stage: "",
      method: "",
      notes: "",
    });
  const resetHarvestForm = () =>
    setHarvestForm({
      field: "",
      date: "",
      yield: "",
      quality: "",
      pricePerKg: "",
      moisture: "",
      variety: "",
      soldTo: "",
      notes: "",
    });
  // Add record handlers
  const handleAddPlanting = async () => {
    const res = await addPlantingRecord({
      field: plantingForm.field,
      variety: plantingForm.variety,
      date: plantingForm.date,
      area: plantingForm.area,
      status: "Growing",
      progress: 0,
      expectedHarvest: plantingForm.expectedHarvest || undefined,
      seedQuantity: plantingForm.seedQuantity || undefined,
      notes: plantingForm.notes || undefined,
    });
    if (!res.success) {
      toast.error(res.error ?? "Failed to add planting record");
      return;
    }
    if (res.record) {
      setPlantingRecords([
        mapPlantingRecord(
          res.record as Parameters<typeof mapPlantingRecord>[0],
        ),
        ...plantingRecords,
      ]);
    }
    setIsAddPlantingOpen(false);
    resetPlantingForm();
    toast.success("Planting record added successfully!");
  };

  const handleAddFertilizer = async () => {
    const res = await addFertilizerRecord({
      field: fertilizerForm.field,
      type: fertilizerForm.type,
      quantity: fertilizerForm.quantity,
      date: fertilizerForm.date,
      cost: parseFloat(fertilizerForm.cost) || 0,
      stage: fertilizerForm.stage || undefined,
      method: fertilizerForm.method || undefined,
      notes: fertilizerForm.notes || undefined,
    });
    if (!res.success) {
      toast.error(res.error ?? "Failed to add fertilizer record");
      return;
    }
    if (res.record) {
      setFertilizerRecords([
        mapFertilizerRecord(
          res.record as Parameters<typeof mapFertilizerRecord>[0],
        ),
        ...fertilizerRecords,
      ]);
    }
    setIsAddFertilizerOpen(false);
    resetFertilizerForm();
    toast.success("Fertilizer record added successfully!");
  };

  const handleAddHarvest = async () => {
    const yieldAmount = parseFloat(harvestForm.yield) || 0;
    const pricePerKg = parseFloat(harvestForm.pricePerKg) || 0;
    const res = await addHarvestRecord({
      field: harvestForm.field,
      date: harvestForm.date,
      yield: yieldAmount,
      quality: harvestForm.quality as "Grade A" | "Grade B" | "Grade C",
      revenue: yieldAmount * pricePerKg,
      pricePerKg: pricePerKg,
      moisture: harvestForm.moisture || undefined,
      variety: harvestForm.variety || undefined,
      soldTo: harvestForm.soldTo || undefined,
      notes: harvestForm.notes || undefined,
    });
    if (!res.success) {
      toast.error(res.error ?? "Failed to add harvest record");
      return;
    }
    if (res.record) {
      setHarvestRecords([
        mapHarvestRecord(res.record as Parameters<typeof mapHarvestRecord>[0]),
        ...harvestRecords,
      ]);
    }
    setIsAddHarvestOpen(false);
    resetHarvestForm();
    toast.success("Harvest record added successfully!");
  };

  // View record handler
  const handleViewRecord = (
    record: PlantingRecord | FertilizerRecord | HarvestRecord,
    type: "planting" | "fertilizer" | "harvest",
  ) => {
    setSelectedRecord(record);
    setSelectedRecordType(type);
    setIsViewDialogOpen(true);
  };

  // Edit record handler
  const handleEditRecord = (
    record: PlantingRecord | FertilizerRecord | HarvestRecord,
    type: "planting" | "fertilizer" | "harvest",
  ) => {
    setSelectedRecord(record);
    setSelectedRecordType(type);

    if (type === "planting") {
      const r = record as PlantingRecord;
      setPlantingForm({
        field: r.field,
        variety: r.variety,
        date: r.date,
        area: r.area,
        seedQuantity: r.seedQuantity,
        expectedHarvest: r.expectedHarvest,
        notes: r.notes || "",
      });
    } else if (type === "fertilizer") {
      const r = record as FertilizerRecord;
      setFertilizerForm({
        field: r.field,
        type: r.type,
        quantity: r.quantity,
        date: r.date,
        cost: r.cost.toString(),
        stage: r.stage,
        method: r.method,
        notes: r.notes || "",
      });
    } else if (type === "harvest") {
      const r = record as HarvestRecord;
      setHarvestForm({
        field: r.field,
        date: r.date,
        yield: r.yield.toString(),
        quality: r.quality,
        pricePerKg: r.pricePerKg.toString(),
        moisture: r.moisture,
        variety: r.variety,
        soldTo: r.soldTo || "",
        notes: r.notes || "",
      });
    }
    setIsEditDialogOpen(true);
  };

  // Save edit handler
  const handleSaveEdit = async () => {
    if (!selectedRecord) return;

    if (selectedRecordType === "planting") {
      const record = selectedRecord as PlantingRecord;
      const res = await updatePlantingRecord(String(record.id), {
        field: plantingForm.field,
        variety: plantingForm.variety,
        date: plantingForm.date,
        area: plantingForm.area,
        status: record.status,
        progress: record.progress,
        seedQuantity: plantingForm.seedQuantity || undefined,
        expectedHarvest: plantingForm.expectedHarvest || undefined,
        notes: plantingForm.notes || undefined,
      });
      if (!res.success) {
        toast.error(res.error ?? "Failed to update planting record");
        return;
      }
      if (res.record) {
        const mapped = mapPlantingRecord(
          res.record as Parameters<typeof mapPlantingRecord>[0],
        );
        setPlantingRecords(
          plantingRecords.map((r) => (r.id === record.id ? mapped : r)),
        );
      }
      resetPlantingForm();
    } else if (selectedRecordType === "fertilizer") {
      const record = selectedRecord as FertilizerRecord;
      const res = await updateFertilizerRecord(String(record.id), {
        field: fertilizerForm.field,
        type: fertilizerForm.type,
        quantity: fertilizerForm.quantity,
        date: fertilizerForm.date,
        cost: parseFloat(fertilizerForm.cost) || 0,
        stage: fertilizerForm.stage || undefined,
        method: fertilizerForm.method || undefined,
        notes: fertilizerForm.notes || undefined,
      });
      if (!res.success) {
        toast.error(res.error ?? "Failed to update fertilizer record");
        return;
      }
      if (res.record) {
        const mapped = mapFertilizerRecord(
          res.record as Parameters<typeof mapFertilizerRecord>[0],
        );
        setFertilizerRecords(
          fertilizerRecords.map((r) => (r.id === record.id ? mapped : r)),
        );
      }
      resetFertilizerForm();
    } else if (selectedRecordType === "harvest") {
      const yieldAmount = parseFloat(harvestForm.yield) || 0;
      const pricePerKg = parseFloat(harvestForm.pricePerKg) || 0;
      const record = selectedRecord as HarvestRecord;
      const res = await updateHarvestRecord(String(record.id), {
        field: harvestForm.field,
        date: harvestForm.date,
        yield: yieldAmount,
        quality: harvestForm.quality as "Grade A" | "Grade B" | "Grade C",
        revenue: yieldAmount * pricePerKg,
        pricePerKg,
        moisture: harvestForm.moisture || undefined,
        variety: harvestForm.variety || undefined,
        soldTo: harvestForm.soldTo || undefined,
        notes: harvestForm.notes || undefined,
      });
      if (!res.success) {
        toast.error(res.error ?? "Failed to update harvest record");
        return;
      }
      if (res.record) {
        const mapped = mapHarvestRecord(
          res.record as Parameters<typeof mapHarvestRecord>[0],
        );
        setHarvestRecords(
          harvestRecords.map((r) => (r.id === record.id ? mapped : r)),
        );
      }
      resetHarvestForm();
    }

    setIsEditDialogOpen(false);
    setSelectedRecord(null);
    toast.success("Record updated successfully!");
  };

  // Delete record handler
  const handleDeleteRecord = (
    record: PlantingRecord | FertilizerRecord | HarvestRecord,
    type: "planting" | "fertilizer" | "harvest",
  ) => {
    setSelectedRecord(record);
    setSelectedRecordType(type);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedRecord) return;

    if (selectedRecordType === "planting") {
      const res = await deletePlantingRecord(String(selectedRecord.id));
      if (!res.success) {
        toast.error(res.error ?? "Failed to delete planting record");
        return;
      }
      setPlantingRecords(
        plantingRecords.filter((r) => r.id !== selectedRecord.id),
      );
    } else if (selectedRecordType === "fertilizer") {
      const res = await deleteFertilizerRecord(String(selectedRecord.id));
      if (!res.success) {
        toast.error(res.error ?? "Failed to delete fertilizer record");
        return;
      }
      setFertilizerRecords(
        fertilizerRecords.filter((r) => r.id !== selectedRecord.id),
      );
    } else if (selectedRecordType === "harvest") {
      const res = await deleteHarvestRecord(String(selectedRecord.id));
      if (!res.success) {
        toast.error(res.error ?? "Failed to delete harvest record");
        return;
      }
      setHarvestRecords(
        harvestRecords.filter((r) => r.id !== selectedRecord.id),
      );
    }

    setIsDeleteDialogOpen(false);
    setSelectedRecord(null);
    toast.success("Record deleted successfully!");
  };

  // Get field options for dropdowns
  const fieldOptions = fields.map((f) => `${f.name} - ${f.location}`);

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="mx-auto px-8 py-8">
        {/* Content */}
        <div className="mx-auto">
          <div className="mb-8 animate-fade-in">
            <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-3">
              Digital Paddy Record Book
            </h1>
            <p className="text-muted-foreground text-lg">
              Track planting, fertilizer usage, and harvest details with
              auto-generated statistics
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 animate-fade-in">
            <Card className="border-border bg-linear-to-br from-emerald-500/10 to-teal-500/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Area</p>
                    <p className="text-xl font-bold text-foreground">
                      {totalArea.toFixed(1)} ac
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-linear-to-br from-blue-500/10 to-indigo-500/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Sprout className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Active Fields
                    </p>
                    <p className="text-xl font-bold text-foreground">
                      {activeFields}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-linear-to-br from-amber-500/10 to-orange-500/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <Wheat className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Yield</p>
                    <p className="text-xl font-bold text-foreground">
                      {(totalYield / 1000).toFixed(1)}T
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-linear-to-br from-green-500/10 to-emerald-500/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="text-xl font-bold text-foreground">
                      Rs{(totalRevenue / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-linear-to-br from-red-500/10 to-rose-500/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-linear-to-br from-red-500 to-rose-600 flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Fert. Cost</p>
                    <p className="text-xl font-bold text-foreground">
                      Rs{(totalFertilizerCost / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-linear-to-br from-purple-500/10 to-pink-500/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Net Profit</p>
                    <p className="text-xl font-bold text-primary">
                      Rs{(netProfit / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Production Summary */}
          <Card className="mb-8 border-border bg-linear-to-r from-primary/5 to-emerald-500/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-primary to-emerald-600 flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>Production Summary</CardTitle>
                  <CardDescription>
                    Auto-generated statistics for your farm
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 rounded-xl bg-background/50">
                  <p className="text-3xl font-bold text-foreground mb-1">
                    {productionSummary.totalSeeds} kg
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total Seeds Used
                  </p>
                </div>
                <div className="text-center p-4 rounded-xl bg-background/50">
                  <p className="text-3xl font-bold text-foreground mb-1">
                    {avgYieldPerAcre.toFixed(0)} kg
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Avg. Yield/Acre
                  </p>
                </div>
                <div className="text-center p-4 rounded-xl bg-background/50">
                  <p className="text-3xl font-bold text-foreground mb-1">
                    {productionSummary.varieties.length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Rice Varieties
                  </p>
                </div>
                <div className="text-center p-4 rounded-xl bg-background/50">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-xl font-bold text-primary">
                      {productionSummary.harvestedFields}
                    </span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-xl font-bold text-amber-500">
                      {productionSummary.growingFields}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Harvested / Growing
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for different record types */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-4 h-14">
              <TabsTrigger
                value="fields"
                className="gap-2 data-[state=active]:bg-linear-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <Layers className="w-4 h-4" />
                Fields
              </TabsTrigger>
              <TabsTrigger
                value="planting"
                className="gap-2 data-[state=active]:bg-linear-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
              >
                <Sprout className="w-4 h-4" />
                Planting
              </TabsTrigger>
              <TabsTrigger
                value="fertilizer"
                className="gap-2 data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
              >
                <Droplets className="w-4 h-4" />
                Fertilizer
              </TabsTrigger>
              <TabsTrigger
                value="harvest"
                className="gap-2 data-[state=active]:bg-linear-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white"
              >
                <Wheat className="w-4 h-4" />
                Harvest
              </TabsTrigger>
            </TabsList>

            {/* Fields Tab */}
            <TabsContent value="fields" className="space-y-4">
              <FieldManagementSection
                fields={fields}
                setFields={setFields}
                fieldsLoading={fieldsLoading}
              />
            </TabsContent>

            {/* Planting Records */}
            <TabsContent value="planting" className="space-y-4">
              <PlantingRecordsSection
                records={plantingRecords}
                loading={plantingLoading}
                onAdd={() => setIsAddPlantingOpen(true)}
                onView={(record) => handleViewRecord(record, "planting")}
                onEdit={(record) => handleEditRecord(record, "planting")}
                onDelete={(record) => handleDeleteRecord(record, "planting")}
              />
            </TabsContent>

            {/* Fertilizer Records */}
            <TabsContent value="fertilizer" className="space-y-4">
              <FertilizerRecordsSection
                records={fertilizerRecords}
                loading={fertilizerLoading}
                totalCost={totalFertilizerCost}
                onAdd={() => setIsAddFertilizerOpen(true)}
                onView={(record) => handleViewRecord(record, "fertilizer")}
                onEdit={(record) => handleEditRecord(record, "fertilizer")}
                onDelete={(record) => handleDeleteRecord(record, "fertilizer")}
              />
            </TabsContent>

            {/* Harvest Records */}
            <TabsContent value="harvest" className="space-y-4">
              <HarvestRecordsSection
                records={harvestRecords}
                loading={harvestLoading}
                totalRevenue={totalRevenue}
                onAdd={() => setIsAddHarvestOpen(true)}
                onView={(record) => handleViewRecord(record, "harvest")}
                onEdit={(record) => handleEditRecord(record, "harvest")}
                onDelete={(record) => handleDeleteRecord(record, "harvest")}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Add Planting Dialog */}
      <Dialog open={isAddPlantingOpen} onOpenChange={setIsAddPlantingOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-primary" />
              Add Planting Record
            </DialogTitle>
            <DialogDescription>
              Record a new planting activity
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Field</Label>
                <Select
                  value={plantingForm.field}
                  onValueChange={(v) =>
                    setPlantingForm({ ...plantingForm, field: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldOptions.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rice Variety</Label>
                <Select
                  value={plantingForm.variety}
                  onValueChange={(v) =>
                    setPlantingForm({ ...plantingForm, variety: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select variety" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BG 300">BG 300</SelectItem>
                    <SelectItem value="BG 352">BG 352</SelectItem>
                    <SelectItem value="BG 450">BG 450</SelectItem>
                    <SelectItem value="AT 362">AT 362</SelectItem>
                    <SelectItem value="BG 94-1">BG 94-1</SelectItem>
                    <SelectItem value="Suwandel">Suwandel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Planting Date</Label>
                <Input
                  type="date"
                  value={plantingForm.date}
                  onChange={(e) =>
                    setPlantingForm({ ...plantingForm, date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Expected Harvest</Label>
                <Input
                  type="date"
                  value={plantingForm.expectedHarvest}
                  onChange={(e) =>
                    setPlantingForm({
                      ...plantingForm,
                      expectedHarvest: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Area</Label>
                <Input
                  placeholder="e.g., 2.5 acres"
                  value={plantingForm.area}
                  onChange={(e) =>
                    setPlantingForm({ ...plantingForm, area: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Seed Quantity</Label>
                <Input
                  placeholder="e.g., 50 kg"
                  value={plantingForm.seedQuantity}
                  onChange={(e) =>
                    setPlantingForm({
                      ...plantingForm,
                      seedQuantity: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Additional notes..."
                value={plantingForm.notes}
                onChange={(e) =>
                  setPlantingForm({ ...plantingForm, notes: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddPlantingOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddPlanting}
              className="bg-linear-to-r from-emerald-500 to-teal-600"
            >
              Save Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Fertilizer Dialog */}
      <Dialog open={isAddFertilizerOpen} onOpenChange={setIsAddFertilizerOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              Add Fertilizer Record
            </DialogTitle>
            <DialogDescription>
              Record a fertilizer application
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Field</Label>
                <Select
                  value={fertilizerForm.field}
                  onValueChange={(v) =>
                    setFertilizerForm({ ...fertilizerForm, field: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldOptions.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fertilizer Type</Label>
                <Select
                  value={fertilizerForm.type}
                  onValueChange={(v) =>
                    setFertilizerForm({ ...fertilizerForm, type: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Urea (46-0-0)">Urea (46-0-0)</SelectItem>
                    <SelectItem value="TSP (0-46-0)">TSP (0-46-0)</SelectItem>
                    <SelectItem value="MOP (0-0-60)">MOP (0-0-60)</SelectItem>
                    <SelectItem value="DAP (18-46-0)">DAP (18-46-0)</SelectItem>
                    <SelectItem value="Zinc Sulphate">Zinc Sulphate</SelectItem>
                    <SelectItem value="Organic Compost">
                      Organic Compost
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  placeholder="e.g., 50 kg"
                  value={fertilizerForm.quantity}
                  onChange={(e) =>
                    setFertilizerForm({
                      ...fertilizerForm,
                      quantity: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Application Date</Label>
                <Input
                  type="date"
                  value={fertilizerForm.date}
                  onChange={(e) =>
                    setFertilizerForm({
                      ...fertilizerForm,
                      date: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Growth Stage</Label>
                <Select
                  value={fertilizerForm.stage}
                  onValueChange={(v) =>
                    setFertilizerForm({ ...fertilizerForm, stage: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basal">Basal</SelectItem>
                    <SelectItem value="Tillering">Tillering</SelectItem>
                    <SelectItem value="Panicle">Panicle Initiation</SelectItem>
                    <SelectItem value="Flowering">Flowering</SelectItem>
                    <SelectItem value="Active Growth">Active Growth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Application Method</Label>
                <Select
                  value={fertilizerForm.method}
                  onValueChange={(v) =>
                    setFertilizerForm({ ...fertilizerForm, method: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Broadcasting">Broadcasting</SelectItem>
                    <SelectItem value="Incorporation">Incorporation</SelectItem>
                    <SelectItem value="Foliar Spray">Foliar Spray</SelectItem>
                    <SelectItem value="Banding">Banding</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cost (Rs)</Label>
              <Input
                type="number"
                placeholder="e.g., 7500"
                value={fertilizerForm.cost}
                onChange={(e) =>
                  setFertilizerForm({ ...fertilizerForm, cost: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Additional notes..."
                value={fertilizerForm.notes}
                onChange={(e) =>
                  setFertilizerForm({
                    ...fertilizerForm,
                    notes: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddFertilizerOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddFertilizer}
              className="bg-linear-to-r from-blue-500 to-indigo-600"
            >
              Save Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Harvest Dialog */}
      <Dialog open={isAddHarvestOpen} onOpenChange={setIsAddHarvestOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wheat className="w-5 h-5 text-amber-500" />
              Add Harvest Record
            </DialogTitle>
            <DialogDescription>
              Record a harvest from your field
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Field</Label>
                <Select
                  value={harvestForm.field}
                  onValueChange={(v) =>
                    setHarvestForm({ ...harvestForm, field: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldOptions.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rice Variety</Label>
                <Select
                  value={harvestForm.variety}
                  onValueChange={(v) =>
                    setHarvestForm({ ...harvestForm, variety: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select variety" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BG 300">BG 300</SelectItem>
                    <SelectItem value="BG 352">BG 352</SelectItem>
                    <SelectItem value="BG 450">BG 450</SelectItem>
                    <SelectItem value="AT 362">AT 362</SelectItem>
                    <SelectItem value="BG 94-1">BG 94-1</SelectItem>
                    <SelectItem value="Suwandel">Suwandel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Harvest Date</Label>
                <Input
                  type="date"
                  value={harvestForm.date}
                  onChange={(e) =>
                    setHarvestForm({ ...harvestForm, date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Quality Grade</Label>
                <Select
                  value={harvestForm.quality}
                  onValueChange={(v) =>
                    setHarvestForm({ ...harvestForm, quality: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grade A">Grade A (Premium)</SelectItem>
                    <SelectItem value="Grade B">Grade B (Standard)</SelectItem>
                    <SelectItem value="Grade C">Grade C (Economy)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Yield (kg)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 4800"
                  value={harvestForm.yield}
                  onChange={(e) =>
                    setHarvestForm({ ...harvestForm, yield: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Price/kg (Rs)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 85"
                  value={harvestForm.pricePerKg}
                  onChange={(e) =>
                    setHarvestForm({
                      ...harvestForm,
                      pricePerKg: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Moisture %</Label>
                <Input
                  placeholder="e.g., 14%"
                  value={harvestForm.moisture}
                  onChange={(e) =>
                    setHarvestForm({ ...harvestForm, moisture: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Sold To (Optional)</Label>
              <Input
                placeholder="e.g., Local Mill, Co-op"
                value={harvestForm.soldTo}
                onChange={(e) =>
                  setHarvestForm({ ...harvestForm, soldTo: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Additional notes..."
                value={harvestForm.notes}
                onChange={(e) =>
                  setHarvestForm({ ...harvestForm, notes: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddHarvestOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddHarvest}
              className="bg-linear-to-r from-amber-500 to-orange-600"
            >
              Save Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Record Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Record Details
            </DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4 py-4">
              {selectedRecordType === "planting" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Field:
                      </span>
                      <p className="font-medium">
                        {(selectedRecord as PlantingRecord).field}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Variety:
                      </span>
                      <p className="font-medium">
                        {(selectedRecord as PlantingRecord).variety}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Date:
                      </span>
                      <p className="font-medium">
                        {(selectedRecord as PlantingRecord).date}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Area:
                      </span>
                      <p className="font-medium">
                        {(selectedRecord as PlantingRecord).area}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Seeds:
                      </span>
                      <p className="font-medium">
                        {(selectedRecord as PlantingRecord).seedQuantity}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Expected Harvest:
                      </span>
                      <p className="font-medium">
                        {(selectedRecord as PlantingRecord).expectedHarvest}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Status:
                      </span>
                      <Badge>{(selectedRecord as PlantingRecord).status}</Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Progress:
                      </span>
                      <p className="font-medium">
                        {(selectedRecord as PlantingRecord).progress}%
                      </p>
                    </div>
                  </div>
                  {(selectedRecord as PlantingRecord).notes && (
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Notes:
                      </span>
                      <p className="font-medium">
                        {(selectedRecord as PlantingRecord).notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
              {selectedRecordType === "fertilizer" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Field:
                      </span>
                      <p className="font-medium">
                        {(selectedRecord as FertilizerRecord).field}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Type:
                      </span>
                      <p className="font-medium">
                        {(selectedRecord as FertilizerRecord).type}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Quantity:
                      </span>
                      <p className="font-medium">
                        {(selectedRecord as FertilizerRecord).quantity}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Date:
                      </span>
                      <p className="font-medium">
                        {(selectedRecord as FertilizerRecord).date}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Stage:
                      </span>
                      <p className="font-medium">
                        {(selectedRecord as FertilizerRecord).stage}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Method:
                      </span>
                      <p className="font-medium">
                        {(selectedRecord as FertilizerRecord).method}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Cost:
                      </span>
                      <p className="font-medium text-primary">
                        Rs{" "}
                        {(
                          selectedRecord as FertilizerRecord
                        ).cost.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {(selectedRecord as FertilizerRecord).notes && (
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Notes:
                      </span>
                      <p className="font-medium">
                        {(selectedRecord as FertilizerRecord).notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
              {selectedRecordType === "harvest" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Field:
                      </span>
                      <p className="font-medium">
                        {(selectedRecord as HarvestRecord).field}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Variety:
                      </span>
                      <p className="font-medium">
                        {(selectedRecord as HarvestRecord).variety}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Date:
                      </span>
                      <p className="font-medium">
                        {(selectedRecord as HarvestRecord).date}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Quality:
                      </span>
                      <Badge>{(selectedRecord as HarvestRecord).quality}</Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Yield:
                      </span>
                      <p className="font-medium">
                        {(
                          selectedRecord as HarvestRecord
                        ).yield.toLocaleString()}{" "}
                        kg
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Price/kg:
                      </span>
                      <p className="font-medium">
                        Rs {(selectedRecord as HarvestRecord).pricePerKg}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Revenue:
                      </span>
                      <p className="font-medium text-primary">
                        Rs{" "}
                        {(
                          selectedRecord as HarvestRecord
                        ).revenue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Moisture:
                      </span>
                      <p className="font-medium">
                        {(selectedRecord as HarvestRecord).moisture}
                      </p>
                    </div>
                  </div>
                  {(selectedRecord as HarvestRecord).soldTo && (
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Sold To:
                      </span>
                      <p className="font-medium">
                        {(selectedRecord as HarvestRecord).soldTo}
                      </p>
                    </div>
                  )}
                  {(selectedRecord as HarvestRecord).notes && (
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Notes:
                      </span>
                      <p className="font-medium">
                        {(selectedRecord as HarvestRecord).notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit{" "}
              {selectedRecordType === "planting"
                ? "Planting"
                : selectedRecordType === "fertilizer"
                  ? "Fertilizer"
                  : "Harvest"}{" "}
              Record
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedRecordType === "planting" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Field</Label>
                    <Input
                      value={plantingForm.field}
                      onChange={(e) =>
                        setPlantingForm({
                          ...plantingForm,
                          field: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Variety</Label>
                    <Input
                      value={plantingForm.variety}
                      onChange={(e) =>
                        setPlantingForm({
                          ...plantingForm,
                          variety: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Planting Date</Label>
                    <Input
                      type="date"
                      value={plantingForm.date}
                      onChange={(e) =>
                        setPlantingForm({
                          ...plantingForm,
                          date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expected Harvest</Label>
                    <Input
                      type="date"
                      value={plantingForm.expectedHarvest}
                      onChange={(e) =>
                        setPlantingForm({
                          ...plantingForm,
                          expectedHarvest: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Area</Label>
                    <Input
                      value={plantingForm.area}
                      onChange={(e) =>
                        setPlantingForm({
                          ...plantingForm,
                          area: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Seed Quantity</Label>
                    <Input
                      value={plantingForm.seedQuantity}
                      onChange={(e) =>
                        setPlantingForm({
                          ...plantingForm,
                          seedQuantity: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={plantingForm.notes}
                    onChange={(e) =>
                      setPlantingForm({
                        ...plantingForm,
                        notes: e.target.value,
                      })
                    }
                  />
                </div>
              </>
            )}
            {selectedRecordType === "fertilizer" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Field</Label>
                    <Input
                      value={fertilizerForm.field}
                      onChange={(e) =>
                        setFertilizerForm({
                          ...fertilizerForm,
                          field: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Input
                      value={fertilizerForm.type}
                      onChange={(e) =>
                        setFertilizerForm({
                          ...fertilizerForm,
                          type: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      value={fertilizerForm.quantity}
                      onChange={(e) =>
                        setFertilizerForm({
                          ...fertilizerForm,
                          quantity: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={fertilizerForm.date}
                      onChange={(e) =>
                        setFertilizerForm({
                          ...fertilizerForm,
                          date: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Stage</Label>
                    <Input
                      value={fertilizerForm.stage}
                      onChange={(e) =>
                        setFertilizerForm({
                          ...fertilizerForm,
                          stage: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Method</Label>
                    <Input
                      value={fertilizerForm.method}
                      onChange={(e) =>
                        setFertilizerForm({
                          ...fertilizerForm,
                          method: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cost (Rs)</Label>
                  <Input
                    type="number"
                    value={fertilizerForm.cost}
                    onChange={(e) =>
                      setFertilizerForm({
                        ...fertilizerForm,
                        cost: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={fertilizerForm.notes}
                    onChange={(e) =>
                      setFertilizerForm({
                        ...fertilizerForm,
                        notes: e.target.value,
                      })
                    }
                  />
                </div>
              </>
            )}
            {selectedRecordType === "harvest" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Field</Label>
                    <Input
                      value={harvestForm.field}
                      onChange={(e) =>
                        setHarvestForm({
                          ...harvestForm,
                          field: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Variety</Label>
                    <Input
                      value={harvestForm.variety}
                      onChange={(e) =>
                        setHarvestForm({
                          ...harvestForm,
                          variety: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Harvest Date</Label>
                    <Input
                      type="date"
                      value={harvestForm.date}
                      onChange={(e) =>
                        setHarvestForm({ ...harvestForm, date: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quality</Label>
                    <Select
                      value={harvestForm.quality}
                      onValueChange={(v) =>
                        setHarvestForm({ ...harvestForm, quality: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Grade A">Grade A</SelectItem>
                        <SelectItem value="Grade B">Grade B</SelectItem>
                        <SelectItem value="Grade C">Grade C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Yield (kg)</Label>
                    <Input
                      type="number"
                      value={harvestForm.yield}
                      onChange={(e) =>
                        setHarvestForm({
                          ...harvestForm,
                          yield: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price/kg (Rs)</Label>
                    <Input
                      type="number"
                      value={harvestForm.pricePerKg}
                      onChange={(e) =>
                        setHarvestForm({
                          ...harvestForm,
                          pricePerKg: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Moisture</Label>
                    <Input
                      value={harvestForm.moisture}
                      onChange={(e) =>
                        setHarvestForm({
                          ...harvestForm,
                          moisture: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Sold To</Label>
                  <Input
                    value={harvestForm.soldTo}
                    onChange={(e) =>
                      setHarvestForm({ ...harvestForm, soldTo: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={harvestForm.notes}
                    onChange={(e) =>
                      setHarvestForm({ ...harvestForm, notes: e.target.value })
                    }
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Delete Record
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {selectedRecordType} record?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FarmRecords;

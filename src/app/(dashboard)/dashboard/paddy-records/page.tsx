"use client";

import { useState, useEffect, useCallback } from "react";
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
} from "@/components/dashboard/farmer/paddy-records/FieldManagementSection";
import PlantingRecordsSection, {
  type PlantingRecord,
} from "@/components/dashboard/farmer/paddy-records/PlantingRecordsSection";
import FertilizerRecordsSection, {
  type FertilizerRecord,
} from "@/components/dashboard/farmer/paddy-records/FertilizerRecordsSection";
import HarvestRecordsSection, {
  type HarvestRecord,
} from "@/components/dashboard/farmer/paddy-records/HarvestRecordsSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Droplets, Sprout, Wheat, Layers } from "lucide-react";
import { toast } from "sonner";
import PaddyRecordsStats from "@/components/dashboard/farmer/paddy-records/PaddyRecordsStats";
import ProductionSummaryCard from "@/components/dashboard/farmer/paddy-records/ProductionSummaryCard";
import PaddyRecordsDialogs from "@/components/dashboard/farmer/paddy-records/PaddyRecordsDialogs";
import Loading from "@/components/loading";

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
  const isLoading =
    fieldsLoading || plantingLoading || fertilizerLoading || harvestLoading;

  const toDateInput = useCallback((value?: string | Date) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toISOString().slice(0, 10);
  }, []);

  const mapPlantingRecord = useCallback(
    (record: {
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
    }),
    [toDateInput],
  );

  const mapFertilizerRecord = useCallback(
    (record: {
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
    }),
    [toDateInput],
  );

  const mapHarvestRecord = useCallback(
    (record: {
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
    },
    [toDateInput],
  );

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
  }, [mapFertilizerRecord, mapHarvestRecord, mapPlantingRecord]);

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

  if (isLoading) {
    return <Loading />;
  }

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
          <PaddyRecordsStats
            totalArea={totalArea}
            activeFields={activeFields}
            totalYield={totalYield}
            totalRevenue={totalRevenue}
            totalFertilizerCost={totalFertilizerCost}
            netProfit={netProfit}
          />

          {/* Production Summary */}
          <ProductionSummaryCard
            totalSeeds={productionSummary.totalSeeds}
            avgYieldPerAcre={avgYieldPerAcre}
            varietiesCount={productionSummary.varieties.length}
            harvestedFields={productionSummary.harvestedFields}
            growingFields={productionSummary.growingFields}
          />

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

      <PaddyRecordsDialogs
        fieldOptions={fieldOptions}
        plantingForm={plantingForm}
        setPlantingForm={setPlantingForm}
        fertilizerForm={fertilizerForm}
        setFertilizerForm={setFertilizerForm}
        harvestForm={harvestForm}
        setHarvestForm={setHarvestForm}
        isAddPlantingOpen={isAddPlantingOpen}
        setIsAddPlantingOpen={setIsAddPlantingOpen}
        isAddFertilizerOpen={isAddFertilizerOpen}
        setIsAddFertilizerOpen={setIsAddFertilizerOpen}
        isAddHarvestOpen={isAddHarvestOpen}
        setIsAddHarvestOpen={setIsAddHarvestOpen}
        isViewDialogOpen={isViewDialogOpen}
        setIsViewDialogOpen={setIsViewDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        selectedRecord={selectedRecord}
        selectedRecordType={selectedRecordType}
        onAddPlanting={handleAddPlanting}
        onAddFertilizer={handleAddFertilizer}
        onAddHarvest={handleAddHarvest}
        onSaveEdit={handleSaveEdit}
        onConfirmDelete={confirmDelete}
      />
    </div>
  );
};

export default FarmRecords;

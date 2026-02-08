"use client";

import type { Dispatch, SetStateAction } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Edit,
  Eye,
  Loader2,
  MapPin,
  Plus,
  Sprout,
  Trash2,
  Wheat,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface PlantingRecord {
  id: string;
  field: string;
  variety: string;
  date: string;
  area: string;
  status: "Growing" | "Harvested" | "Preparing";
  progress: number;
  expectedHarvest?: string;
  seedQuantity?: string;
  notes?: string;
}

export interface PlantingFormState {
  field: string;
  variety: string;
  date: string;
  area: string;
  seedQuantity: string;
  expectedHarvest: string;
  notes: string;
}

interface PlantingRecordsSectionProps {
  plantingRecords: PlantingRecord[];
  plantingLoading: boolean;
  plantingSaving: boolean;
  isAddPlantingOpen: boolean;
  fieldOptions: string[];
  riceVarieties: string[];
  plantingForm: PlantingFormState;
  setPlantingForm: Dispatch<SetStateAction<PlantingFormState>>;
  onAddPlanting: () => void;
  onOpenAddPlanting: (open: boolean) => void;
  onViewRecord: (record: PlantingRecord) => void;
  onEditRecord: (record: PlantingRecord) => void;
  onDeleteRecord: (record: PlantingRecord) => void;
}

const PlantingRecordsSection = ({
  plantingRecords,
  plantingLoading,
  plantingSaving,
  isAddPlantingOpen,
  fieldOptions,
  riceVarieties,
  plantingForm,
  setPlantingForm,
  onAddPlanting,
  onOpenAddPlanting,
  onViewRecord,
  onEditRecord,
  onDeleteRecord,
}: PlantingRecordsSectionProps) => (
  <>
    <TabsContent value="planting" className="space-y-4">
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-primary" />
                Planting Records
              </CardTitle>
              <CardDescription>
                Track your planting activities and crop growth progress
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
              <Button
                onClick={() => onOpenAddPlanting(true)}
                className="bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Record
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plantingLoading ? (
              <div className="rounded-xl border border-dashed border-muted-foreground/30 p-6 text-center text-sm text-muted-foreground">
                Loading planting records...
              </div>
            ) : plantingRecords.length === 0 ? (
              <div className="rounded-xl border border-dashed border-muted-foreground/30 p-6 text-center text-sm text-muted-foreground">
                No planting records yet. Add your first record to start tracking
                growth progress.
              </div>
            ) : (
              plantingRecords.map((record) => (
                <div
                  key={record.id}
                  className="p-5 rounded-xl bg-muted/50 hover:bg-muted transition-all border border-transparent hover:border-primary/20"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-lg flex items-center justify-center",
                          record.status === "Harvested"
                            ? "bg-linear-to-br from-amber-500 to-orange-600"
                            : "bg-linear-to-br from-emerald-500 to-teal-600",
                        )}
                      >
                        {record.status === "Harvested" ? (
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        ) : (
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-lg">
                          {record.field}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={
                              record.status === "Growing"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {record.status}
                          </Badge>
                          <Badge variant="outline">{record.variety}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewRecord(record)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditRecord(record)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onDeleteRecord(record)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Planted:</span>
                      <span className="text-foreground font-medium">
                        {record.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Area:</span>
                      <span className="text-foreground font-medium">
                        {record.area} acres
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Wheat className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Seeds:</span>
                      <span className="text-foreground font-medium">
                        {record.seedQuantity || "-"} kg
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Harvest:</span>
                      <span className="text-foreground font-medium">
                        {record.expectedHarvest || "-"}
                      </span>
                    </div>
                  </div>

                  {record.status === "Growing" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Growth Progress
                        </span>
                        <span className="text-foreground font-semibold">
                          {record.progress}%
                        </span>
                      </div>
                      <Progress value={record.progress} className="h-2" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </TabsContent>

    <Dialog open={isAddPlantingOpen} onOpenChange={onOpenAddPlanting}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-primary" />
            Add Planting Record
          </DialogTitle>
          <DialogDescription>Record a new planting activity</DialogDescription>
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
                  {riceVarieties.map((variety) => (
                    <SelectItem key={variety} value={variety}>
                      {variety}
                    </SelectItem>
                  ))}
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
          <Button variant="outline" onClick={() => onOpenAddPlanting(false)}>
            Cancel
          </Button>
          <Button
            onClick={onAddPlanting}
            className="bg-linear-to-r from-emerald-500 to-teal-600"
            disabled={plantingSaving}
          >
            {plantingSaving ? "Saving..." : "Save Record"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
);

export default PlantingRecordsSection;

import type { Dispatch, FC, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Droplets, Edit, Eye, Sprout, Wheat } from "lucide-react";
import type { FertilizerRecord } from "@/components/dashboard/farmer/paddy-records/FertilizerRecordsSection";
import type { HarvestRecord } from "@/components/dashboard/farmer/paddy-records/HarvestRecordsSection";
import type { PlantingRecord } from "@/components/dashboard/farmer/paddy-records/PlantingRecordsSection";
import { RICE_VARIETIES } from "@/lib/rice-varieties";

interface PlantingFormState {
  field: string;
  variety: string;
  date: string;
  area: string;
  seedQuantity: string;
  expectedHarvest: string;
  notes: string;
}

interface FertilizerFormState {
  field: string;
  type: string;
  quantity: string;
  date: string;
  cost: string;
  stage: string;
  method: string;
  notes: string;
}

interface HarvestFormState {
  field: string;
  date: string;
  yield: string;
  quality: string;
  pricePerKg: string;
  moisture: string;
  variety: string;
  soldTo: string;
  notes: string;
}

type RecordType = "planting" | "fertilizer" | "harvest";

type AnyRecord = PlantingRecord | FertilizerRecord | HarvestRecord;

interface PaddyRecordsDialogsProps {
  fieldOptions: string[];
  plantingForm: PlantingFormState;
  setPlantingForm: Dispatch<SetStateAction<PlantingFormState>>;
  fertilizerForm: FertilizerFormState;
  setFertilizerForm: Dispatch<SetStateAction<FertilizerFormState>>;
  harvestForm: HarvestFormState;
  setHarvestForm: Dispatch<SetStateAction<HarvestFormState>>;
  isAddPlantingOpen: boolean;
  setIsAddPlantingOpen: Dispatch<SetStateAction<boolean>>;
  isAddFertilizerOpen: boolean;
  setIsAddFertilizerOpen: Dispatch<SetStateAction<boolean>>;
  isAddHarvestOpen: boolean;
  setIsAddHarvestOpen: Dispatch<SetStateAction<boolean>>;
  isViewDialogOpen: boolean;
  setIsViewDialogOpen: Dispatch<SetStateAction<boolean>>;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: Dispatch<SetStateAction<boolean>>;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: Dispatch<SetStateAction<boolean>>;
  selectedRecord: AnyRecord | null;
  selectedRecordType: RecordType;
  onAddPlanting: () => void;
  onAddFertilizer: () => void;
  onAddHarvest: () => void;
  onSaveEdit: () => void;
  onConfirmDelete: () => void;
}

const PaddyRecordsDialogs: FC<PaddyRecordsDialogsProps> = ({
  fieldOptions,
  plantingForm,
  setPlantingForm,
  fertilizerForm,
  setFertilizerForm,
  harvestForm,
  setHarvestForm,
  isAddPlantingOpen,
  setIsAddPlantingOpen,
  isAddFertilizerOpen,
  setIsAddFertilizerOpen,
  isAddHarvestOpen,
  setIsAddHarvestOpen,
  isViewDialogOpen,
  setIsViewDialogOpen,
  isEditDialogOpen,
  setIsEditDialogOpen,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  selectedRecord,
  selectedRecordType,
  onAddPlanting,
  onAddFertilizer,
  onAddHarvest,
  onSaveEdit,
  onConfirmDelete,
}) => (
  <>
    <Dialog open={isAddPlantingOpen} onOpenChange={setIsAddPlantingOpen}>
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
                  {RICE_VARIETIES.map((variety) => (
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
          <Button variant="outline" onClick={() => setIsAddPlantingOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={onAddPlanting}
            className="bg-linear-to-r from-emerald-500 to-teal-600"
          >
            Save Record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={isAddFertilizerOpen} onOpenChange={setIsAddFertilizerOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            Add Fertilizer Record
          </DialogTitle>
          <DialogDescription>Record a fertilizer application</DialogDescription>
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
                  setFertilizerForm({ ...fertilizerForm, date: e.target.value })
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
                setFertilizerForm({ ...fertilizerForm, notes: e.target.value })
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
            onClick={onAddFertilizer}
            className="bg-linear-to-r from-blue-500 to-indigo-600"
          >
            Save Record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

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
                  {RICE_VARIETIES.map((variety) => (
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
          <Button variant="outline" onClick={() => setIsAddHarvestOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={onAddHarvest}
            className="bg-linear-to-r from-amber-500 to-orange-600"
          >
            Save Record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

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
                    <span className="text-muted-foreground text-sm">Date:</span>
                    <p className="font-medium">
                      {(selectedRecord as PlantingRecord).date}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Area:</span>
                    <p className="font-medium">
                      {(selectedRecord as PlantingRecord).area} acres
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">
                      Seeds:
                    </span>
                    <p className="font-medium">
                      {(selectedRecord as PlantingRecord).seedQuantity} kg
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
                    <span className="text-muted-foreground text-sm">Type:</span>
                    <p className="font-medium">
                      {(selectedRecord as FertilizerRecord).type}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">
                      Quantity:
                    </span>
                    <p className="font-medium">
                      {(selectedRecord as FertilizerRecord).quantity} kg
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Date:</span>
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
                    <span className="text-muted-foreground text-sm">Cost:</span>
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
                    <span className="text-muted-foreground text-sm">Date:</span>
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
                      {(selectedRecord as HarvestRecord).yield.toLocaleString()}{" "}
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
                      {(selectedRecord as HarvestRecord).moisture} %
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
          <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

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
                  <Select
                    value={plantingForm.variety}
                    onValueChange={(v) =>
                      setPlantingForm({
                        ...plantingForm,
                        variety: v,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select variety" />
                    </SelectTrigger>
                    <SelectContent>
                      {RICE_VARIETIES.map((variety) => (
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
                  <Select
                    value={harvestForm.variety}
                    onValueChange={(v) =>
                      setHarvestForm({
                        ...harvestForm,
                        variety: v,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select variety" />
                    </SelectTrigger>
                    <SelectContent>
                      {RICE_VARIETIES.map((variety) => (
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
          <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={onSaveEdit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
            onClick={onConfirmDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
);

export default PaddyRecordsDialogs;

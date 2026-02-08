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
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Calendar,
  Sprout,
  Download,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Clock,
  CheckCircle2,
  Loader2,
  Wheat,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface PlantingRecord {
  id: string;
  field: string;
  variety: string;
  date: string;
  area: string;
  status: "Growing" | "Harvested" | "Preparing";
  progress: number;
  expectedHarvest: string;
  seedQuantity: string;
  notes?: string;
}

interface PlantingRecordsSectionProps {
  records: PlantingRecord[];
  loading: boolean;
  onAdd: () => void;
  onView: (record: PlantingRecord) => void;
  onEdit: (record: PlantingRecord) => void;
  onDelete: (record: PlantingRecord) => void;
}

const PlantingRecordsSection = ({
  records,
  loading,
  onAdd,
  onView,
  onEdit,
  onDelete,
}: PlantingRecordsSectionProps) => (
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
            onClick={onAdd}
            className="bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Record
          </Button>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading planting records...
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
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
                          record.status === "Growing" ? "default" : "secondary"
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
                    onClick={() => onView(record)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(record)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onDelete(record)}
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
                    {record.seedQuantity} kg
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Harvest:</span>
                  <span className="text-foreground font-medium">
                    {record.expectedHarvest}
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
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

export default PlantingRecordsSection;

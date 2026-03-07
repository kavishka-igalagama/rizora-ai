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
import {
  Plus,
  Calendar,
  Droplets,
  Download,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Wheat,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export interface HarvestRecord {
  id: string;
  field: string;
  date: string;
  yield: number;
  quality: "Grade A" | "Grade B" | "Grade C";
  revenue: number;
  pricePerKg: number;
  moisture: string;
  variety: string;
  soldTo?: string;
  notes?: string;
}

interface HarvestRecordsSectionProps {
  records: HarvestRecord[];
  loading: boolean;
  totalRevenue: number;
  onAdd: () => void;
  onView: (record: HarvestRecord) => void;
  onEdit: (record: HarvestRecord) => void;
  onDelete: (record: HarvestRecord) => void;
}

const HarvestRecordsSection = ({
  records,
  loading,
  totalRevenue,
  onAdd,
  onView,
  onEdit,
  onDelete,
}: HarvestRecordsSectionProps) => (
  <Card className="border-border">
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Wheat className="w-5 h-5 text-amber-500" />
            Harvest Records
          </CardTitle>
          <CardDescription>
            Track your yields, quality grades, and revenue
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
          <Button
            onClick={onAdd}
            className="bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 gap-2"
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
          Loading harvest records...
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <div
              key={record.id}
              className="p-5 rounded-xl bg-muted/50 hover:bg-muted transition-all border border-transparent hover:border-amber-500/20"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <Wheat className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-lg">
                      {record.field}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        className={
                          record.quality === "Grade A"
                            ? "bg-emerald-500"
                            : record.quality === "Grade B"
                              ? "bg-amber-500"
                              : "bg-orange-500"
                        }
                      >
                        {record.quality}
                      </Badge>
                      <Badge variant="outline">{record.variety}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      Rs {record.revenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      @ Rs {record.pricePerKg}/kg
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
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
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Harvested:</span>
                  <span className="text-foreground font-medium">
                    {record.date}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Wheat className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Yield:</span>
                  <span className="text-foreground font-medium">
                    {record.yield.toLocaleString()} kg
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Droplets className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Moisture:</span>
                  <span className="text-foreground font-medium">
                    {record.moisture}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-primary font-medium">Sold</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 p-5 rounded-xl bg-linear-to-r from-primary/10 to-emerald-500/10 border border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-primary to-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-medium text-foreground">
              Total Revenue
            </span>
          </div>
          <span className="text-2xl font-bold text-primary">
            Rs {totalRevenue.toLocaleString()}
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default HarvestRecordsSection;

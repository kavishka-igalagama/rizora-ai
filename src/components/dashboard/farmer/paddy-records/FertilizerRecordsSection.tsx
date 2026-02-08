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
  Droplets,
  Download,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Loader2,
} from "lucide-react";

export interface FertilizerRecord {
  id: string;
  field: string;
  type: string;
  quantity: string;
  date: string;
  cost: number;
  stage: string;
  method: string;
  notes?: string;
}

interface FertilizerRecordsSectionProps {
  records: FertilizerRecord[];
  loading: boolean;
  totalCost: number;
  onAdd: () => void;
  onView: (record: FertilizerRecord) => void;
  onEdit: (record: FertilizerRecord) => void;
  onDelete: (record: FertilizerRecord) => void;
}

const FertilizerRecordsSection = ({
  records,
  loading,
  totalCost,
  onAdd,
  onView,
  onEdit,
  onDelete,
}: FertilizerRecordsSectionProps) => (
  <Card className="border-border">
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            Fertilizer Application Records
          </CardTitle>
          <CardDescription>
            Monitor fertilizer usage, costs, and application schedules
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
          <Button
            onClick={onAdd}
            className="bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 gap-2"
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
          Loading fertilizer records...
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <div
              key={record.id}
              className="p-5 rounded-xl bg-muted/50 hover:bg-muted transition-all border border-transparent hover:border-blue-500/20"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Droplets className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {record.field}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {record.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-blue-600 border-blue-600/30"
                  >
                    {record.stage}
                  </Badge>
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

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="text-foreground font-medium">
                    {record.quantity}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="text-foreground font-medium">
                    {record.date}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Method:</span>
                  <span className="text-foreground font-medium">
                    {record.method}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Cost:</span>
                  <span className="text-primary font-bold">
                    Rs {record.cost.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 p-5 rounded-xl bg-linear-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-medium text-foreground">
              Total Fertilizer Cost
            </span>
          </div>
          <span className="text-2xl font-bold text-primary">
            Rs {totalCost.toLocaleString()}
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default FertilizerRecordsSection;

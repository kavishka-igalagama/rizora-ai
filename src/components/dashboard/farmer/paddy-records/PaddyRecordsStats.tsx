import type { FC } from "react";
import {
  Droplets,
  MapPin,
  Sprout,
  TrendingUp,
  DollarSign,
  Wheat,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PaddyRecordsStatsProps {
  totalArea: number;
  activeFields: number;
  totalYield: number;
  totalRevenue: number;
  totalFertilizerCost: number;
  netProfit: number;
}

const PaddyRecordsStats: FC<PaddyRecordsStatsProps> = ({
  totalArea,
  activeFields,
  totalYield,
  totalRevenue,
  totalFertilizerCost,
  netProfit,
}) => (
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
              {totalArea.toFixed(1)} acres
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
            <p className="text-xs text-muted-foreground">Active Fields</p>
            <p className="text-xl font-bold text-foreground">{activeFields}</p>
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
              {totalYield.toLocaleString()} kg
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
              Rs{totalRevenue.toLocaleString()}
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
              Rs{totalFertilizerCost.toLocaleString()}
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
              Rs {netProfit.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default PaddyRecordsStats;

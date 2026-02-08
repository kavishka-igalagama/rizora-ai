import type { FC } from "react";
import { PieChart } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProductionSummaryCardProps {
  totalSeeds: number;
  avgYieldPerAcre: number;
  varietiesCount: number;
  harvestedFields: number;
  growingFields: number;
}

const ProductionSummaryCard: FC<ProductionSummaryCardProps> = ({
  totalSeeds,
  avgYieldPerAcre,
  varietiesCount,
  harvestedFields,
  growingFields,
}) => (
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
            {totalSeeds} kg
          </p>
          <p className="text-sm text-muted-foreground">Total Seeds Used</p>
        </div>
        <div className="text-center p-4 rounded-xl bg-background/50">
          <p className="text-3xl font-bold text-foreground mb-1">
            {avgYieldPerAcre.toFixed(0)} kg
          </p>
          <p className="text-sm text-muted-foreground">Avg. Yield/Acre</p>
        </div>
        <div className="text-center p-4 rounded-xl bg-background/50">
          <p className="text-3xl font-bold text-foreground mb-1">
            {varietiesCount}
          </p>
          <p className="text-sm text-muted-foreground">Rice Varieties</p>
        </div>
        <div className="text-center p-4 rounded-xl bg-background/50">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-xl font-bold text-primary">
              {harvestedFields}
            </span>
            <span className="text-muted-foreground">/</span>
            <span className="text-xl font-bold text-amber-500">
              {growingFields}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Harvested / Growing</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default ProductionSummaryCard;

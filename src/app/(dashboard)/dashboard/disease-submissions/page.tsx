"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Microscope,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Calendar,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import Loading from "@/components/loading";

type SubmissionStatus = "pending" | "reviewed" | "escalated";

interface Submission {
  id: string;
  farmerName: string;
  farmerPhone: string;
  region: string;
  district: string;
  disease: string;
  confidence: number;
  date: string;
  time: string;
  status: SubmissionStatus;
  imageUrl: string;
  notes?: string;
}

type SubmissionsResponse = {
  submissions: Submission[];
  total: number;
  generatedAt: string;
};

const statusBadge = (status: SubmissionStatus) => {
  switch (status) {
    case "pending":
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="w-3 h-3" />
          Pending
        </Badge>
      );
    case "reviewed":
      return (
        <Badge className="gap-1 bg-primary">
          <CheckCircle2 className="w-3 h-3" />
          Reviewed
        </Badge>
      );
    case "escalated":
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="w-3 h-3" />
          Escalated
        </Badge>
      );
  }
};

const confidenceColor = (c: number) =>
  c >= 90 ? "text-primary" : c >= 75 ? "text-amber-600" : "text-destructive";

const formatSubmissionId = (id: string) => {
  const cleaned = id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (!cleaned) return "#N/A";
  return `#${cleaned.slice(-6)}`;
};

const DiseaseSubmissionsPage = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<string>("all");
  const [disease, setDisease] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [confidence, setConfidence] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");
  const [selected, setSelected] = useState<Submission | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const regions = useMemo(
    () => [...new Set(submissions.map((item) => item.region))].sort(),
    [submissions],
  );

  const diseases = useMemo(
    () => [...new Set(submissions.map((item) => item.disease))].sort(),
    [submissions],
  );

  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/officer/disease-submissions", {
        method: "GET",
        cache: "no-store",
      });

      const data = (await response.json()) as
        | SubmissionsResponse
        | { error?: string };

      if (!response.ok || !("submissions" in data)) {
        const message = "error" in data ? data.error : undefined;
        throw new Error(message || "Failed to load disease submissions.");
      }

      setSubmissions(data.submissions);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load disease submissions.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSubmissions();
  }, [fetchSubmissions]);

  const filtered = useMemo(() => {
    const now = new Date();
    return submissions.filter((s) => {
      if (region !== "all" && s.region !== region) return false;
      if (disease !== "all" && s.disease !== disease) return false;
      if (status !== "all" && s.status !== status) return false;
      if (confidence === "high" && s.confidence < 90) return false;
      if (confidence === "medium" && (s.confidence < 75 || s.confidence >= 90))
        return false;
      if (confidence === "low" && s.confidence >= 75) return false;
      if (dateRange !== "all") {
        const d = new Date(s.date);
        const days = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        if (dateRange === "today" && days > 1) return false;
        if (dateRange === "week" && days > 7) return false;
        if (dateRange === "month" && days > 30) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        if (
          !s.farmerName.toLowerCase().includes(q) &&
          !s.district.toLowerCase().includes(q) &&
          !s.id.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [submissions, region, disease, status, confidence, dateRange, search]);

  const stats = useMemo(
    () => ({
      total: submissions.length,
      pending: submissions.filter((s) => s.status === "pending").length,
      reviewed: submissions.filter((s) => s.status === "reviewed").length,
      escalated: submissions.filter((s) => s.status === "escalated").length,
    }),
    [submissions],
  );

  const patchSubmission = async (
    id: string,
    payload: { status?: SubmissionStatus; notes?: string },
  ) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/officer/disease-submissions", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, ...payload }),
      });

      const data = (await response.json()) as
        | { id: string; status: SubmissionStatus; notes: string }
        | { error?: string };

      if (!response.ok || !("id" in data)) {
        const message = "error" in data ? data.error : undefined;
        throw new Error(message || "Failed to update submission.");
      }

      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: data.status,
                notes: data.notes,
              }
            : item,
        ),
      );

      if (selected?.id === id) {
        setSelected({
          ...selected,
          status: data.status,
          notes: data.notes,
        });
      }

      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update submission.";
      toast.error(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateStatus = async (id: string, newStatus: SubmissionStatus) => {
    const ok = await patchSubmission(id, {
      status: newStatus,
      notes: noteDraft,
    });
    if (ok) {
      toast.success(`Marked as ${newStatus}`);
      setSelected(null);
      setNoteDraft("");
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 p-6 md:p-8 mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Microscope className="w-6 h-6 text-primary" />
              <h1 className="text-3xl font-display font-bold">
                Disease Submissions
              </h1>
            </div>
            <p className="text-muted-foreground">
              Monitor and review farmer disease detections across all regions
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Submissions",
              value: stats.total,
              icon: Microscope,
              color: "text-primary",
            },
            {
              label: "Pending Review",
              value: stats.pending,
              icon: Clock,
              color: "text-amber-600",
            },
            {
              label: "Reviewed",
              value: stats.reviewed,
              icon: CheckCircle2,
              color: "text-primary",
            },
            {
              label: "Escalated",
              value: stats.escalated,
              icon: AlertTriangle,
              color: "text-destructive",
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label}>
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      {s.label}
                    </p>
                    <p className="text-2xl font-bold mt-1">{s.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${s.color}`} />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search farmer, field, district, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regions.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={disease} onValueChange={setDisease}>
              <SelectTrigger>
                <SelectValue placeholder="Disease" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Diseases</SelectItem>
                {diseases.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={confidence} onValueChange={setConfidence}>
              <SelectTrigger>
                <SelectValue placeholder="Confidence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Confidence</SelectItem>
                <SelectItem value="high">High (≥90%)</SelectItem>
                <SelectItem value="medium">Medium (75-89%)</SelectItem>
                <SelectItem value="low">Low (&lt;75%)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Submissions ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submission ID</TableHead>
                    <TableHead>Farmer Name</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Disease</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-12 text-muted-foreground"
                      >
                        No submissions match your filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-xs">
                          {formatSubmissionId(s.id)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {s.farmerName}
                        </TableCell>
                        <TableCell>{s.region}</TableCell>
                        <TableCell>{s.disease}</TableCell>
                        <TableCell>
                          <span
                            className={`font-semibold ${confidenceColor(s.confidence)}`}
                          >
                            {s.confidence}%
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {s.date}
                        </TableCell>
                        <TableCell>{statusBadge(s.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelected(s);
                              setNoteDraft(s.notes ?? "");
                            }}
                            className="gap-1"
                          >
                            <Eye className="w-4 h-4" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Microscope className="w-5 h-5 text-primary" />
                  {formatSubmissionId(selected.id)} · {selected.disease}
                </DialogTitle>
                <DialogDescription>
                  Detection details and officer review
                </DialogDescription>
              </DialogHeader>

              <div className="grid md:grid-cols-2 gap-6 mt-2">
                <div>
                  <div className="relative rounded-lg overflow-hidden border bg-muted aspect-square flex items-center justify-center">
                    {selected.imageUrl ? (
                      <Image
                        src={selected.imageUrl}
                        alt={`Leaf for ${selected.id}`}
                        fill
                        sizes="(max-width: 768px) 90vw, 40vw"
                        className="object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Uploaded leaf image
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground tracking-wide">
                      Prediction
                    </p>
                    <p className="text-lg font-semibold">{selected.disease}</p>
                    <p
                      className={`text-sm font-medium ${confidenceColor(selected.confidence)}`}
                    >
                      {selected.confidence}% confidence
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {selected.date} · {selected.time}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    {selected.farmerName} · {selected.farmerPhone}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    {selected.district}, {selected.region}
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">
                      Status
                    </p>
                    {statusBadge(selected.status)}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium mb-2 block">
                  Officer Notes
                </label>
                <Textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Add review notes, recommendations, or escalation reasons..."
                  rows={3}
                />
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
                <Button
                  className="gap-1"
                  disabled={isSaving}
                  onClick={() => updateStatus(selected.id, "reviewed")}
                >
                  <CheckCircle2 className="w-4 h-4" /> Mark Reviewed
                </Button>
                <Button
                  variant="destructive"
                  className="gap-1"
                  disabled={isSaving}
                  onClick={() => updateStatus(selected.id, "escalated")}
                >
                  <AlertTriangle className="w-4 h-4" /> Escalate
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DiseaseSubmissionsPage;

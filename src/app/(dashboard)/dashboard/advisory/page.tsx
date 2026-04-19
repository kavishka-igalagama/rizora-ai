"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Megaphone,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAdvisories,
  createAdvisory,
  updateAdvisory,
  deleteAdvisory,
  type AdvisoryItem,
} from "@/lib/actions/officer/advisories";
import Loading from "@/components/loading";

interface Advisory {
  id: string;
  displayId: string;
  title: string;
  content: string;
  disease: string;
  published: boolean;
  publishedDate: string; // ISO yyyy-mm-dd
  author: string;
}

const toAdvisory = (item: AdvisoryItem): Advisory => ({
  id: item.id,
  displayId: item.displayId,
  title: item.title,
  content: item.content,
  disease: item.disease,
  published: item.published,
  publishedDate: item.publishedDate,
  author: item.author,
});

const DISEASES = [
  "General",
  "Brown Spot",
  "Leaf Blast",
  "Bacterial Blight",
  "Sheath Blight",
  "Tungro",
];

const emptyForm = (): Omit<Advisory, "id" | "displayId" | "author"> => ({
  title: "",
  content: "",
  disease: "General",
  published: false,
  publishedDate: new Date().toISOString().slice(0, 10),
});

export default function OfficerAdvisoryPage() {
  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // filters
  const [search, setSearch] = useState("");
  const [disease, setDisease] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());

  // delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchAdvisories = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getAdvisories();
      if (!result.success || !result.advisories) {
        throw new Error(result.error || "Failed to load advisories.");
      }

      setAdvisories(result.advisories.map(toAdvisory));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load advisories.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAdvisories();
  }, [fetchAdvisories]);

  const clearFilters = () => {
    setSearch("");
    setDisease("all");
    setDateFrom("");
    setDateTo("");
    setStatusFilter("all");
  };

  const filtered = useMemo(() => {
    return advisories.filter((a) => {
      if (
        search &&
        !a.title.toLowerCase().includes(search.toLowerCase()) &&
        !a.content.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (disease !== "all" && a.disease !== disease) return false;
      if (statusFilter === "published" && !a.published) return false;
      if (statusFilter === "draft" && a.published) return false;
      if (dateFrom && a.publishedDate < dateFrom) return false;
      if (dateTo && a.publishedDate > dateTo) return false;
      return true;
    });
  }, [advisories, search, disease, statusFilter, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const total = advisories.length;
    const published = advisories.filter((a) => a.published).length;
    const drafts = total - published;
    return { total, published, drafts };
  }, [advisories]);

  const hasActiveFilters =
    search || disease !== "all" || dateFrom || dateTo || statusFilter !== "all";

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (a: Advisory) => {
    setEditingId(a.id);
    setForm({
      title: a.title,
      content: a.content,
      disease: a.disease,
      published: a.published,
      publishedDate: a.publishedDate,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setIsSaving(true);
    try {
      const result = editingId
        ? await updateAdvisory({
            id: editingId,
            ...form,
          })
        : await createAdvisory(form);

      if (!result.success || !result.advisory) {
        throw new Error(result.error || "Failed to save advisory.");
      }

      const data = toAdvisory(result.advisory);

      if (editingId) {
        setAdvisories((prev) => prev.map((a) => (a.id === data.id ? data : a)));
        toast.success("Advisory updated");
      } else {
        setAdvisories((prev) => [data, ...prev]);
        toast.success("Advisory created");
      }

      setDialogOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save advisory.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const togglePublish = async (id: string) => {
    const advisory = advisories.find((a) => a.id === id);
    if (!advisory) return;

    const nextPublished = !advisory.published;
    const nextDate = nextPublished
      ? new Date().toISOString().slice(0, 10)
      : advisory.publishedDate;

    try {
      const result = await updateAdvisory({
        id,
        published: nextPublished,
        publishedDate: nextDate,
      });

      if (!result.success || !result.advisory) {
        throw new Error(result.error || "Failed to update status.");
      }

      const data = toAdvisory(result.advisory);

      setAdvisories((prev) => prev.map((a) => (a.id === data.id ? data : a)));
      toast.success("Status updated");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update status.";
      toast.error(message);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const result = await deleteAdvisory(deleteId);
      if (!result.success) {
        throw new Error(result.error || "Failed to delete advisory.");
      }

      setAdvisories((prev) => prev.filter((a) => a.id !== deleteId));
      toast.success("Advisory deleted");
      setDeleteId(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete advisory.";
      toast.error(message);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 p-6 md:p-8 space-y-6 mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-2">
              <Megaphone className="w-7 h-7 text-primary" />
              Advisory Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Create, edit, and publish farmer advisories across regions.
            </p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            New Advisory
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Published</p>
              <p className="text-2xl font-bold text-primary">
                {stats.published}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Drafts</p>
              <p className="text-2xl font-bold">{stats.drafts}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filters
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
              >
                Clear filters
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search title or content..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={disease} onValueChange={setDisease}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Disease" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Diseases</SelectItem>
                {DISEASES.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <div className="space-y-1 md:col-span-1 lg:col-start-1 lg:col-span-3">
              <Label className="text-xs text-muted-foreground">From</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1 md:col-span-1 lg:col-span-3">
              <Label className="text-xs text-muted-foreground">To</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Advisory History ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="whitespace-nowrap">Disease</TableHead>
                    <TableHead className="whitespace-nowrap">Date</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="text-right whitespace-nowrap">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-10"
                      >
                        No advisories match your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-mono text-xs align-middle">
                          {a.displayId}
                        </TableCell>
                        <TableCell className="align-middle">
                          <p className="font-medium max-w-sm truncate">
                            {a.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {a.author}
                          </p>
                        </TableCell>
                        <TableCell className="align-middle">
                          {a.disease}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground align-middle">
                          {a.publishedDate}
                        </TableCell>
                        <TableCell className="align-middle">
                          {a.published ? (
                            <Badge
                              className="bg-primary/15 text-primary"
                              variant="secondary"
                            >
                              Published
                            </Badge>
                          ) : (
                            <Badge variant="outline">Draft</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right align-middle">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => togglePublish(a.id)}
                              title={a.published ? "Unpublish" : "Publish"}
                            >
                              {a.published ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEdit(a)}
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeleteId(a.id)}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Advisory" : "Create New Advisory"}
            </DialogTitle>
            <DialogDescription>
              Provide clear, actionable information for farmers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Brown Spot outbreak in Anuradhapura"
                maxLength={120}
              />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Write the advisory message..."
                rows={5}
                maxLength={1000}
              />
            </div>
            <div>
              <Label>Disease</Label>
              <Select
                value={form.disease}
                onValueChange={(v) => setForm({ ...form, disease: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DISEASES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Published Date</Label>
                <Input
                  type="date"
                  value={form.publishedDate}
                  onChange={(e) =>
                    setForm({ ...form, publishedDate: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center justify-between border border-input rounded-md px-3 py-2 mt-6 md:mt-0 md:self-end">
                <Label htmlFor="pub-switch" className="cursor-pointer">
                  Publish immediately
                </Label>
                <Switch
                  id="pub-switch"
                  checked={form.published}
                  onCheckedChange={(c) => setForm({ ...form, published: c })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleSave()} disabled={isSaving}>
              {editingId ? "Save Changes" : "Create Advisory"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this advisory?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

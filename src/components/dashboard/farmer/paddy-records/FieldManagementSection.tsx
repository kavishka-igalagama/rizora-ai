"use client";

import { useState } from "react";
import {
  addNewField,
  updateField,
  deleteField,
} from "@/lib/actions/farmer/paddy-records";
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
  Edit,
  Trash2,
  Eye,
  Layers,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface Field {
  id: string | number;
  name: string;
  location: string;
  area: string;
  status: "Active" | "Fallow" | "Preparing";
  currentCrop?: string;
  soilType: string;
}

interface FieldManagementSectionProps {
  fields: Field[];
  setFields: React.Dispatch<React.SetStateAction<Field[]>>;
  fieldsLoading: boolean;
}

const SERVER_FIELD_MAP = (f: {
  _id: { toString?: () => string } | string;
  name: string;
  location: string;
  area: string;
  status: "Active" | "Fallow" | "Preparing";
  soilType: string;
  currentCrop?: string;
}): Field => ({
  id: typeof f._id === "string" ? f._id : (f._id?.toString?.() ?? ""),
  name: f.name,
  location: f.location,
  area: f.area,
  status: f.status,
  soilType: f.soilType,
  currentCrop: f.currentCrop,
});

const FieldManagementSection = ({
  fields,
  setFields,
  fieldsLoading,
}: FieldManagementSectionProps) => {
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [fieldForm, setFieldForm] = useState({
    name: "",
    location: "",
    area: "",
    soilType: "",
    status: "",
  });

  const resetFieldForm = () =>
    setFieldForm({
      name: "",
      location: "",
      area: "",
      soilType: "",
      status: "",
    });

  const handleAddField = async () => {
    const status = fieldForm.status as "Active" | "Fallow" | "Preparing";
    const res = await addNewField({
      name: fieldForm.name,
      location: fieldForm.location,
      area: fieldForm.area,
      status,
      soilType: fieldForm.soilType,
    });
    if (!res.success) {
      toast.error(res.error ?? "Failed to add field");
      return;
    }
    if (res.field) {
      setFields([
        SERVER_FIELD_MAP(res.field as Parameters<typeof SERVER_FIELD_MAP>[0]),
        ...fields,
      ]);
    }
    setIsAddFieldOpen(false);
    resetFieldForm();
    toast.success("Field added successfully!");
  };

  const handleViewField = (field: Field) => {
    setSelectedField(field);
    setIsViewDialogOpen(true);
  };

  const handleEditField = (field: Field) => {
    setSelectedField(field);
    setFieldForm({
      name: field.name,
      location: field.location,
      area: field.area,
      soilType: field.soilType,
      status: field.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedField) return;
    const res = await updateField(String(selectedField.id), {
      name: fieldForm.name,
      location: fieldForm.location,
      area: fieldForm.area,
      status: fieldForm.status as "Active" | "Fallow" | "Preparing",
      soilType: fieldForm.soilType,
    });
    if (!res.success) {
      toast.error(res.error ?? "Failed to update field");
      return;
    }
    if (res.field) {
      const f = res.field as Parameters<typeof SERVER_FIELD_MAP>[0];
      setFields(
        fields.map((fld) =>
          fld.id === selectedField.id ? SERVER_FIELD_MAP(f) : fld,
        ),
      );
    }
    setIsEditDialogOpen(false);
    setSelectedField(null);
    resetFieldForm();
    toast.success("Record updated successfully!");
  };

  const handleDeleteField = (field: Field) => {
    setSelectedField(field);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedField) return;
    const res = await deleteField(String(selectedField.id));
    if (!res.success) {
      toast.error(res.error ?? "Failed to delete field");
      return;
    }
    setFields(fields.filter((f) => f.id !== selectedField.id));
    setIsDeleteDialogOpen(false);
    setSelectedField(null);
    toast.success("Record deleted successfully!");
  };

  return (
    <>
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-violet-500" />
                Field Management
              </CardTitle>
              <CardDescription>
                Manage your farm fields and their details
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsAddFieldOpen(true)}
              className="bg-linear-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Field
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {fieldsLoading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading fields...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fields.map((field) => (
                <Card
                  key={field.id}
                  className="border-border bg-muted/30 hover:bg-muted/50 transition-all"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-lg flex items-center justify-center",
                            field.status === "Active"
                              ? "bg-linear-to-br from-emerald-500 to-teal-600"
                              : field.status === "Fallow"
                                ? "bg-linear-to-br from-amber-500 to-orange-600"
                                : "bg-linear-to-br from-blue-500 to-indigo-600",
                          )}
                        >
                          <Layers className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {field.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {field.location}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          field.status === "Active"
                            ? "default"
                            : field.status === "Fallow"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {field.status}
                      </Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Area:</span>
                        <span className="font-medium">{field.area} acres</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Soil Type:
                        </span>
                        <span className="font-medium">{field.soilType}</span>
                      </div>
                      {field.currentCrop && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Current Crop:
                          </span>
                          <Badge variant="outline">{field.currentCrop}</Badge>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewField(field)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditField(field)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteField(field)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Field Dialog */}
      <Dialog open={isAddFieldOpen} onOpenChange={setIsAddFieldOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-violet-500" />
              Add New Field
            </DialogTitle>
            <DialogDescription>Add a new field to your farm</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Field Name</Label>
                <Input
                  placeholder="e.g., Field E"
                  value={fieldForm.name}
                  onChange={(e) =>
                    setFieldForm({ ...fieldForm, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  placeholder="e.g., Anuradhapura"
                  value={fieldForm.location}
                  onChange={(e) =>
                    setFieldForm({ ...fieldForm, location: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Area</Label>
                <Input
                  placeholder="e.g., 2.5 acres"
                  value={fieldForm.area}
                  onChange={(e) =>
                    setFieldForm({ ...fieldForm, area: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Soil Type</Label>
                <Select
                  value={fieldForm.soilType}
                  onValueChange={(v) =>
                    setFieldForm({ ...fieldForm, soilType: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select soil type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Clay">Clay</SelectItem>
                    <SelectItem value="Clay Loam">Clay Loam</SelectItem>
                    <SelectItem value="Loam">Loam</SelectItem>
                    <SelectItem value="Sandy Loam">Sandy Loam</SelectItem>
                    <SelectItem value="Sandy">Sandy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={fieldForm.status}
                onValueChange={(v) => setFieldForm({ ...fieldForm, status: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Fallow">Fallow</SelectItem>
                  <SelectItem value="Preparing">Preparing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddFieldOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddField}
              className="bg-linear-to-r from-violet-500 to-purple-600"
            >
              Save Field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Field Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Field Details</DialogTitle>
          </DialogHeader>
          {selectedField && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground text-sm">Name:</span>
                  <p className="font-medium">{selectedField.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">
                    Location:
                  </span>
                  <p className="font-medium">{selectedField.location}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Area:</span>
                  <p className="font-medium">{selectedField.area} acres</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">
                    Soil Type:
                  </span>
                  <p className="font-medium">{selectedField.soilType}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Status:</span>
                  <Badge>{selectedField.status}</Badge>
                </div>
                {selectedField.currentCrop && (
                  <div>
                    <span className="text-muted-foreground text-sm">
                      Current Crop:
                    </span>
                    <p className="font-medium">{selectedField.currentCrop}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Field Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Field</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Field Name</Label>
                <Input
                  value={fieldForm.name}
                  onChange={(e) =>
                    setFieldForm({ ...fieldForm, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={fieldForm.location}
                  onChange={(e) =>
                    setFieldForm({ ...fieldForm, location: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Area</Label>
                <Input
                  value={fieldForm.area}
                  onChange={(e) =>
                    setFieldForm({ ...fieldForm, area: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Soil Type</Label>
                <Select
                  value={fieldForm.soilType}
                  onValueChange={(v) =>
                    setFieldForm({ ...fieldForm, soilType: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select soil type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Clay">Clay</SelectItem>
                    <SelectItem value="Clay Loam">Clay Loam</SelectItem>
                    <SelectItem value="Loam">Loam</SelectItem>
                    <SelectItem value="Sandy Loam">Sandy Loam</SelectItem>
                    <SelectItem value="Sandy">Sandy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={fieldForm.status}
                onValueChange={(v) => setFieldForm({ ...fieldForm, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Fallow">Fallow</SelectItem>
                  <SelectItem value="Preparing">Preparing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Field Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Delete Field
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this field? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FieldManagementSection;

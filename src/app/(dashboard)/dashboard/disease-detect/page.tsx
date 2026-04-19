"use client";

import { useEffect, useState, type ChangeEvent, type DragEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bug,
  CheckCircle2,
  Clock3,
  Droplets,
  Leaf,
  RefreshCcw,
  Upload,
  Camera,
  AlertCircle,
  Info,
  Loader2,
  Microscope,
  Eye,
  Sparkles,
  Trash2,
  Zap,
  History,
  Download,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";

interface DetectionResult {
  disease: string;
  confidence: number;
  treatmentSuggestions: string[];
}

interface ScanHistoryItem {
  _id: string;
  disease: string;
  confidence: number;
  treatmentSuggestions: string[];
  imageUrl: string;
  createdAt: string;
  officerNotes?: string;
  scanStatus?: "pending" | "reviewed" | "escalated";
}

interface FarmerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  district: string;
}

interface CommonDisease {
  name: string;
  type: "Bacterial" | "Fungal" | "Viral";
  description: string;
  icon: LucideIcon;
  iconColorClass: string;
}

const MAX_UPLOAD_DIMENSION = 512;
const COMPRESSED_QUALITY = 0.82;

const COMMON_RICE_DISEASES: CommonDisease[] = [
  {
    name: "Rice Bacterial Blight",
    type: "Bacterial",
    description:
      "Water-soaked lesions along leaf edges that later turn yellow-white and dry out.",
    icon: Droplets,
    iconColorClass: "from-blue-500 to-cyan-600",
  },
  {
    name: "Rice Brown Spots",
    type: "Fungal",
    description:
      "Brown oval lesions with gray centers, often reducing photosynthesis and grain quality.",
    icon: Bug,
    iconColorClass: "from-amber-500 to-orange-600",
  },
  {
    name: "Rice Leaf Blast",
    type: "Fungal",
    description:
      "Diamond-shaped spots that can rapidly spread and damage large areas of leaf tissue.",
    icon: Zap,
    iconColorClass: "from-rose-500 to-red-600",
  },
  {
    name: "Rice Leaf Scaled",
    type: "Fungal",
    description:
      "Scale-like lesions on leaves that weaken plant vigor when infection becomes severe.",
    icon: Leaf,
    iconColorClass: "from-lime-500 to-green-600",
  },
  {
    name: "Rice Leaf Smut",
    type: "Fungal",
    description:
      "Small dark smut lesions on leaf blades that may merge under humid field conditions.",
    icon: Bug,
    iconColorClass: "from-fuchsia-500 to-pink-600",
  },
  {
    name: "Rice Sheath Blight",
    type: "Fungal",
    description:
      "Oval green-gray lesions on leaf sheaths that can move upward and reduce yield.",
    icon: Leaf,
    iconColorClass: "from-emerald-500 to-teal-600",
  },
  {
    name: "Rice Tungro",
    type: "Viral",
    description:
      "Yellow-orange leaf discoloration with stunted growth, commonly spread by leafhoppers.",
    icon: AlertCircle,
    iconColorClass: "from-violet-500 to-purple-600",
  },
];

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read image."));
    reader.readAsDataURL(file);
  });

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image."));
    img.src = src;
  });

const canvasToJpegBlob = (
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to compress image."));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read image blob."));
    reader.readAsDataURL(blob);
  });

const getImageDataUrl = async (source: string): Promise<string> => {
  if (source.startsWith("data:image")) {
    return source;
  }

  const response = await fetch(source);
  if (!response.ok) {
    throw new Error("Failed to load disease image for PDF report.");
  }

  const blob = await response.blob();
  return blobToDataUrl(blob);
};

const getSafeReportFileName = (disease: string) => {
  const normalizedDisease = disease
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const stamp = new Date().toISOString().slice(0, 10);
  return `rizora-disease-report-${normalizedDisease || "scan"}-${stamp}.pdf`;
};

const getScanStatusBadge = (
  status: ScanHistoryItem["scanStatus"],
  hasOfficerNotes: boolean,
) => {
  if (status === "escalated") {
    return <Badge variant="destructive">Escalated</Badge>;
  }

  if (status === "reviewed") {
    return <Badge className="bg-primary text-white">Reviewed</Badge>;
  }

  if (hasOfficerNotes) {
    return <Badge variant="secondary">Officer Note Added</Badge>;
  }

  return <Badge variant="outline">Pending Review</Badge>;
};

const DiseaseDetection = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [detectionResult, setDetectionResult] =
    useState<DetectionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] =
    useState<ScanHistoryItem | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [scanToDeleteId, setScanToDeleteId] = useState<string | null>(null);
  const [isDeletingScan, setIsDeletingScan] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [farmerInfo, setFarmerInfo] = useState<FarmerInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    district: "",
  });

  const loadScanHistory = async () => {
    setIsHistoryLoading(true);
    setHistoryError(null);

    try {
      const response = await fetch("/api/disease-detect", {
        method: "GET",
        cache: "no-store",
      });

      const data = (await response.json()) as
        | {
            history: ScanHistoryItem[];
            farmerInfo?: Partial<FarmerInfo>;
          }
        | { error?: string };

      if (!response.ok || !("history" in data)) {
        const apiError = "error" in data ? data.error : undefined;
        throw new Error(apiError || "Failed to fetch scan history.");
      }

      setScanHistory(data.history);
      setFarmerInfo({
        firstName: data.farmerInfo?.firstName || "",
        lastName: data.farmerInfo?.lastName || "",
        email: data.farmerInfo?.email || "",
        phone: data.farmerInfo?.phone || "",
        district: data.farmerInfo?.district || "",
      });
    } catch (error) {
      setHistoryError(
        error instanceof Error
          ? error.message
          : "Failed to fetch scan history.",
      );
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    void loadScanHistory();
  }, []);

  const isHealthyDetection = (disease: string) =>
    disease.toLowerCase().includes("healthy");

  const getDetectionBadgeLabel = (disease: string) =>
    isHealthyDetection(disease) ? "Healthy" : "Detected";

  const getDetectionBadgeClass = (disease: string) =>
    isHealthyDetection(disease)
      ? "bg-primary text-white"
      : "bg-amber-600 text-white";

  const getTreatmentSectionTitle = (disease: string) =>
    isHealthyDetection(disease) ? "Healthy Plant Care Tips" : "Treatment Plan";

  const getTreatmentSectionDescription = (disease: string) =>
    isHealthyDetection(disease)
      ? "Keep your plant healthy with these practical next steps."
      : "Follow these suggestions to reduce disease spread and recover plant health.";

  const preprocessImage = async (file: File) => {
    const dataUrl = await readFileAsDataUrl(file);
    const image = await loadImage(dataUrl);

    const longestSide = Math.max(image.width, image.height);
    const scale =
      longestSide > MAX_UPLOAD_DIMENSION
        ? MAX_UPLOAD_DIMENSION / longestSide
        : 1;

    const targetWidth = Math.max(1, Math.round(image.width * scale));
    const targetHeight = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to prepare image for scanning.");
    }

    ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

    const blob = await canvasToJpegBlob(canvas, COMPRESSED_QUALITY);
    const processedFile = new File([blob], "scan.jpg", { type: "image/jpeg" });
    const previewDataUrl = canvas.toDataURL("image/jpeg", 0.9);

    return {
      processedFile,
      previewDataUrl,
    };
  };

  const setSelectedImage = async (file: File) => {
    try {
      const { processedFile, previewDataUrl } = await preprocessImage(file);
      setSelectedFile(processedFile);
      setUploadedImage(previewDataUrl);
      setDetectionResult(null);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to prepare image.",
      );
    }
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void setSelectedImage(file);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      void setSelectedImage(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setErrorMessage("Please upload an image first.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisProgress(0);

    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/disease-detect", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as
        | {
            disease: string;
            confidence: number;
            treatmentSuggestions: string[];
          }
        | { error?: string };

      if (!response.ok || !("disease" in data)) {
        const apiError = "error" in data ? data.error : undefined;
        throw new Error(apiError || "Failed to analyze image.");
      }

      setDetectionResult({
        disease: data.disease,
        confidence: data.confidence,
        treatmentSuggestions: data.treatmentSuggestions,
      });
      void loadScanHistory();
    } catch (error) {
      setDetectionResult(null);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to analyze image.",
      );
    } finally {
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      setIsAnalyzing(false);
    }
  };

  const handleDeleteScan = async (scanId: string) => {
    setIsDeletingScan(true);

    try {
      const response = await fetch(
        `/api/disease-detect?scanId=${encodeURIComponent(scanId)}`,
        {
          method: "DELETE",
        },
      );

      const data = (await response.json()) as
        | { success: boolean }
        | { error?: string };

      if (!response.ok || !("success" in data && data.success)) {
        const apiError = "error" in data ? data.error : undefined;
        throw new Error(apiError || "Failed to delete scan.");
      }

      setScanHistory((prev) => prev.filter((item) => item._id !== scanId));

      setSelectedHistoryItem((prev) => {
        if (!prev || prev._id !== scanId) {
          return prev;
        }
        setIsViewDialogOpen(false);
        return null;
      });
    } catch (error) {
      setHistoryError(
        error instanceof Error ? error.message : "Failed to delete scan.",
      );
    } finally {
      setIsDeletingScan(false);
    }
  };

  const handleConfirmDeleteScan = async () => {
    if (!scanToDeleteId) {
      return;
    }

    await handleDeleteScan(scanToDeleteId);
    setIsDeleteDialogOpen(false);
    setScanToDeleteId(null);
  };

  const handleExportPdf = async (payload: {
    disease: string;
    confidence: number;
    treatmentSuggestions: string[];
    imageSource: string;
    createdAt?: string;
  }) => {
    const fullName = `${farmerInfo.firstName} ${farmerInfo.lastName}`.trim();
    if (!fullName) {
      setErrorMessage(
        "Farmer name is missing. Please complete onboarding profile.",
      );
      return;
    }

    if (
      !farmerInfo.email.trim() ||
      !farmerInfo.phone.trim() ||
      !farmerInfo.district.trim()
    ) {
      setErrorMessage(
        "Email, phone number, or district is missing in your profile.",
      );
      return;
    }

    setIsExportingPdf(true);
    setErrorMessage(null);

    try {
      const [{ jsPDF }, imageDataUrl] = await Promise.all([
        import("jspdf"),
        getImageDataUrl(payload.imageSource),
      ]);

      const doc = new jsPDF({
        unit: "pt",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      const contentWidth = pageWidth - margin * 2;

      doc.setFillColor(8, 111, 84);
      doc.roundedRect(margin, 28, contentWidth, 82, 12, 12, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("Rizora Disease Detection Report", margin + 20, 60);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(
        `Generated: ${new Date(payload.createdAt || Date.now()).toLocaleString()}`,
        margin + 20,
        84,
      );

      doc.setTextColor(28, 35, 43);
      doc.setFillColor(245, 249, 247);
      doc.roundedRect(margin, 130, contentWidth, 92, 10, 10, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Farmer Information", margin + 16, 154);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Name: ${fullName}`, margin + 16, 176);
      doc.text(`Email: ${farmerInfo.email}`, margin + 16, 194);
      doc.text(`Phone Number: ${farmerInfo.phone}`, margin + 320, 176);
      doc.text(`District: ${farmerInfo.district}`, margin + 320, 194);

      doc.setFillColor(252, 247, 235);
      doc.roundedRect(margin, 236, contentWidth, 94, 10, 10, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Detection Summary", margin + 16, 260);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Disease Name: ${payload.disease}`, margin + 16, 282);
      doc.text(
        `Confidence Level: ${payload.confidence.toFixed(2)}%`,
        margin + 16,
        302,
      );

      const imageSectionTop = 354;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Disease Image", margin, imageSectionTop);

      const imageBoxTop = imageSectionTop + 10;
      const imageBoxWidth = 220;
      const imageBoxHeight = 170;
      doc.setDrawColor(210, 217, 215);
      doc.roundedRect(margin, imageBoxTop, imageBoxWidth, imageBoxHeight, 8, 8);
      doc.addImage(
        imageDataUrl,
        "JPEG",
        margin + 8,
        imageBoxTop + 8,
        imageBoxWidth - 16,
        imageBoxHeight - 16,
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Treatments", margin + imageBoxWidth + 24, imageSectionTop);

      const treatments =
        payload.treatmentSuggestions.length > 0
          ? payload.treatmentSuggestions
          : ["No treatment suggestions available."];

      let treatmentCursorY = imageBoxTop + 20;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      const treatmentTextWidth = contentWidth - imageBoxWidth - 48;

      treatments.forEach((item, index) => {
        const wrapped = doc.splitTextToSize(
          `${index + 1}. ${item}`,
          treatmentTextWidth,
        );
        doc.text(wrapped, margin + imageBoxWidth + 24, treatmentCursorY);
        treatmentCursorY += wrapped.length * 14 + 6;
      });

      doc.setFont("helvetica", "italic");
      doc.setTextColor(90, 99, 107);
      doc.setFontSize(9);
      doc.text(
        "Note: This AI result is supportive guidance. Confirm final treatment with an agricultural officer.",
        margin,
        pageHeight - 28,
      );

      doc.save(getSafeReportFileName(payload.disease));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to generate PDF report.",
      );
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <Microscope className="w-5 h-5 text-white" />
            </div>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="w-3 h-3" />
              AI Powered
            </Badge>
          </div>
          <h1 className="font-display font-bold text-3xl text-foreground mb-2">
            AI Disease Detection
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Upload a clear image of your rice leaf to instantly detect diseases
            using our trained CNN deep learning model.
          </p>
        </div>

        <Alert className="mb-8 border-primary/30 bg-linear-to-r from-primary/5 to-emerald-500/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-foreground">
            <strong>📸 Tips for best results:</strong> Use good lighting, focus
            on the affected area, ensure the leaf fills most of the frame, and
            capture from 15-30cm distance.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="scan" className="space-y-6">
          <TabsList className="h-11 w-full max-w-md grid grid-cols-2 p-1">
            <TabsTrigger value="scan" className="gap-2">
              <Microscope className="h-4 w-4" />
              Scan Disease
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Clock3 className="h-4 w-4" />
              Scan History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scan">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="border-border shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>Upload Leaf Image</CardTitle>
                      <CardDescription>
                        Take a photo or upload an existing image
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div
                    className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-all hover:bg-primary/5 cursor-pointer"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {uploadedImage ? (
                      <div className="space-y-4">
                        <div className="relative">
                          <Image
                            src={uploadedImage}
                            alt="Uploaded leaf"
                            width={1200}
                            height={800}
                            unoptimized
                            className="w-full h-64 object-cover rounded-lg shadow-md"
                          />
                          {isAnalyzing && (
                            <div className="absolute inset-0 rounded-lg bg-background/65 backdrop-blur-xs p-4 flex flex-col justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center animate-pulse">
                                  <Sparkles className="h-5 w-5 text-primary" />
                                </div>
                                <div className="text-left">
                                  <p className="text-sm font-semibold text-foreground">
                                    AI is analyzing...
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    CNN model is processing your leaf image
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Progress
                                  value={Math.min(analysisProgress, 100)}
                                  className="h-2"
                                />
                                <div className="flex justify-between text-xs text-foreground/90">
                                  <span>Processing image...</span>
                                  <span>
                                    {Math.min(
                                      Math.round(analysisProgress),
                                      100,
                                    )}
                                    %
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <label htmlFor="file-upload">
                          <Button
                            variant="outline"
                            className="w-full cursor-pointer"
                            asChild
                          >
                            <span>
                              <Camera className="w-4 h-4 mr-2" />
                              Change Image
                            </span>
                          </Button>
                        </label>
                      </div>
                    ) : (
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer block"
                      >
                        <div className="space-y-4">
                          <div className="w-20 h-20 mx-auto rounded-full bg-linear-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center">
                            <Camera className="w-10 h-10 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground mb-1">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-sm text-muted-foreground">
                              PNG, JPG or JPEG (max. 10MB)
                            </p>
                          </div>
                        </div>
                      </label>
                    )}
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  {uploadedImage && !detectionResult && (
                    <Button
                      className="w-full h-12 text-base bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 cursor-pointer"
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Analyzing with CNN Model...
                        </>
                      ) : (
                        <>
                          <Microscope className="w-5 h-5 mr-2" />
                          Analyze Image
                        </>
                      )}
                    </Button>
                  )}

                  {errorMessage && (
                    <Alert variant="destructive">
                      <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {detectionResult ? (
                <Card className="border-border shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-linear-to-br from-amber-500 to-orange-600">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle>Detection Result</CardTitle>
                        <CardDescription>
                          Result Confidence:{" "}
                          {detectionResult.confidence.toFixed(2)}%
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-5 rounded-xl bg-linear-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                      <div className="flex items-center gap-3">
                        <Badge
                          className={getDetectionBadgeClass(
                            detectionResult.disease,
                          )}
                        >
                          {getDetectionBadgeLabel(detectionResult.disease)}
                        </Badge>
                        <h3 className="text-2xl font-bold text-foreground">
                          {detectionResult.disease}
                        </h3>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-muted/20 p-4 md:p-5">
                      <div className="mb-4">
                        <h4 className="font-semibold text-foreground">
                          {getTreatmentSectionTitle(detectionResult.disease)}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {getTreatmentSectionDescription(
                            detectionResult.disease,
                          )}
                        </p>
                      </div>

                      <div className="space-y-2.5">
                        {detectionResult.treatmentSuggestions.map(
                          (suggestion, index) => (
                            <div
                              key={suggestion}
                              className="flex items-start gap-3 rounded-lg border border-border/70 bg-background/80 p-3"
                            >
                              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                                {index + 1}
                              </div>
                              <p className="flex-1 text-sm text-foreground leading-relaxed">
                                {suggestion}
                              </p>
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        if (!uploadedImage) {
                          setErrorMessage(
                            "Upload image preview is required to export the report.",
                          );
                          return;
                        }

                        void handleExportPdf({
                          disease: detectionResult.disease,
                          confidence: detectionResult.confidence,
                          treatmentSuggestions:
                            detectionResult.treatmentSuggestions,
                          imageSource: uploadedImage,
                        });
                      }}
                      disabled={isExportingPdf}
                    >
                      {isExportingPdf ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Export as PDF
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border shadow-lg">
                  <CardHeader>
                    <CardTitle>Common Rice Diseases</CardTitle>
                    <CardDescription>
                      Diseases currently recognized by the model.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {COMMON_RICE_DISEASES.map((disease) => (
                        <div
                          key={disease.name}
                          className="rounded-xl border border-border bg-muted/40 p-3"
                        >
                          <div className="mb-2 flex items-start gap-2">
                            <div
                              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-linear-to-br ${disease.iconColorClass}`}
                            >
                              <disease.icon className="h-4 w-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex items-center justify-between gap-2">
                                <h4 className="text-sm font-semibold text-foreground leading-tight">
                                  {disease.name}
                                </h4>
                                <Badge
                                  variant="outline"
                                  className="text-2xs px-2 py-0"
                                >
                                  {disease.type}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {disease.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card className="border-border shadow-lg">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <History className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>Previous Scan History</CardTitle>
                      <CardDescription>
                        {scanHistory.length} records found
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void loadScanHistory()}
                      disabled={isHistoryLoading}
                    >
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isHistoryLoading ? (
                  <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading scan history...
                  </div>
                ) : historyError ? (
                  <Alert variant="destructive">
                    <AlertDescription>{historyError}</AlertDescription>
                  </Alert>
                ) : scanHistory.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                    No scan history yet. Start by scanning your first leaf
                    image.
                  </div>
                ) : (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40">
                          <TableHead className="w-30">Scan ID</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Disease</TableHead>
                          <TableHead>Officer Update</TableHead>
                          <TableHead className="w-55">Confidence</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scanHistory.map((scan) => (
                          <TableRow
                            key={scan._id}
                            className="hover:bg-muted/25"
                          >
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              #{scan._id.slice(-6).toUpperCase()}
                            </TableCell>
                            <TableCell>
                              <div className="inline-flex items-start gap-2">
                                <div className="leading-tight">
                                  <span className="block text-sm text-foreground">
                                    {new Date(
                                      scan.createdAt,
                                    ).toLocaleDateString()}
                                  </span>
                                  <span className="block text-xs text-muted-foreground">
                                    {new Date(
                                      scan.createdAt,
                                    ).toLocaleTimeString()}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={getDetectionBadgeClass(
                                    scan.disease,
                                  )}
                                >
                                  {getDetectionBadgeLabel(scan.disease)}
                                </Badge>
                                <span className="font-medium text-foreground">
                                  {scan.disease}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getScanStatusBadge(
                                scan.scanStatus,
                                Boolean(scan.officerNotes?.trim()),
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Progress
                                  value={Math.min(scan.confidence, 100)}
                                  className="h-2 w-28"
                                />
                                <span className="text-sm font-semibold text-foreground">
                                  {scan.confidence.toFixed(2)}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedHistoryItem(scan);
                                    setIsViewDialogOpen(true);
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Button>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => {
                                    setScanToDeleteId(scan._id);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  aria-label="Delete scan"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedHistoryItem && (
              <>
                <DialogHeader className="border-b border-border pb-4">
                  <DialogTitle className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Eye className="h-4 w-4" />
                    </span>
                    <span>Scan Details</span>
                    <Badge variant="outline" className="font-mono">
                      #{selectedHistoryItem._id.slice(-6).toUpperCase()}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>
                    <span className="block text-sm text-foreground">
                      {new Date(
                        selectedHistoryItem.createdAt,
                      ).toLocaleDateString()}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {new Date(
                        selectedHistoryItem.createdAt,
                      ).toLocaleTimeString()}
                    </span>
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 md:grid-cols-[1.15fr_1fr]">
                  <div className="relative min-h-72 overflow-hidden rounded-xl border border-border bg-muted/20">
                    <Image
                      src={selectedHistoryItem.imageUrl}
                      alt={selectedHistoryItem.disease}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <p className="mb-1 text-xs text-muted-foreground">
                        Disease
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          className={getDetectionBadgeClass(
                            selectedHistoryItem.disease,
                          )}
                        >
                          {getDetectionBadgeLabel(selectedHistoryItem.disease)}
                        </Badge>
                        <p className="font-semibold text-foreground">
                          {selectedHistoryItem.disease}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Confidence
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {selectedHistoryItem.confidence.toFixed(2)}%
                        </p>
                      </div>
                      <Progress
                        value={Math.min(selectedHistoryItem.confidence, 100)}
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <p className="mb-2 text-xs text-muted-foreground">
                    Officer Notes
                  </p>
                  {selectedHistoryItem.officerNotes?.trim() ? (
                    <div className="rounded-lg border border-primary/25 bg-linear-to-r from-primary/10 to-emerald-500/10 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        {getScanStatusBadge(
                          selectedHistoryItem.scanStatus,
                          true,
                        )}
                      </div>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {selectedHistoryItem.officerNotes}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Officer review note is not available yet. Please check
                      again later.
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <p className="mb-3 text-xs text-muted-foreground">
                    Treatment Suggestions
                  </p>
                  <div className="space-y-2.5">
                    {(selectedHistoryItem.treatmentSuggestions.length > 0
                      ? selectedHistoryItem.treatmentSuggestions
                      : ["No treatment suggestions available."]
                    ).map((suggestion, index) => (
                      <div
                        key={`${selectedHistoryItem._id}-${index}`}
                        className="flex items-start gap-3 rounded-lg border border-border/70 bg-background/80 p-3"
                      >
                        <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                          {index + 1}
                        </span>
                        <p className="text-sm text-foreground leading-relaxed">
                          {suggestion}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() =>
                    void handleExportPdf({
                      disease: selectedHistoryItem.disease,
                      confidence: selectedHistoryItem.confidence,
                      treatmentSuggestions:
                        selectedHistoryItem.treatmentSuggestions,
                      imageSource: selectedHistoryItem.imageUrl,
                      createdAt: selectedHistoryItem.createdAt,
                    })
                  }
                  disabled={isExportingPdf}
                >
                  {isExportingPdf ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export This Scan as PDF
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Delete Scan
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this scan? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeletingScan}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => void handleConfirmDeleteScan()}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeletingScan}
              >
                {isDeletingScan ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default DiseaseDetection;

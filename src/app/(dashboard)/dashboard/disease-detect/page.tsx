"use client";

import { useState, type ChangeEvent, type DragEvent } from "react";
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
import {
  Bug,
  Droplets,
  Leaf,
  Upload,
  Camera,
  AlertCircle,
  Info,
  Loader2,
  Microscope,
  Sparkles,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";

interface DetectionResult {
  disease: string;
  confidence: number;
  treatmentSuggestions: string[];
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

const DiseaseDetection = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [detectionResult, setDetectionResult] =
    useState<DetectionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
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
                                {Math.min(Math.round(analysisProgress), 100)}%
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
                  <label htmlFor="file-upload" className="cursor-pointer block">
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

          {/* Results Section */}
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
                      Result Confidence: {detectionResult.confidence.toFixed(2)}
                      %
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-5 rounded-xl bg-linear-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-amber-600 text-white">Detected</Badge>
                    <h3 className="text-2xl font-bold text-foreground">
                      {detectionResult.disease}
                    </h3>
                  </div>
                </div>

                <div className="rounded-xl border border-border p-4">
                  <h4 className="font-semibold text-foreground mb-2">
                    Treatment Suggestions
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                    {detectionResult.treatmentSuggestions.map((suggestion) => (
                      <li key={suggestion}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
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
      </main>
    </div>
  );
};

export default DiseaseDetection;

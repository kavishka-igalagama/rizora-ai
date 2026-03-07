"use client";

import Link from "next/link";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Leaf,
  Upload,
  Camera,
  CheckCircle,
  AlertCircle,
  Info,
  Loader2,
  Microscope,
  Shield,
  Droplets,
  Bug,
  ExternalLink,
  MessageSquare,
  Save,
  History,
  Sparkles,
  Zap,
  BookOpen,
} from "lucide-react";
import Image from "next/image";

interface DetectionResult {
  disease: string;
  confidence: number;
  type: string;
  description: string;
  symptoms: string[];
  pesticides: {
    name: string;
    dosage: string;
    application: string;
  }[];
  fertilizers: {
    name: string;
    purpose: string;
    quantity: string;
  }[];
  preventiveMeasures: string[];
  expertTips: {
    source: string;
    tip: string;
  }[];
}

const DiseaseDetection = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [detectionResult, setDetectionResult] =
    useState<DetectionResult | null>(null);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setDetectionResult(null);
      };
      reader.readAsDataURL(file);
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setDetectionResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
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

    setTimeout(() => {
      clearInterval(progressInterval);
      setAnalysisProgress(100);

      const diseases: DetectionResult[] = [
        {
          disease: "Brown Spot",
          confidence: 94.5,
          type: "Fungal Disease",
          description:
            "Brown spot is caused by the fungus Bipolaris oryzae. It affects leaves, causing brown lesions that reduce photosynthesis and overall plant health. Early detection is crucial for effective treatment.",
          symptoms: [
            "Brown oval spots with gray or white centers",
            "Yellow halo around spots",
            "Leaf discoloration and drying",
            "Spots on leaf sheaths and grains",
          ],
          pesticides: [
            {
              name: "Tricyclazole 75% WP",
              dosage: "0.6g per liter of water",
              application: "Spray on leaves every 10-14 days",
            },
            {
              name: "Mancozeb 75% WP",
              dosage: "2.5g per liter of water",
              application: "Preventive spray during tillering stage",
            },
            {
              name: "Propiconazole 25% EC",
              dosage: "1ml per liter of water",
              application: "Curative spray at disease onset",
            },
          ],
          fertilizers: [
            {
              name: "Potassium Chloride (MOP)",
              purpose: "Strengthens plant cell walls",
              quantity: "50 kg per hectare",
            },
            {
              name: "Zinc Sulphate",
              purpose: "Enhances disease resistance",
              quantity: "25 kg per hectare",
            },
          ],
          preventiveMeasures: [
            "Use certified disease-free seeds",
            "Maintain proper water management - avoid drought stress",
            "Apply balanced fertilization, avoid excess nitrogen",
            "Remove and destroy infected plant debris",
            "Practice crop rotation with non-host crops",
          ],
          expertTips: [
            {
              source: "Department of Agriculture, Sri Lanka",
              tip: "Seed treatment with fungicide before planting reduces infection by 60-70%",
            },
            {
              source: "Rice Research Institute, Batalagoda",
              tip: "Maintain field sanitation and proper drainage to reduce disease spread",
            },
          ],
        },
        {
          disease: "Leaf Blast",
          confidence: 91.2,
          type: "Fungal Disease",
          description:
            "Leaf blast is caused by Magnaporthe oryzae fungus. It is one of the most destructive rice diseases, capable of destroying entire crops if not controlled early.",
          symptoms: [
            "Diamond-shaped lesions with gray centers",
            "Brown margins on leaf spots",
            "Lesions may coalesce causing leaf death",
            "White to gray fungal growth in humid conditions",
          ],
          pesticides: [
            {
              name: "Tricyclazole 75% WP",
              dosage: "0.6g per liter of water",
              application: "Spray at disease onset, repeat after 7-10 days",
            },
            {
              name: "Isoprothiolane 40% EC",
              dosage: "1.5ml per liter of water",
              application: "Apply during active infection period",
            },
            {
              name: "Carbendazim 50% WP",
              dosage: "1g per liter of water",
              application: "Systemic spray for severe infections",
            },
          ],
          fertilizers: [
            {
              name: "Silica-based fertilizer",
              purpose: "Strengthens leaf cuticle against infection",
              quantity: "200 kg per hectare",
            },
            {
              name: "Balanced NPK (12-24-12)",
              purpose: "Avoid excess nitrogen which promotes disease",
              quantity: "As per soil test recommendation",
            },
          ],
          preventiveMeasures: [
            "Plant resistant varieties (BG 300, BG 352)",
            "Avoid excess nitrogen application",
            "Maintain proper plant spacing for air circulation",
            "Apply fungicides preventively during high-risk periods",
            "Monitor weather conditions - high humidity increases risk",
          ],
          expertTips: [
            {
              source: "Department of Agriculture, Sri Lanka",
              tip: "Apply silicon-based foliar sprays to increase leaf strength and resistance",
            },
            {
              source: "IRRI (International Rice Research Institute)",
              tip: "Early morning fungicide application is most effective when leaves are wet with dew",
            },
          ],
        },
        {
          disease: "Bacterial Blight",
          confidence: 88.7,
          type: "Bacterial Disease",
          description:
            "Bacterial blight is caused by Xanthomonas oryzae pv. oryzae. It spreads rapidly during monsoon season through wind-driven rain and contaminated irrigation water.",
          symptoms: [
            "Water-soaked lesions on leaf margins",
            "Yellow to white streaks along leaf veins",
            "Leaves turn grayish-green and roll up",
            "Bacterial ooze on leaf surfaces in humid conditions",
          ],
          pesticides: [
            {
              name: "Copper Hydroxide 77% WP",
              dosage: "2.5g per liter of water",
              application: "Spray at first symptom appearance",
            },
            {
              name: "Streptomycin Sulphate + Tetracycline",
              dosage: "0.5g per liter of water",
              application: "Apply during early infection stage",
            },
            {
              name: "Copper Oxychloride 50% WP",
              dosage: "3g per liter of water",
              application: "Preventive spray during wet weather",
            },
          ],
          fertilizers: [
            {
              name: "Potassium Sulphate",
              purpose: "Improves plant immunity",
              quantity: "40 kg per hectare",
            },
            {
              name: "Calcium Ammonium Nitrate",
              purpose: "Balanced nitrogen for plant health",
              quantity: "Based on soil test",
            },
          ],
          preventiveMeasures: [
            "Use disease-resistant varieties",
            "Avoid excessive nitrogen fertilization",
            "Ensure proper drainage in fields",
            "Avoid working in fields when plants are wet",
            "Remove infected plants and debris immediately",
            "Use clean, treated seeds for planting",
          ],
          expertTips: [
            {
              source: "Department of Agriculture, Sri Lanka",
              tip: "Drain excess water from fields during heavy rains to reduce bacterial spread",
            },
            {
              source: "Rice Research Development Institute",
              tip: "Copper-based bactericides are most effective when applied preventively before infection",
            },
          ],
        },
      ];

      const randomResult =
        diseases[Math.floor(Math.random() * diseases.length)];
      setDetectionResult(randomResult);
      setIsAnalyzing(false);
    }, 3500);
  };

  const recentScans = [
    {
      id: 1,
      date: "Jan 20, 2026",
      disease: "Healthy",
      confidence: 98,
      image: "🌿",
    },
    {
      id: 2,
      date: "Jan 18, 2026",
      disease: "Brown Spot",
      confidence: 94,
      image: "🍂",
    },
    {
      id: 3,
      date: "Jan 15, 2026",
      disease: "Leaf Blast",
      confidence: 92,
      image: "🍂",
    },
    {
      id: 4,
      date: "Jan 12, 2026",
      disease: "Healthy",
      confidence: 96,
      image: "🌿",
    },
  ];

  const commonDiseases = [
    {
      name: "Brown Spot",
      type: "Fungal",
      description:
        "Causes brown oval lesions on leaves, reducing photosynthesis",
      icon: Bug,
      color: "from-amber-500 to-orange-600",
    },
    {
      name: "Leaf Blast",
      type: "Fungal",
      description: "Diamond-shaped lesions that can destroy entire crops",
      icon: Zap,
      color: "from-red-500 to-rose-600",
    },
    {
      name: "Bacterial Blight",
      type: "Bacterial",
      description: "Water-soaked lesions causing rapid leaf death",
      icon: Droplets,
      color: "from-blue-500 to-cyan-600",
    },
  ];

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
                        className="w-full h-64 object-cover rounded-lg shadow-md"
                      />
                      {detectionResult && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-linear-to-r from-emerald-500 to-teal-600 text-white shadow-lg">
                            {detectionResult.confidence.toFixed(1)}% Confidence
                          </Badge>
                        </div>
                      )}
                    </div>
                    <label htmlFor="file-upload">
                      <Button variant="outline" className="w-full" asChild>
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
                  className="w-full h-12 text-base bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
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

              {isAnalyzing && (
                <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center animate-pulse">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        AI is analyzing your image...
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Using CNN deep learning model
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={Math.min(analysisProgress, 100)}
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Processing image...</span>
                    <span>{Math.min(Math.round(analysisProgress), 100)}%</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          {detectionResult ? (
            <Card className="border-border shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        detectionResult.disease === "Healthy"
                          ? "bg-linear-to-br from-green-500 to-emerald-600"
                          : "bg-linear-to-br from-amber-500 to-orange-600"
                      }`}
                    >
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>Detection Results</CardTitle>
                      <CardDescription>
                        Disease identified with{" "}
                        {detectionResult.confidence.toFixed(1)}% confidence
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-5 rounded-xl bg-linear-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-1">
                        {detectionResult.disease}
                      </h3>
                      <Badge
                        variant="outline"
                        className="text-amber-600 border-amber-600/30"
                      >
                        {detectionResult.type}
                      </Badge>
                    </div>
                    <div className="px-4 py-2 rounded-full bg-linear-to-r from-emerald-500 to-teal-600 text-white text-lg font-bold shadow-lg">
                      {detectionResult.confidence.toFixed(1)}%
                    </div>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {detectionResult.description}
                  </p>
                </div>

                <Tabs defaultValue="symptoms" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 h-auto">
                    <TabsTrigger value="symptoms" className="text-xs px-2 py-2">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Symptoms
                    </TabsTrigger>
                    <TabsTrigger
                      value="treatment"
                      className="text-xs px-2 py-2"
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      Treatment
                    </TabsTrigger>
                    <TabsTrigger
                      value="fertilizers"
                      className="text-xs px-2 py-2"
                    >
                      <Droplets className="w-3 h-3 mr-1" />
                      Fertilizers
                    </TabsTrigger>
                    <TabsTrigger value="tips" className="text-xs px-2 py-2">
                      <BookOpen className="w-3 h-3 mr-1" />
                      Expert Tips
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="symptoms" className="mt-4 space-y-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Detected Symptoms
                    </h4>
                    <ul className="space-y-2">
                      {detectionResult.symptoms.map((symptom, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 text-sm p-3 rounded-lg bg-muted/50"
                        >
                          <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                          <span className="text-foreground">{symptom}</span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>

                  <TabsContent value="treatment" className="mt-4 space-y-4">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      Recommended Pesticides
                    </h4>
                    <div className="space-y-3">
                      {detectionResult.pesticides.map((pesticide, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-lg bg-linear-to-r from-red-500/5 to-orange-500/5 border border-red-500/10"
                        >
                          <h5 className="font-semibold text-foreground mb-2">
                            {pesticide.name}
                          </h5>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Dosage:{" "}
                              </span>
                              <span className="text-foreground font-medium">
                                {pesticide.dosage}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Application:{" "}
                              </span>
                              <span className="text-foreground">
                                {pesticide.application}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <h4 className="font-semibold text-foreground flex items-center gap-2 pt-4">
                      <Bug className="w-4 h-4 text-primary" />
                      Preventive Measures
                    </h4>
                    <ul className="space-y-2">
                      {detectionResult.preventiveMeasures.map(
                        (measure, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm"
                          >
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-primary">
                                {index + 1}
                              </span>
                            </div>
                            <span className="text-foreground">{measure}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  </TabsContent>

                  <TabsContent value="fertilizers" className="mt-4 space-y-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-primary" />
                      Recommended Fertilizers
                    </h4>
                    <div className="space-y-3">
                      {detectionResult.fertilizers.map((fertilizer, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-lg bg-linear-to-r from-green-500/5 to-emerald-500/5 border border-green-500/10"
                        >
                          <h5 className="font-semibold text-foreground mb-2">
                            {fertilizer.name}
                          </h5>
                          <div className="text-sm space-y-1">
                            <p>
                              <span className="text-muted-foreground">
                                Purpose:{" "}
                              </span>
                              <span className="text-foreground">
                                {fertilizer.purpose}
                              </span>
                            </p>
                            <p>
                              <span className="text-muted-foreground">
                                Quantity:{" "}
                              </span>
                              <span className="text-foreground font-medium">
                                {fertilizer.quantity}
                              </span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="tips" className="mt-4 space-y-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      Expert Tips from Department of Agriculture
                    </h4>
                    <div className="space-y-3">
                      {detectionResult.expertTips.map((tip, index) => (
                        <Alert
                          key={index}
                          className="border-primary/30 bg-primary/5"
                        >
                          <Info className="h-4 w-4 text-primary" />
                          <AlertDescription>
                            <p className="text-foreground text-sm mb-2">
                              {tip.tip}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <ExternalLink className="w-3 h-3" />
                              <span>{tip.source}</span>
                            </div>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-3 pt-4">
                  <Button className="flex-1" asChild>
                    <Link href="/messages">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Ask Expert
                    </Link>
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Save Result
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Common Rice Diseases</CardTitle>
                    <CardDescription>
                      Diseases our CNN AI can detect
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {commonDiseases.map((disease, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all border border-transparent hover:border-primary/20"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-lg bg-linear-to-br ${disease.color} flex items-center justify-center shrink-0`}
                        >
                          <disease.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">
                              {disease.name}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {disease.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {disease.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Scans History */}
        <Card className="mt-8 border-border shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <History className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>Recent Scans</CardTitle>
                  <CardDescription>
                    Your disease detection history
                  </CardDescription>
                </div>
              </div>
              <Button variant="outline" asChild>
                <Link href="/scan-history">
                  <History className="w-4 h-4 mr-2" />
                  View All
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all cursor-pointer border border-transparent hover:border-primary/20"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-3xl">{scan.image}</div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {scan.disease}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {scan.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        scan.disease === "Healthy" ? "default" : "secondary"
                      }
                    >
                      {scan.disease === "Healthy" ? "Healthy" : "Detected"}
                    </Badge>
                    <span className="text-sm font-semibold text-primary">
                      {scan.confidence}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DiseaseDetection;

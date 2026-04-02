type InferenceResult = {
  disease: string;
  confidence: number;
};

const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

const TREATMENT_BY_DISEASE: Record<string, string[]> = {
  "Healthy Rice Leaves": [
    "No treatment required. Continue regular field monitoring.",
    "Maintain proper irrigation, balanced fertilization, and weed control.",
    "Follow good agricultural practices (GAP) to prevent disease occurrence.",
  ],

  "Rice Bacterial Blight": [
    "Remove and destroy severely infected plants to reduce spread.",
    "Avoid excessive nitrogen fertilizer; apply balanced NPK.",
    "Improve field drainage and avoid stagnant water.",
    "Apply copper-based bactericide only if recommended by an agricultural officer.",
  ],

  "Rice Brown Spots": [
    "Apply fungicides such as mancozeb or tricyclazole as per local recommendations.",
    "Improve soil fertility with adequate potassium and organic matter.",
    "Avoid drought stress and ensure proper water management.",
    "Use certified disease-free seeds.",
  ],

  "Rice Leaf Blast": [
    "Apply blast-specific fungicides (e.g., tricyclazole) at early stages.",
    "Avoid excessive nitrogen fertilizer application.",
    "Maintain proper plant spacing to reduce humidity.",
    "Use resistant rice varieties when available.",
  ],

  "Rice Leaf Scald": [
    "Remove infected plant debris after harvesting.",
    "Ensure good field aeration and avoid overcrowding.",
    "Apply recommended fungicides if disease severity increases.",
    "Practice crop rotation if possible.",
  ],

  "Rice Leaf Smut": [
    "Treat seeds with recommended fungicide before planting.",
    "Use certified and clean seeds.",
    "Avoid late planting and maintain proper field hygiene.",
    "Apply preventive fungicide if infection risk is high.",
  ],

  "Rice Sheath Blight": [
    "Reduce plant density and avoid excess nitrogen fertilizer.",
    "Maintain proper water levels and avoid prolonged flooding.",
    "Apply sheath blight fungicides (e.g., validamycin) when symptoms appear.",
    "Remove infected plant residues after harvest.",
  ],

  "Rice Tungro": [
    "Control insect vectors (especially green leafhoppers) using recommended insecticides.",
    "Remove and destroy infected plants early.",
    "Use tungro-resistant rice varieties.",
    "Synchronize planting within the area to reduce spread.",
    "Avoid staggered planting which increases vector population.",
  ],
};

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

async function runInference(image: File): Promise<InferenceResult> {
  const body = new FormData();
  body.append("image", image);

  let response: Response;
  try {
    response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: "POST",
      body,
    });
  } catch {
    throw new Error(
      `Could not reach ML service at ${ML_SERVICE_URL}. Start FastAPI first.`,
    );
  }

  const payload = (await response.json()) as
    | InferenceResult
    | { detail?: string; error?: string };

  if (!response.ok || !("disease" in payload)) {
    let message: string | undefined;
    if ("detail" in payload) {
      message = payload.detail;
    } else if ("error" in payload) {
      message = payload.error;
    }
    throw new Error(message || "Invalid inference response from ML service.");
  }

  if (typeof payload.confidence !== "number") {
    throw new Error("Invalid confidence value from ML service.");
  }

  return { disease: payload.disease, confidence: payload.confidence };
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return Response.json(
        { error: "Image file is required." },
        { status: 400 },
      );
    }

    if (!image.type.startsWith("image/")) {
      return Response.json(
        { error: "Only image files are allowed." },
        { status: 400 },
      );
    }

    if (image.size > MAX_IMAGE_SIZE_BYTES) {
      return Response.json(
        { error: "Image size must be 10MB or less." },
        { status: 400 },
      );
    }

    const result = await runInference(image);
    const treatmentSuggestions = TREATMENT_BY_DISEASE[result.disease] || [
      "Consult your local agricultural extension officer for targeted treatment.",
    ];

    return Response.json({
      ...result,
      treatmentSuggestions,
    });
  } catch (error) {
    console.error("[disease-detect] inference failed", error);

    const details =
      error instanceof Error && error.message
        ? error.message
        : "Unknown inference error.";

    return Response.json(
      {
        error: `Failed to run model inference. ${details}`,
      },
      { status: 500 },
    );
  }
}

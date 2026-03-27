type InferenceResult = {
  disease: string;
  confidence: number;
};

const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

const TREATMENT_BY_DISEASE: Record<string, string[]> = {
  "Healthy Rice Leaves": [
    "No treatment required. Continue regular monitoring.",
    "Maintain balanced fertilization and field sanitation.",
  ],
  "Rice Bacterial Blight": [
    "Remove heavily infected leaves and improve field drainage.",
    "Apply recommended copper-based bactericide with local agricultural guidance.",
  ],
  "Rice Brown Spots": [
    "Apply a suitable fungicide (e.g., tricyclazole or mancozeb) as advised locally.",
    "Avoid nutrient stress and ensure balanced potassium application.",
  ],
  "Rice Leaf Blast": [
    "Use blast-recommended fungicide early in infection.",
    "Avoid excessive nitrogen and maintain proper plant spacing.",
  ],
  "Rice Leaf Scaled": [
    "Remove infected debris and improve airflow in the field.",
    "Use recommended fungicide treatment under extension officer advice.",
  ],
  "Rice Leaf Smut": [
    "Treat seeds with approved fungicide before sowing.",
    "Apply preventive fungicide if symptoms spread rapidly.",
  ],
  "Rice Sheath Blight": [
    "Reduce dense canopy and excess nitrogen fertilization.",
    "Apply sheath blight-targeted fungicide as per local recommendation.",
  ],
  "Rice Tungro": [
    "Control vector insects and remove infected plants early.",
    "Use resistant varieties and synchronize planting where possible.",
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

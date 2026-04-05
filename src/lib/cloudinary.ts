import { createHash } from "node:crypto";

type CloudinaryUploadResult = {
  secureUrl: string;
  publicId: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
};

type CloudinaryUploadResponse = {
  secure_url: string;
  public_id: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  error?: { message?: string };
};

type CloudinaryDestroyResponse = {
  result?: "ok" | "not found";
  error?: { message?: string };
};

const DEFAULT_UPLOAD_FOLDER = "rizora-ai/disease-scans";

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  return { cloudName, apiKey, apiSecret };
}

function signCloudinaryParams(
  params: Record<string, string>,
  apiSecret: string,
) {
  const paramString = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1").update(`${paramString}${apiSecret}`).digest("hex");
}

export async function uploadImageToCloudinary(
  file: File,
  folder = DEFAULT_UPLOAD_FOLDER,
): Promise<CloudinaryUploadResult> {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = `${Math.floor(Date.now() / 1000)}`;

  const paramsToSign = {
    folder,
    timestamp,
  };

  const signature = signCloudinaryParams(paramsToSign, apiSecret);
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const arrayBuffer = await file.arrayBuffer();
  const blob = new Blob([arrayBuffer], {
    type: file.type || "application/octet-stream",
  });

  const body = new FormData();
  body.append("file", blob, file.name || "scan.jpg");
  body.append("api_key", apiKey);
  body.append("timestamp", timestamp);
  body.append("folder", folder);
  body.append("signature", signature);

  const response = await fetch(endpoint, {
    method: "POST",
    body,
  });

  const payload = (await response.json()) as CloudinaryUploadResponse;

  if (!response.ok || !payload.secure_url || !payload.public_id) {
    const errorMessage = payload.error?.message || "Cloudinary upload failed.";
    throw new Error(errorMessage);
  }

  return {
    secureUrl: payload.secure_url,
    publicId: payload.public_id,
    format: payload.format,
    bytes: payload.bytes,
    width: payload.width,
    height: payload.height,
  };
}

export async function deleteImageFromCloudinary(publicId: string) {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = `${Math.floor(Date.now() / 1000)}`;

  const signature = signCloudinaryParams(
    {
      public_id: publicId,
      timestamp,
    },
    apiSecret,
  );

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;
  const body = new FormData();
  body.append("public_id", publicId);
  body.append("api_key", apiKey);
  body.append("timestamp", timestamp);
  body.append("signature", signature);

  const response = await fetch(endpoint, {
    method: "POST",
    body,
  });

  const payload = (await response.json()) as CloudinaryDestroyResponse;

  if (!response.ok) {
    const errorMessage = payload.error?.message || "Cloudinary delete failed.";
    throw new Error(errorMessage);
  }

  return payload.result;
}

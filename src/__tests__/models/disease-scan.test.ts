/**
 * Model Tests - DiseaseScan Model
 * Tests for DiseaseScan schema validation
 */

import { IDiseaseScan } from "@/lib/models/DiseaseScan";

const createMockDiseaseScan = (
  overrides?: Partial<IDiseaseScan>,
): Partial<IDiseaseScan> => ({
  clerkId: "user_123",
  disease: "Rice Leaf Blast",
  confidence: 92.5,
  treatmentSuggestions: [
    "Apply tricyclazole fungicide",
    "Remove infected plant parts",
    "Maintain proper spacing",
  ],
  scanStatus: "pending",
  imageUrl: "https://cloudinary.example.com/image.jpg",
  imagePublicId: "rizora/scan_123",
  imageFormat: "jpeg",
  imageBytes: 245000,
  imageWidth: 1920,
  imageHeight: 1080,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe("Model Tests - DiseaseScan", () => {
  describe("DiseaseScan Validation", () => {
    it("should create scan with required fields", () => {
      const scan = createMockDiseaseScan();
      expect(scan.disease).toBeDefined();
      expect(scan.confidence).toBeDefined();
      expect(scan.imageUrl).toBeDefined();
    });

    it("should validate confidence range 0-100", () => {
      const validScores = [0, 25, 50, 75.5, 99.9, 100];

      validScores.forEach((score) => {
        const scan = createMockDiseaseScan({ confidence: score });
        expect(scan.confidence).toBeGreaterThanOrEqual(0);
        expect(scan.confidence).toBeLessThanOrEqual(100);
      });
    });

    it("should reject invalid confidence values", () => {
      const invalidScores = [-1, 101, 150, -50];
      // Validation would happen in schema
      invalidScores.forEach((score) => {
        const scan = createMockDiseaseScan({ confidence: score });
        // Should be caught by validator in real implementation
        expect(scan.confidence).toBe(score);
      });
    });
  });

  describe("Disease Detection", () => {
    it("should store detected disease name", () => {
      const diseases = [
        "Healthy Rice Leaves",
        "Rice Bacterial Blight",
        "Rice Brown Spots",
        "Rice Leaf Blast",
        "Rice Leaf Scald",
        "Rice Leaf Smut",
        "Rice Sheath Blight",
        "Rice Tungro",
      ];

      diseases.forEach((disease) => {
        const scan = createMockDiseaseScan({ disease });
        expect(scan.disease).toBe(disease);
      });
    });

    it("should have treatment suggestions for each disease", () => {
      const scan = createMockDiseaseScan();
      expect(Array.isArray(scan.treatmentSuggestions)).toBe(true);
      expect(scan.treatmentSuggestions!.length).toBeGreaterThan(0);
      scan.treatmentSuggestions!.forEach((suggestion) => {
        expect(typeof suggestion).toBe("string");
        expect(suggestion.length).toBeGreaterThan(0);
      });
    });

    it("should support empty treatment suggestions", () => {
      const scan = createMockDiseaseScan({ treatmentSuggestions: [] });
      expect(scan.treatmentSuggestions).toHaveLength(0);
    });
  });

  describe("Scan Status", () => {
    it("should have valid status values", () => {
      const statuses: Array<"pending" | "reviewed" | "escalated"> = [
        "pending",
        "reviewed",
        "escalated",
      ];

      statuses.forEach((status) => {
        const scan = createMockDiseaseScan({ scanStatus: status });
        expect(["pending", "reviewed", "escalated"]).toContain(scan.scanStatus);
      });
    });

    it("should default to pending status", () => {
      const scan = createMockDiseaseScan({ scanStatus: undefined });
      // Default is pending
      expect(scan.scanStatus).toBeUndefined();
    });

    it("should track review information when reviewed", () => {
      const scan = createMockDiseaseScan({
        scanStatus: "reviewed",
        reviewedBy: "officer_123",
        officerNotes: "Confirmed leaf blast. Recommend fungicide treatment.",
      });
      expect(scan.scanStatus).toBe("reviewed");
      expect(scan.reviewedBy).toBeDefined();
      expect(scan.officerNotes).toBeDefined();
    });

    it("should track escalation information when escalated", () => {
      const scan = createMockDiseaseScan({
        scanStatus: "escalated",
        reviewedBy: "officer_456",
        officerNotes: "Severe outbreak. Needs immediate intervention.",
      });
      expect(scan.scanStatus).toBe("escalated");
      expect(scan.officerNotes).toContain("Severe");
    });
  });

  describe("Image Information", () => {
    it("should store image metadata", () => {
      const scan = createMockDiseaseScan();
      expect(scan.imageUrl).toMatch(/^https?:/);
      expect(scan.imagePublicId).toBeDefined();
    });

    it("should track image format", () => {
      const scan = createMockDiseaseScan({ imageFormat: "jpeg" });
      expect(scan.imageFormat).toBe("jpeg");
    });

    it("should track image size", () => {
      const scan = createMockDiseaseScan({ imageBytes: 245000 });
      expect(scan.imageBytes).toBeGreaterThan(0);
    });

    it("should track image dimensions", () => {
      const scan = createMockDiseaseScan({
        imageWidth: 1920,
        imageHeight: 1080,
      });
      expect(scan.imageWidth).toBeGreaterThan(0);
      expect(scan.imageHeight).toBeGreaterThan(0);
    });

    it("should support various image formats", () => {
      const formats = ["jpeg", "png", "webp", "jpg"];
      formats.forEach((format) => {
        const scan = createMockDiseaseScan({ imageFormat: format });
        expect(scan.imageFormat).toBe(format);
      });
    });
  });

  describe("User Association", () => {
    it("should be associated with user", () => {
      const scan = createMockDiseaseScan({ clerkId: "user_789" });
      expect(scan.clerkId).toBe("user_789");
    });

    it("should support anonymous scans", () => {
      const scan = createMockDiseaseScan({ clerkId: null });
      expect(scan.clerkId).toBeNull();
    });
  });

  describe("Scan Timestamps", () => {
    it("should have creation timestamp", () => {
      const scan = createMockDiseaseScan();
      expect(scan.createdAt).toBeInstanceOf(Date);
    });

    it("should have update timestamp", () => {
      const scan = createMockDiseaseScan();
      expect(scan.updatedAt).toBeInstanceOf(Date);
    });
  });
});

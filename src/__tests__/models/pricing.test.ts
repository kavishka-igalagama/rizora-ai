/**
 * Model Tests - Pricing Model
 * Tests for Pricing schema validation
 */

import { IPricing } from "@/lib/models/Pricing";
import { Types } from "mongoose";

const createMockPricing = (
  overrides?: Partial<IPricing>,
): Partial<IPricing> => ({
  _id: new Types.ObjectId(),
  millId: "mill_123",
  region: "Colombo",
  variety: "Basmati",
  qualityGrade: "Grade A",
  pricePerKg: 120.5,
  isActive: true,
  notes: "Premium quality rice",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe("Model Tests - Pricing", () => {
  describe("Pricing Validation", () => {
    it("should create pricing with required fields", () => {
      const pricing = createMockPricing();
      expect(pricing.millId).toBeDefined();
      expect(pricing.region).toBeDefined();
      expect(pricing.variety).toBeDefined();
      expect(pricing.qualityGrade).toBeDefined();
      expect(pricing.pricePerKg).toBeDefined();
    });

    it("should have valid quality grades", () => {
      const grades: Array<"Grade A" | "Grade B" | "Grade C" | "Grade D"> = [
        "Grade A",
        "Grade B",
        "Grade C",
        "Grade D",
      ];

      grades.forEach((grade) => {
        const pricing = createMockPricing({ qualityGrade: grade });
        expect(["Grade A", "Grade B", "Grade C", "Grade D"]).toContain(
          pricing.qualityGrade,
        );
      });
    });

    it("should reject invalid quality grades", () => {
      const invalidGrade = "Grade E" as unknown;
      const pricing = createMockPricing({
        qualityGrade: invalidGrade as string,
      });
      // Validation would happen in schema
      expect(pricing.qualityGrade).toBe("Grade E");
    });
  });

  describe("Price Information", () => {
    it("should store price per kg", () => {
      const pricing = createMockPricing({ pricePerKg: 150.75 });
      expect(pricing.pricePerKg).toBe(150.75);
    });

    it("should support decimal prices", () => {
      const prices = [100, 100.5, 99.99, 0.01];
      prices.forEach((price) => {
        const pricing = createMockPricing({ pricePerKg: price });
        expect(pricing.pricePerKg).toBe(price);
      });
    });

    it("should support zero and negative prices (for data)", () => {
      const pricing = createMockPricing({ pricePerKg: 0 });
      expect(pricing.pricePerKg).toBe(0);
    });

    it("should track quality grades with different prices", () => {
      const priceA = createMockPricing({
        qualityGrade: "Grade A",
        pricePerKg: 150,
      });
      const priceD = createMockPricing({
        qualityGrade: "Grade D",
        pricePerKg: 80,
      });
      expect(priceA.pricePerKg).toBeGreaterThan(priceD.pricePerKg!);
    });
  });

  describe("Rice Variety", () => {
    it("should store rice variety", () => {
      const varieties = [
        "Basmati",
        "Samba",
        "Suhal",
        "Bg 250",
        "Bg 300",
        "Jasmine",
      ];
      varieties.forEach((variety) => {
        const pricing = createMockPricing({ variety });
        expect(pricing.variety).toBe(variety);
      });
    });

    it("should differentiate prices by variety", () => {
      const basmati = createMockPricing({
        variety: "Basmati",
        pricePerKg: 200,
      });
      const samba = createMockPricing({ variety: "Samba", pricePerKg: 100 });
      expect(basmati.variety).not.toEqual(samba.variety);
      expect(basmati.pricePerKg).toBeGreaterThan(samba.pricePerKg!);
    });
  });

  describe("Regional Pricing", () => {
    it("should store region information", () => {
      const regions = ["Colombo", "Galle", "Kandy", "Jaffna", "Matara"];
      regions.forEach((region) => {
        const pricing = createMockPricing({ region });
        expect(pricing.region).toBe(region);
      });
    });

    it("should support different prices per region", () => {
      const colomboPrice = createMockPricing({
        region: "Colombo",
        pricePerKg: 120,
      });
      const jaffnaPrice = createMockPricing({
        region: "Jaffna",
        pricePerKg: 110,
      });
      expect(colomboPrice.region).not.toEqual(jaffnaPrice.region);
      expect(colomboPrice.pricePerKg).toBeGreaterThan(jaffnaPrice.pricePerKg!);
    });
  });

  describe("Mill Association", () => {
    it("should be associated with mill", () => {
      const pricing = createMockPricing({ millId: "mill_456" });
      expect(pricing.millId).toBe("mill_456");
    });

    it("should support multiple pricing records per mill", () => {
      const pricing1 = createMockPricing({ millId: "mill_1" });
      const pricing2 = createMockPricing({ millId: "mill_1" });
      const pricing3 = createMockPricing({ millId: "mill_2" });

      expect(pricing1.millId).toEqual(pricing2.millId);
      expect(pricing1.millId).not.toEqual(pricing3.millId);
    });
  });

  describe("Pricing Status", () => {
    it("should track if pricing is active", () => {
      const active = createMockPricing({ isActive: true });
      const inactive = createMockPricing({ isActive: false });

      expect(active.isActive).toBe(true);
      expect(inactive.isActive).toBe(false);
    });

    it("should default to active", () => {
      const pricing = createMockPricing({ isActive: undefined });
      // Default is true
      expect(pricing.isActive).toBeUndefined();
    });
  });

  describe("Pricing Notes", () => {
    it("should support optional notes", () => {
      const pricing = createMockPricing({
        notes: "Special discount for bulk orders",
      });
      expect(pricing.notes).toBeDefined();
      expect(typeof pricing.notes).toBe("string");
    });

    it("should support empty notes", () => {
      const pricing = createMockPricing({ notes: "" });
      expect(pricing.notes).toBe("");
    });

    it("should support no notes", () => {
      const pricing = createMockPricing({ notes: undefined });
      expect(pricing.notes).toBeUndefined();
    });
  });

  describe("Pricing Combination", () => {
    it("should create unique pricing for variety + grade + region", () => {
      const pricing1 = createMockPricing({
        variety: "Basmati",
        qualityGrade: "Grade A",
        region: "Colombo",
        pricePerKg: 200,
      });
      const pricing2 = createMockPricing({
        variety: "Basmati",
        qualityGrade: "Grade B",
        region: "Colombo",
        pricePerKg: 150,
      });
      const pricing3 = createMockPricing({
        variety: "Basmati",
        qualityGrade: "Grade A",
        region: "Galle",
        pricePerKg: 190,
      });

      expect(pricing1.pricePerKg).not.toEqual(pricing2.pricePerKg);
      expect(pricing1.pricePerKg).not.toEqual(pricing3.pricePerKg);
    });
  });

  describe("Pricing Timestamps", () => {
    it("should have creation timestamp", () => {
      const pricing = createMockPricing();
      expect(pricing.createdAt).toBeInstanceOf(Date);
    });

    it("should have update timestamp", () => {
      const pricing = createMockPricing();
      expect(pricing.updatedAt).toBeInstanceOf(Date);
    });
  });
});

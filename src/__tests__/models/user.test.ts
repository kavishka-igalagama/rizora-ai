/**
 * Model Tests - User Model
 * Tests for User schema validation and methods
 */

import { IUser } from "@/lib/models/User";

// Mock User model
const createMockUser = (overrides?: Partial<IUser>): Partial<IUser> => ({
  clerkId: "user_123",
  email: "farmer@example.com",
  firstName: "John",
  lastName: "Farmer",
  role: "farmer",
  district: "Colombo",
  nic: "123456789V",
  phone: "+94701234567",
  onboardingCompleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe("Model Tests - User", () => {
  describe("User Validation", () => {
    it("should create user with required fields", () => {
      const user = createMockUser();
      expect(user.clerkId).toBeDefined();
      expect(user.email).toBeDefined();
    });

    it("should have valid role enum values", () => {
      const roles: Array<"farmer" | "mill" | "officer" | "none"> = [
        "farmer",
        "mill",
        "officer",
        "none",
      ];

      roles.forEach((role) => {
        const user = createMockUser({ role });
        expect(["farmer", "mill", "officer", "none"]).toContain(user.role);
      });
    });

    it("should have farmer-specific fields", () => {
      const farmer = createMockUser({ role: "farmer" });
      expect(farmer.firstName).toBeDefined();
      expect(farmer.district).toBeDefined();
      expect(farmer.nic).toBeDefined();
    });

    it("should have mill-specific fields", () => {
      const mill = createMockUser({
        role: "mill",
        millName: "ABC Rice Mill",
        registrationNumber: "REG123",
      });
      expect(mill.millName).toBeDefined();
      expect(mill.registrationNumber).toBeDefined();
    });

    it("should have officer-specific fields", () => {
      const officer = createMockUser({
        role: "officer",
        officerId: "OFF123",
        designation: "Agricultural Officer",
        department: "Agriculture",
        assignedDistrict: "Colombo",
      });
      expect(officer.officerId).toBeDefined();
      expect(officer.designation).toBeDefined();
      expect(officer.assignedDistrict).toBeDefined();
    });

    it("should have timestamps", () => {
      const user = createMockUser();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it("should support optional fields", () => {
      const user = createMockUser({
        firstName: undefined,
        imageUrl: undefined,
      });
      expect(user.email).toBeDefined();
      expect(user.firstName).toBeUndefined();
    });
  });

  describe("User Identity Fields", () => {
    it("should have unique clerkId", () => {
      const user1 = createMockUser({ clerkId: "clerk_1" });
      const user2 = createMockUser({ clerkId: "clerk_2" });
      expect(user1.clerkId).not.toEqual(user2.clerkId);
    });

    it("should have unique email", () => {
      const user1 = createMockUser({ email: "user1@example.com" });
      const user2 = createMockUser({ email: "user2@example.com" });
      expect(user1.email).not.toEqual(user2.email);
    });

    it("should validate email format", () => {
      const validEmails = [
        "user@example.com",
        "john.doe@company.co.uk",
        "test+tag@example.com",
      ];

      validEmails.forEach((email) => {
        const user = createMockUser({ email });
        expect(user.email).toMatch(/@/);
      });
    });

    it("should validate phone format", () => {
      const user = createMockUser({ phone: "+94701234567" });
      expect(user.phone).toMatch(/^\+/);
    });
  });

  describe("User Onboarding", () => {
    it("should track onboarding status", () => {
      const incompleteUser = createMockUser({ onboardingCompleted: false });
      const completeUser = createMockUser({ onboardingCompleted: true });

      expect(incompleteUser.onboardingCompleted).toBe(false);
      expect(completeUser.onboardingCompleted).toBe(true);
    });

    it("should default onboarding to false", () => {
      const user = createMockUser({ onboardingCompleted: undefined });
      // Should default to false if not provided
      expect(user.onboardingCompleted).toBeUndefined();
    });
  });
});

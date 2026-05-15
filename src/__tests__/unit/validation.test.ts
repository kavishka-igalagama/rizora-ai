/**
 * Unit Tests - Validation Functions
 * Tests for validation and helper functions
 */

// Example validation functions
const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePassword = (
  password: string,
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain an uppercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain a number");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, "");
};

describe("Unit Tests - Validation Functions", () => {
  describe("validateEmail", () => {
    it("should accept valid emails", () => {
      expect(validateEmail("user@example.com")).toBe(true);
      expect(validateEmail("john.doe@company.co.uk")).toBe(true);
    });

    it("should reject invalid emails", () => {
      expect(validateEmail("invalid-email")).toBe(false);
      expect(validateEmail("user@")).toBe(false);
      expect(validateEmail("@example.com")).toBe(false);
      expect(validateEmail("")).toBe(false);
    });
  });

  describe("validatePassword", () => {
    it("should accept strong passwords", () => {
      const result = validatePassword("SecurePass123");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject short passwords", () => {
      const result = validatePassword("Short1");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Password must be at least 8 characters");
    });

    it("should require uppercase letter", () => {
      const result = validatePassword("lowercase123");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Password must contain an uppercase letter",
      );
    });

    it("should require number", () => {
      const result = validatePassword("NoNumbers");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Password must contain a number");
    });

    it("should return multiple errors", () => {
      const result = validatePassword("short");
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe("sanitizeInput", () => {
    it("should trim whitespace", () => {
      expect(sanitizeInput("  hello  ")).toBe("hello");
    });

    it("should remove HTML characters", () => {
      expect(sanitizeInput('hello<script>alert("xss")</script>')).toBe(
        'helloscriptalert("xss")/script',
      );
    });

    it("should handle normal input", () => {
      expect(sanitizeInput("normal input")).toBe("normal input");
    });
  });
});

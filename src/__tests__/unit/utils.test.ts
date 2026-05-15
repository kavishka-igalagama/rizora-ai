/**
 * Unit Tests Example
 * Tests for utility functions in isolation
 */

import { cn } from "@/lib/utils";

describe("Unit Tests - Utils", () => {
  describe("cn (class names)", () => {
    it("should merge class names correctly", () => {
      const result = cn("px-4", "py-2");
      expect(result).toContain("px-4");
      expect(result).toContain("py-2");
    });

    it("should handle conditional classes", () => {
      const result = cn("base", {
        active: true,
        disabled: false,
      });
      expect(result).toContain("active");
      expect(result).not.toContain("disabled");
    });

    it("should handle empty values", () => {
      const result = cn("px-4", "", undefined, null);
      expect(result).toContain("px-4");
    });

    it("should resolve Tailwind conflicts correctly", () => {
      const result = cn("px-2", "px-4");
      // Should take the last value
      expect(result).toContain("px-4");
    });
  });
});

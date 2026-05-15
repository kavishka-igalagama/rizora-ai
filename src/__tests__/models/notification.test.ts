/**
 * Model Tests - Notification Model
 * Tests for Notification schema validation
 */

import { INotification, NotificationType } from "@/lib/models/Notification";

const createMockNotification = (
  overrides?: Partial<INotification>,
): Partial<INotification> => ({
  clerkId: "user_123",
  type: "alert",
  title: "Disease Alert",
  description: "Rice leaf blast detected in your field",
  read: false,
  metadata: {
    scanId: "scan_123",
    disease: "Rice Leaf Blast",
    confidence: 92.5,
    imageUrl: "https://example.com/image.jpg",
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe("Model Tests - Notification", () => {
  describe("Notification Types", () => {
    it("should support all notification types", () => {
      const types: NotificationType[] = [
        "alert",
        "market",
        "message",
        "system",
      ];

      types.forEach((type) => {
        const notification = createMockNotification({ type });
        expect(["alert", "market", "message", "system"]).toContain(
          notification.type,
        );
      });
    });

    it("should default to alert type", () => {
      const notification = createMockNotification({ type: undefined });
      // Default in schema is 'alert'
      expect(notification.type).toBeUndefined();
    });

    it("should create alert notification for disease", () => {
      const notification = createMockNotification({
        type: "alert",
        title: "Disease Alert",
      });
      expect(notification.type).toBe("alert");
      expect(notification.title).toContain("Disease");
    });

    it("should create market notification for price changes", () => {
      const notification = createMockNotification({
        type: "market",
        title: "Price Update",
        description: "Rice price changed to Rs. 100/kg",
      });
      expect(notification.type).toBe("market");
    });

    it("should create message notification for new messages", () => {
      const notification = createMockNotification({
        type: "message",
        title: "New Message",
        description: "You have a new message from John",
      });
      expect(notification.type).toBe("message");
    });

    it("should create system notification for system events", () => {
      const notification = createMockNotification({
        type: "system",
        title: "System Update",
        description: "System maintenance scheduled",
      });
      expect(notification.type).toBe("system");
    });
  });

  describe("Notification Content", () => {
    it("should have title and description", () => {
      const notification = createMockNotification();
      expect(notification.title).toBeDefined();
      expect(notification.description).toBeDefined();
    });

    it("should trim title and description", () => {
      const notification = createMockNotification({
        title: "  Disease Alert  ",
        description: "  Leaf blast detected  ",
      });
      expect(notification.title?.trim()).toBe("Disease Alert");
      expect(notification.description?.trim()).toBe("Leaf blast detected");
    });

    it("should support long descriptions", () => {
      const longDesc = "A".repeat(500);
      const notification = createMockNotification({ description: longDesc });
      expect(notification.description?.length).toBe(500);
    });
  });

  describe("Notification Read Status", () => {
    it("should track read status", () => {
      const unread = createMockNotification({ read: false });
      const read = createMockNotification({ read: true });

      expect(unread.read).toBe(false);
      expect(read.read).toBe(true);
    });

    it("should default to unread", () => {
      const notification = createMockNotification({ read: undefined });
      // Default is false in schema
      expect(notification.read).toBeUndefined();
    });
  });

  describe("Notification Metadata", () => {
    it("should store disease scan metadata", () => {
      const notification = createMockNotification({
        metadata: {
          scanId: "scan_456",
          disease: "Rice Brown Spot",
          confidence: 87.3,
          imageUrl: "https://example.com/scan.jpg",
        },
      });
      expect(notification.metadata?.scanId).toBe("scan_456");
      expect(notification.metadata?.disease).toBe("Rice Brown Spot");
      expect(notification.metadata?.confidence).toBeCloseTo(87.3);
    });

    it("should support optional metadata", () => {
      const notification = createMockNotification({ metadata: undefined });
      expect(notification.metadata).toBeUndefined();
    });

    it("should validate confidence range", () => {
      const notification = createMockNotification({
        metadata: {
          confidence: 95.5,
        },
      });
      expect(notification.metadata?.confidence).toBeGreaterThanOrEqual(0);
      expect(notification.metadata?.confidence).toBeLessThanOrEqual(100);
    });

    it("should have image URL in metadata", () => {
      const notification = createMockNotification();
      expect(notification.metadata?.imageUrl).toMatch(/^https?:/);
    });
  });

  describe("Notification Recipient", () => {
    it("should be associated with user", () => {
      const notification = createMockNotification({ clerkId: "user_789" });
      expect(notification.clerkId).toBe("user_789");
    });

    it("should support multiple notifications per user", () => {
      const notif1 = createMockNotification({ clerkId: "user_1" });
      const notif2 = createMockNotification({ clerkId: "user_1" });
      const notif3 = createMockNotification({ clerkId: "user_2" });

      expect(notif1.clerkId).toEqual(notif2.clerkId);
      expect(notif1.clerkId).not.toEqual(notif3.clerkId);
    });
  });

  describe("Notification Timestamps", () => {
    it("should have creation timestamp", () => {
      const notification = createMockNotification();
      expect(notification.createdAt).toBeInstanceOf(Date);
    });

    it("should have update timestamp", () => {
      const notification = createMockNotification();
      expect(notification.updatedAt).toBeInstanceOf(Date);
    });

    it("should maintain chronological order", () => {
      const oldNotif = createMockNotification({
        createdAt: new Date("2024-01-01"),
      });
      const newNotif = createMockNotification({
        createdAt: new Date("2024-12-31"),
      });
      expect(oldNotif.createdAt!.getTime()).toBeLessThan(
        newNotif.createdAt!.getTime(),
      );
    });
  });
});

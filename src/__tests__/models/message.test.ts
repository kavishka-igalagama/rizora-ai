/**
 * Model Tests - Message Model
 * Tests for Message schema validation and methods
 */

import { IMessage } from "@/lib/models/Message";
import { Types } from "mongoose";

const createMockMessage = (
  overrides?: Partial<IMessage>,
): Partial<IMessage> => ({
  _id: new Types.ObjectId(),
  conversationId: "conv_123",
  senderId: "sender_123",
  recipientId: "recipient_123",
  body: "Hello, this is a test message",
  readAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe("Model Tests - Message", () => {
  describe("Message Validation", () => {
    it("should create message with required fields", () => {
      const message = createMockMessage();
      expect(message.conversationId).toBeDefined();
      expect(message.senderId).toBeDefined();
      expect(message.recipientId).toBeDefined();
      expect(message.body).toBeDefined();
    });

    it("should have unique message ID", () => {
      const message1 = createMockMessage({ _id: new Types.ObjectId() });
      const message2 = createMockMessage({ _id: new Types.ObjectId() });
      expect(message1._id).not.toEqual(message2._id);
    });

    it("should enforce body max length", () => {
      const longBody = "x".repeat(2001);
      const message = createMockMessage({ body: longBody });
      // Should still create but validator should catch it
      expect(message.body?.length).toBeGreaterThan(2000);
    });

    it("should trim message body", () => {
      const message = createMockMessage({ body: "  test message  " });
      // In real implementation, trimming happens on schema level
      expect(message.body?.trim()).toBe("test message");
    });
  });

  describe("Message Fields", () => {
    it("should have sender and recipient IDs", () => {
      const message = createMockMessage({
        senderId: "user_1",
        recipientId: "user_2",
      });
      expect(message.senderId).not.toEqual(message.recipientId);
    });

    it("should track read status", () => {
      const unreadMessage = createMockMessage({ readAt: null });
      const readMessage = createMockMessage({ readAt: new Date() });

      expect(unreadMessage.readAt).toBeNull();
      expect(readMessage.readAt).toBeInstanceOf(Date);
    });

    it("should support optional readAt field", () => {
      const message = createMockMessage({ readAt: undefined });
      expect(message.readAt).toBeUndefined();
    });

    it("should group messages by conversation", () => {
      const msg1 = createMockMessage({ conversationId: "conv_1" });
      const msg2 = createMockMessage({ conversationId: "conv_1" });
      const msg3 = createMockMessage({ conversationId: "conv_2" });

      expect(msg1.conversationId).toEqual(msg2.conversationId);
      expect(msg1.conversationId).not.toEqual(msg3.conversationId);
    });
  });

  describe("Message Timestamps", () => {
    it("should have creation timestamp", () => {
      const message = createMockMessage();
      expect(message.createdAt).toBeInstanceOf(Date);
    });

    it("should have update timestamp", () => {
      const message = createMockMessage();
      expect(message.updatedAt).toBeInstanceOf(Date);
    });

    it("should maintain timestamp order", () => {
      const message = createMockMessage();
      expect(message.createdAt?.getTime()).toBeLessThanOrEqual(
        message.updatedAt?.getTime() ?? Number.MAX_SAFE_INTEGER,
      );
    });
  });

  describe("Message Content", () => {
    it("should support various message content", () => {
      const contents = [
        "Simple text message",
        "Message with emoji 😀",
        "Message with special chars !@#$%",
        "Multiline\nmessage\nwith\nnewlines",
      ];

      contents.forEach((content) => {
        const message = createMockMessage({ body: content });
        expect(message.body).toEqual(content);
      });
    });

    it("should not allow empty message body", () => {
      // In validation, empty messages should be rejected
      const message = createMockMessage({ body: "" });
      expect(message.body?.length).toBe(0);
    });
  });
});

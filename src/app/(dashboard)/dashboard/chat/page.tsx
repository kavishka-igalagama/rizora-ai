"use client";

import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import ChatList from "@/components/dashboard/common/chat/ChatList";
import ChatContent, {
  type ChatMessage,
} from "@/components/dashboard/common/chat/ChatContent";
import { Card } from "@/components/ui/card";
import { getPusherClient } from "@/lib/pusher-client";
import { MessageSquare } from "lucide-react";

type ChatContact = {
  clerkId: string;
  name: string;
  role: "farmer" | "mill";
  district?: string;
  imageUrl?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
};

type MessageEventPayload = {
  _id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

type ReadEventPayload = {
  conversationId: string;
  readerId: string;
  contactId: string;
  readAt: string;
};

type TypingEventPayload = {
  conversationId: string;
  senderId: string;
  recipientId: string;
  isTyping: boolean;
  sentAt: string;
};

function sortContactsByActivity(contacts: ChatContact[]): ChatContact[] {
  return [...contacts].sort((a, b) => {
    if (!a.lastMessageAt && !b.lastMessageAt) {
      return a.name.localeCompare(b.name);
    }
    if (!a.lastMessageAt) {
      return 1;
    }
    if (!b.lastMessageAt) {
      return -1;
    }
    return (
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  });
}

const Messages = () => {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const currentUserId = user?.id;
  const requestedContactId = searchParams.get("contactId")?.trim() || null;

  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null,
  );
  const [messagesByContact, setMessagesByContact] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [typingByContact, setTypingByContact] = useState<
    Record<string, boolean>
  >({});

  const visibleContacts = useMemo(() => {
    if (!requestedContactId) {
      return contacts;
    }

    return contacts.filter((contact) => contact.clerkId === requestedContactId);
  }, [contacts, requestedContactId]);

  const conversationContacts = useMemo(() => {
    if (requestedContactId) {
      return visibleContacts;
    }

    return visibleContacts.filter(
      (contact) => Boolean(contact.lastMessageAt) || contact.unreadCount > 0,
    );
  }, [requestedContactId, visibleContacts]);

  const typingResetTimersRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});
  const typingMetaRef = useRef<
    Record<
      string,
      {
        lastValue: boolean;
        lastSentAt: number;
      }
    >
  >({});

  const selectedContact = useMemo(
    () =>
      conversationContacts.find(
        (contact) => contact.clerkId === selectedContactId,
      ) || null,
    [conversationContacts, selectedContactId],
  );

  const selectedMessages = useMemo(
    () => (selectedContactId ? messagesByContact[selectedContactId] || [] : []),
    [messagesByContact, selectedContactId],
  );

  const markConversationRead = useCallback(
    async (contactId: string) => {
      if (!currentUserId) {
        return;
      }

      setMessagesByContact((prev) => {
        const existing = prev[contactId] || [];
        const hasUnreadIncoming = existing.some(
          (message) =>
            message.senderId === contactId &&
            message.recipientId === currentUserId &&
            !message.readAt,
        );

        if (!hasUnreadIncoming) {
          return prev;
        }

        return {
          ...prev,
          [contactId]: existing.map((message) => {
            if (
              message.senderId === contactId &&
              message.recipientId === currentUserId &&
              !message.readAt
            ) {
              return {
                ...message,
                readAt: new Date().toISOString(),
              };
            }
            return message;
          }),
        };
      });

      setContacts((prev) =>
        prev.map((contact) =>
          contact.clerkId === contactId
            ? {
                ...contact,
                unreadCount: 0,
              }
            : contact,
        ),
      );

      try {
        await fetch("/api/chat/messages", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contactId,
          }),
        });
      } catch (error) {
        console.error("Failed to mark conversation as read", error);
      }
    },
    [currentUserId],
  );

  const mergeIncomingMessage = useCallback(
    (incoming: MessageEventPayload) => {
      if (!currentUserId) {
        return;
      }

      const otherId =
        incoming.senderId === currentUserId
          ? incoming.recipientId
          : incoming.senderId;

      setMessagesByContact((prev) => {
        const existing = prev[otherId] || [];
        if (existing.some((message) => message._id === incoming._id)) {
          return prev;
        }

        return {
          ...prev,
          [otherId]: [
            ...existing,
            {
              _id: incoming._id,
              senderId: incoming.senderId,
              recipientId: incoming.recipientId,
              body: incoming.body,
              createdAt: incoming.createdAt,
              readAt: incoming.readAt,
            },
          ],
        };
      });

      const isIncomingForCurrentUser = incoming.senderId !== currentUserId;
      const isActiveConversation = selectedContactId === otherId;

      setContacts((prev) => {
        const updated = prev.map((contact) => {
          if (contact.clerkId !== otherId) {
            return contact;
          }

          return {
            ...contact,
            lastMessage: incoming.body,
            lastMessageAt: incoming.createdAt,
            unreadCount:
              isIncomingForCurrentUser && !isActiveConversation
                ? (contact.unreadCount || 0) + 1
                : isActiveConversation
                  ? 0
                  : contact.unreadCount,
          };
        });

        return sortContactsByActivity(updated);
      });

      if (isIncomingForCurrentUser && isActiveConversation) {
        void markConversationRead(otherId);
      }

      setTypingByContact((prev) => ({
        ...prev,
        [otherId]: false,
      }));
    },
    [currentUserId, markConversationRead, selectedContactId],
  );

  const fetchContacts = useCallback(async () => {
    if (!currentUserId) {
      return;
    }

    setIsLoadingContacts(true);
    try {
      const response = await fetch("/api/chat/contacts", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch contacts");
      }

      const data = (await response.json()) as { contacts: ChatContact[] };
      setContacts(sortContactsByActivity(data.contacts || []));

      setSelectedContactId((current) => {
        if (
          requestedContactId &&
          data.contacts.some(
            (contact) => contact.clerkId === requestedContactId,
          )
        ) {
          return requestedContactId;
        }

        if (
          current &&
          data.contacts.some((contact) => contact.clerkId === current)
        ) {
          return current;
        }
        return null;
      });
    } catch (error) {
      console.error("Failed to load contacts", error);
      setContacts([]);
      setSelectedContactId(null);
    } finally {
      setIsLoadingContacts(false);
    }
  }, [currentUserId, requestedContactId]);

  const fetchMessages = useCallback(
    async (contactId: string) => {
      setIsLoadingMessages(true);

      try {
        const response = await fetch(
          `/api/chat/messages?contactId=${encodeURIComponent(contactId)}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }

        const data = (await response.json()) as { messages: ChatMessage[] };

        setMessagesByContact((prev) => ({
          ...prev,
          [contactId]: data.messages || [],
        }));

        if (selectedContactId === contactId) {
          void markConversationRead(contactId);
        }
      } catch (error) {
        console.error("Failed to load messages", error);
        setMessagesByContact((prev) => ({
          ...prev,
          [contactId]: [],
        }));
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [markConversationRead, selectedContactId],
  );

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!selectedContactId || !text.trim()) {
        return;
      }

      setIsSending(true);

      try {
        const response = await fetch("/api/chat/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contactId: selectedContactId,
            body: text,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        const data = (await response.json()) as {
          message: MessageEventPayload;
        };

        mergeIncomingMessage(data.message);
      } catch (error) {
        console.error("Failed to send message", error);
      } finally {
        setIsSending(false);
      }
    },
    [mergeIncomingMessage, selectedContactId],
  );

  const handleTyping = useCallback(
    async (isTyping: boolean) => {
      if (!selectedContactId) {
        return;
      }

      const now = Date.now();
      const currentMeta = typingMetaRef.current[selectedContactId] || {
        lastValue: false,
        lastSentAt: 0,
      };

      if (
        isTyping &&
        currentMeta.lastValue &&
        now - currentMeta.lastSentAt < 1200
      ) {
        return;
      }

      typingMetaRef.current[selectedContactId] = {
        lastValue: isTyping,
        lastSentAt: now,
      };

      try {
        await fetch("/api/chat/typing", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contactId: selectedContactId,
            isTyping,
          }),
        });
      } catch (error) {
        console.error("Failed to send typing state", error);
      }
    },
    [selectedContactId],
  );

  useEffect(() => {
    if (!isLoaded || !currentUserId) {
      return;
    }

    void fetchContacts();
  }, [currentUserId, fetchContacts, isLoaded]);

  useEffect(() => {
    if (!requestedContactId) {
      return;
    }

    if (
      !visibleContacts.some((contact) => contact.clerkId === requestedContactId)
    ) {
      return;
    }

    setSelectedContactId((current) =>
      current === requestedContactId ? current : requestedContactId,
    );
  }, [requestedContactId, visibleContacts]);

  useEffect(() => {
    if (!selectedContactId) {
      return;
    }

    if (
      conversationContacts.some(
        (contact) => contact.clerkId === selectedContactId,
      )
    ) {
      return;
    }

    setSelectedContactId(null);
  }, [conversationContacts, selectedContactId]);

  useEffect(() => {
    if (!selectedContactId || messagesByContact[selectedContactId]) {
      return;
    }

    void fetchMessages(selectedContactId);
  }, [fetchMessages, messagesByContact, selectedContactId]);

  useEffect(() => {
    if (!selectedContactId) {
      return;
    }

    void markConversationRead(selectedContactId);
  }, [markConversationRead, selectedContactId]);

  useEffect(() => {
    const totalUnread = contacts.reduce(
      (sum, contact) => sum + (contact.unreadCount || 0),
      0,
    );

    window.dispatchEvent(
      new CustomEvent("chat-unread-count-changed", {
        detail: { total: totalUnread },
      }),
    );
  }, [contacts]);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const pusher = getPusherClient();
    const channelName = `private-user-${currentUserId}`;
    const channel = pusher.subscribe(channelName);

    const handleIncoming = (payload: MessageEventPayload) => {
      mergeIncomingMessage(payload);
    };

    const handleRead = (payload: ReadEventPayload) => {
      if (payload.readerId === currentUserId) {
        return;
      }

      const otherId = payload.readerId;

      setMessagesByContact((prev) => {
        const existing = prev[otherId];

        if (!existing || existing.length === 0) {
          return prev;
        }

        return {
          ...prev,
          [otherId]: existing.map((message) => {
            if (
              message.senderId === currentUserId &&
              message.recipientId === otherId &&
              !message.readAt
            ) {
              return {
                ...message,
                readAt: payload.readAt,
              };
            }
            return message;
          }),
        };
      });
    };

    const handleTypingEvent = (payload: TypingEventPayload) => {
      if (payload.senderId === currentUserId) {
        return;
      }

      setTypingByContact((prev) => ({
        ...prev,
        [payload.senderId]: payload.isTyping,
      }));

      const existingTimer = typingResetTimersRef.current[payload.senderId];
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      if (payload.isTyping) {
        typingResetTimersRef.current[payload.senderId] = setTimeout(() => {
          setTypingByContact((prev) => ({
            ...prev,
            [payload.senderId]: false,
          }));
        }, 3000);
      }
    };

    channel.bind("new-message", handleIncoming);
    channel.bind("messages-read", handleRead);
    channel.bind("typing", handleTypingEvent);

    return () => {
      channel.unbind("new-message", handleIncoming);
      channel.unbind("messages-read", handleRead);
      channel.unbind("typing", handleTypingEvent);
      pusher.unsubscribe(channelName);

      Object.values(typingResetTimersRef.current).forEach((timer) => {
        clearTimeout(timer);
      });
      typingResetTimersRef.current = {};
    };
  }, [currentUserId, mergeIncomingMessage]);

  return (
    <div className="h-full min-h-0 bg-background overflow-hidden">
      <main className="mx-auto px-4 py-6 h-full min-h-0 flex flex-col overflow-hidden">
        <div className="mx-auto h-full min-h-0 flex flex-col w-full overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
            <ChatList
              contacts={conversationContacts}
              selectedContactId={selectedContactId}
              onSelectContact={setSelectedContactId}
              isLoading={isLoadingContacts}
            />
            {selectedContact ? (
              <ChatContent
                currentUserId={currentUserId || ""}
                selectedContact={selectedContact}
                messages={selectedMessages}
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
                isContactTyping={
                  selectedContactId
                    ? Boolean(typingByContact[selectedContactId])
                    : false
                }
                isLoadingMessages={isLoadingMessages}
                isSending={isSending}
              />
            ) : (
              <Card className="lg:col-span-2 h-full min-h-0 flex items-center justify-center border-dashed">
                <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
                  <div className="max-w-md text-center space-y-6">
                    {/* Icon Display */}
                    <div className="flex justify-center gap-4 mb-4">
                      <div className="relative">
                        <div
                          className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center
             justify-center animate-bounce"
                        >
                          <MessageSquare className="w-8 h-8 text-primary " />
                        </div>
                      </div>
                    </div>

                    {/* Welcome Text */}
                    <h2 className="text-2xl font-bold">Welcome to Rizora!</h2>
                    <p className="text-base-content/60">
                      Select a conversation from the sidebar to start chatting
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;

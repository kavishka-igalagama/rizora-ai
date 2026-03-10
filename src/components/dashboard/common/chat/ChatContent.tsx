"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, CheckCheck, MessageSquare, Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Contact = {
  clerkId: string;
  name: string;
  role: string;
  imageUrl?: string;
};

export type ChatMessage = {
  _id: string;
  senderId: string;
  recipientId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

interface ChatContentProps {
  currentUserId: string;
  selectedContact: Contact | null;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onTyping: (isTyping: boolean) => void;
  isContactTyping?: boolean;
  isLoadingMessages?: boolean;
  isSending?: boolean;
}

const ChatContent = ({
  currentUserId,
  selectedContact,
  messages,
  onSendMessage,
  onTyping,
  isContactTyping = false,
  isLoadingMessages = false,
  isSending = false,
}: ChatContentProps) => {
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const previousConversationRef = useRef<string | null>(null);
  const previousLastMessageIdRef = useRef<string | undefined>(undefined);

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [messages],
  );

  useEffect(() => {
    if (!selectedContact) {
      previousConversationRef.current = null;
      previousLastMessageIdRef.current = undefined;
      return;
    }

    const conversationId = selectedContact.clerkId;
    const lastMessageId = sortedMessages.at(-1)?._id;
    const isConversationChanged =
      previousConversationRef.current !== conversationId;
    const hasNewMessage =
      !!lastMessageId && previousLastMessageIdRef.current !== lastMessageId;

    if ((isConversationChanged || hasNewMessage) && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: isConversationChanged ? "auto" : "smooth",
        block: "end",
      });
    }

    previousConversationRef.current = conversationId;
    previousLastMessageIdRef.current = lastMessageId;
  }, [selectedContact, sortedMessages]);

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed || !selectedContact || isSending) {
      return;
    }

    setDraft("");
    await onSendMessage(trimmed);
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();
    await handleSend();
    onTyping(false);
  };

  const handleDraftChange = (value: string) => {
    setDraft(value);
    onTyping(value.trim().length > 0);
  };

  const getDayDividerLabel = (dateValue: string) => {
    const messageDate = new Date(dateValue);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const messageDay = messageDate.toDateString();
    if (messageDay === today.toDateString()) {
      return "Today";
    }

    if (messageDay === yesterday.toDateString()) {
      return "Yesterday";
    }

    return messageDate.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  return (
    <Card className="lg:col-span-2 h-full min-h-0 flex flex-col overflow-hidden border-border/70 bg-linear-to-b from-background to-muted/20 shadow-md">
      {selectedContact ? (
        <>
          <CardHeader className="pb-3 border-b border-border/60 shrink-0 bg-background/70 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 ring-2 ring-background shadow-sm">
                  <AvatarImage src={selectedContact.imageUrl || ""} />
                  <AvatarFallback className="bg-linear-to-br from-primary to-emerald-600 text-white">
                    {selectedContact.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-foreground tracking-tight">
                    {selectedContact.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {isContactTyping && (
                      <span className="inline-flex items-center gap-1 text-primary">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        typing...
                      </span>
                    )}
                    {!isContactTyping && (
                      <span>{selectedContact.role || "Sri Lanka"}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 min-h-0 overflow-hidden p-0">
            <ScrollArea className="h-full p-4">
              {isLoadingMessages ? (
                <div className="h-full min-h-0 grid place-items-center">
                  <p className="text-sm text-muted-foreground rounded-full border border-border/60 bg-background/70 px-4 py-2">
                    Loading messages...
                  </p>
                </div>
              ) : sortedMessages.length === 0 ? (
                <div className="h-full min-h-0 grid place-items-center">
                  <p className="text-sm text-muted-foreground rounded-full border border-border/60 bg-background/70 px-4 py-2">
                    Start the conversation with your first message.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedMessages.map((message, index) => {
                    const isMe = message.senderId === currentUserId;
                    const previousMessage = sortedMessages[index - 1];

                    const currentDateLabel = getDayDividerLabel(
                      message.createdAt,
                    );

                    const previousDateLabel = previousMessage
                      ? getDayDividerLabel(previousMessage.createdAt)
                      : null;

                    const shouldShowDayDivider =
                      currentDateLabel !== previousDateLabel;

                    return (
                      <div key={message._id}>
                        {shouldShowDayDivider && (
                          <div className="mb-4 flex justify-center">
                            <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] text-muted-foreground shadow-xs backdrop-blur-sm">
                              {currentDateLabel}
                            </span>
                          </div>
                        )}

                        <div
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`relative max-w-[78%] rounded-2xl px-3 py-2.5 shadow-sm border ${
                              isMe
                                ? "bg-linear-to-r from-[#14543d] to-emerald-600 text-white rounded-tr-none border-emerald-700/30"
                                : "bg-background text-foreground rounded-tl-none border-border/70"
                            }`}
                          >
                            <div className="flex flex-wrap items-end gap-2">
                              <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
                                {message.body}
                              </p>

                              <div
                                className={`ml-auto inline-flex items-center gap-1 text-[11px] leading-none ${
                                  isMe
                                    ? "text-white/70"
                                    : "text-muted-foreground"
                                }`}
                              >
                                <span>
                                  {new Date(
                                    message.createdAt,
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>

                                {isMe &&
                                  (message.readAt ? (
                                    <CheckCheck className="h-3.5 w-3.5 text-sky-400" />
                                  ) : (
                                    <Check className="h-3.5 w-3.5 opacity-80" />
                                  ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div ref={messagesEndRef} className="h-px" aria-hidden="true" />
            </ScrollArea>
          </CardContent>

          <div className="p-4 border-t border-border/60 bg-background/70 backdrop-blur-sm shrink-0">
            <form
              className="flex items-center gap-2 rounded-2xl border border-border/70 bg-background p-1.5"
              onSubmit={handleSubmit}
            >
              <Input
                placeholder="Type a message..."
                className="flex-1 border-0 shadow-none focus-visible:ring-0"
                value={draft}
                onChange={(event) => handleDraftChange(event.target.value)}
                disabled={isSending}
              />
              <Button
                size="icon"
                type="submit"
                disabled={isSending || !draft.trim()}
                className="rounded-xl bg-linear-to-r from-primary to-emerald-600 shadow-sm hover:from-primary/90 hover:to-emerald-600/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Real-time chat between farmers and mills
            </p>
          </div>
        </>
      ) : (
        <div className="flex-1 min-h-0 flex items-center justify-center bg-linear-to-b from-background to-muted/20">
          <div className="text-center space-y-4 rounded-2xl border border-border/70 bg-background/80 px-8 py-10 shadow-sm backdrop-blur-sm">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Select a conversation
              </h3>
              <p className="text-sm text-muted-foreground">
                Chat with paddy mills or farmers
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ChatContent;

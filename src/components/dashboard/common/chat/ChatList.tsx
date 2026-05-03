"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Search } from "lucide-react";
import { useMemo, useState } from "react";

type ChatContact = {
  clerkId: string;
  name: string;
  role: string;
  district?: string;
  imageUrl?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
};

interface ChatListProps {
  contacts: ChatContact[];
  selectedContactId: string | null;
  onSelectContact: (contactId: string) => void;
  isLoading?: boolean;
}

const ChatList = ({
  contacts,
  selectedContactId,
  onSelectContact,
  isLoading = false,
}: ChatListProps) => {
  const [query, setQuery] = useState("");

  const formatLastMessageTime = (dateValue?: string) => {
    if (!dateValue) {
      return "";
    }

    const messageDate = new Date(dateValue);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const messageDay = messageDate.toDateString();
    if (messageDay === today.toDateString()) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    if (messageDay === yesterday.toDateString()) {
      return "Yesterday";
    }

    return messageDate.toLocaleDateString([], {
      month: "short",
      day: "2-digit",
    });
  };

  const filteredContacts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return contacts;
    }

    return contacts.filter((contact) => {
      return (
        contact.name.toLowerCase().includes(normalized) ||
        (contact.district || "").toLowerCase().includes(normalized)
      );
    });
  }, [contacts, query]);

  const groupedContacts = useMemo(() => {
    return {
      officers: filteredContacts.filter(
        (contact) => contact.role === "officer",
      ),
      others: filteredContacts.filter((contact) => contact.role !== "officer"),
    };
  }, [filteredContacts]);

  const totalUnreadCount = contacts.reduce(
    (sum, contact) => sum + (contact.unreadCount || 0),
    0,
  );

  return (
    <Card className="h-full min-h-0 flex flex-col overflow-hidden border-border/70 bg-linear-to-b from-background to-muted/20 shadow-md">
      <CardHeader className="pb-3 shrink-0 border-b border-border/60 bg-background/70 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <MessageCircle className="h-4 w-4" />
            </div>
            <CardTitle className="text-lg tracking-tight">
              Conversations
            </CardTitle>
          </div>
          {totalUnreadCount > 0 && (
            <Badge
              variant="secondary"
              className="rounded-full bg-primary/10 px-2.5 py-0.5 text-primary"
            >
              {totalUnreadCount} new
            </Badge>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="h-10 rounded-xl border-border/70 bg-background pl-9 pr-3 shadow-xs focus-visible:ring-2 focus-visible:ring-primary/30"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="space-y-2 p-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground px-2 py-4">
                Loading conversations...
              </p>
            ) : filteredContacts.length === 0 ? (
              <p className="text-sm text-muted-foreground px-2 py-4">
                No conversations found.
              </p>
            ) : (
              [
                ...(groupedContacts.officers.length > 0
                  ? [
                      {
                        title: "Officers from your district",
                        contacts: groupedContacts.officers,
                      },
                    ]
                  : []),
                ...(groupedContacts.others.length > 0
                  ? [
                      {
                        title: "Other Conversations",
                        contacts: groupedContacts.others,
                      },
                    ]
                  : []),
              ].map((group) => {
                return (
                  <div key={group.title} className="space-y-2">
                    <p className="px-2 pt-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                      {group.title}
                    </p>
                    {group.contacts.map((contact) => {
                      const isActive = selectedContactId === contact.clerkId;

                      return (
                        <button
                          key={contact.clerkId}
                          type="button"
                          onClick={() => onSelectContact(contact.clerkId)}
                          className={`group relative w-full text-left rounded-2xl cursor-pointer transition-all border px-3 py-3 ${
                            isActive
                              ? "border-primary/30 bg-primary/10 shadow-sm"
                              : "border-transparent bg-background/70 hover:border-border/70 hover:bg-muted/40"
                          }`}
                        >
                          <div
                            className={`pointer-events-none absolute inset-y-3 left-0 w-1 rounded-r-full transition-opacity ${
                              isActive ? "bg-primary opacity-100" : "opacity-0"
                            }`}
                          />

                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <Avatar className="w-12 h-12 ring-2 ring-background shadow-sm">
                                <AvatarImage src={contact.imageUrl || ""} />
                                <AvatarFallback className="bg-linear-to-br from-primary to-emerald-600 text-white">
                                  {contact.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>

                              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background shadow-sm" />
                            </div>

                            <div className="flex flex-col flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-sm text-foreground truncate tracking-tight">
                                  {contact.name}
                                </h4>

                                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                  {formatLastMessageTime(contact.lastMessageAt)}
                                </span>
                              </div>

                              <div className="flex items-center justify-between mt-1">
                                <p className="text-xs text-muted-foreground truncate">
                                  {contact.role}
                                  {contact.district
                                    ? `, ${contact.district}`
                                    : ""}
                                </p>
                                {Boolean(contact.unreadCount) && (
                                  <Badge className="ml-2 h-5 min-w-5 px-1.5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px]">
                                    {contact.unreadCount}
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center justify-between mt-1">
                                <p className="text-sm text-muted-foreground/90 truncate">
                                  {contact.lastMessage || "No messages yet"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ChatList;

"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  MessageSquare,
  Send,
  Phone,
  Video,
  MoreVertical,
  Search,
  Image,
  Paperclip,
  Smile,
  Bell,
  CheckCheck,
  Clock,
  Building2,
  User,
  Leaf,
  Camera,
  AlertCircle,
} from "lucide-react";

interface Message {
  id: number;
  senderId: string;
  text: string;
  timestamp: string;
  type: "text" | "image" | "disease-query";
  isRead: boolean;
  imageUrl?: string;
  diseaseData?: {
    disease: string;
    confidence: number;
  };
}

interface Contact {
  id: string;
  name: string;
  role: "mill" | "officer" | "farmer";
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
  location?: string;
}

const Messages = () => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const contacts: Contact[] = [
    {
      id: "1",
      name: "Lanka Paddy Mills Ltd.",
      role: "mill",
      avatar: "",
      lastMessage: "We can pick up your paddy tomorrow morning",
      lastMessageTime: "10:30 AM",
      unreadCount: 2,
      online: true,
      location: "Kurunegala",
    },
    {
      id: "2",
      name: "Dr. Kumara Perera",
      role: "officer",
      avatar: "",
      lastMessage:
        "The disease looks like Brown Spot. Apply fungicide immediately.",
      lastMessageTime: "Yesterday",
      unreadCount: 0,
      online: true,
      location: "Agricultural Office, Dambulla",
    },
    {
      id: "3",
      name: "Ceylon Rice Industries",
      role: "mill",
      avatar: "",
      lastMessage: "Current buying price is LKR 83/kg for Grade A",
      lastMessageTime: "Yesterday",
      unreadCount: 1,
      online: false,
      location: "Anuradhapura",
    },
    {
      id: "4",
      name: "Mr. Bandara Silva",
      role: "officer",
      avatar: "",
      lastMessage: "I'll visit your field this week to check the crop",
      lastMessageTime: "Dec 24",
      unreadCount: 0,
      online: false,
      location: "Agricultural Office, Polonnaruwa",
    },
    {
      id: "5",
      name: "Southern Paddy Corp",
      role: "mill",
      avatar: "",
      lastMessage: "Thank you for your delivery. Payment processed.",
      lastMessageTime: "Dec 22",
      unreadCount: 0,
      online: true,
      location: "Hambantota",
    },
  ];

  const messages: Record<string, Message[]> = {
    "1": [
      {
        id: 1,
        senderId: "1",
        text: "Hello! We're interested in buying your paddy harvest.",
        timestamp: "9:00 AM",
        type: "text",
        isRead: true,
      },
      {
        id: 2,
        senderId: "me",
        text: "Hi! I have about 5 tons of BG 300 ready for sale.",
        timestamp: "9:15 AM",
        type: "text",
        isRead: true,
      },
      {
        id: 3,
        senderId: "1",
        text: "Great! What's the quality grade?",
        timestamp: "9:20 AM",
        type: "text",
        isRead: true,
      },
      {
        id: 4,
        senderId: "me",
        text: "Grade A, moisture content is 14%",
        timestamp: "9:25 AM",
        type: "text",
        isRead: true,
      },
      {
        id: 5,
        senderId: "1",
        text: "Perfect! We offer LKR 85/kg for Grade A BG 300.",
        timestamp: "9:30 AM",
        type: "text",
        isRead: true,
      },
      {
        id: 6,
        senderId: "1",
        text: "We can pick up your paddy tomorrow morning",
        timestamp: "10:30 AM",
        type: "text",
        isRead: false,
      },
    ],
    "2": [
      {
        id: 1,
        senderId: "me",
        text: "Sir, I noticed some brown spots on my rice leaves. Can you help identify?",
        timestamp: "Yesterday, 2:00 PM",
        type: "text",
        isRead: true,
      },
      {
        id: 2,
        senderId: "me",
        text: "",
        timestamp: "Yesterday, 2:01 PM",
        type: "image",
        isRead: true,
        imageUrl: "/placeholder.svg",
      },
      {
        id: 3,
        senderId: "2",
        text: "Let me analyze this image...",
        timestamp: "Yesterday, 2:15 PM",
        type: "text",
        isRead: true,
      },
      {
        id: 4,
        senderId: "2",
        text: "",
        timestamp: "Yesterday, 2:20 PM",
        type: "disease-query",
        isRead: true,
        diseaseData: { disease: "Brown Spot", confidence: 94 },
      },
      {
        id: 5,
        senderId: "2",
        text: "The disease looks like Brown Spot. Apply fungicide immediately. I recommend Tricyclazole 75% WP at 0.6g per liter.",
        timestamp: "Yesterday, 2:22 PM",
        type: "text",
        isRead: true,
      },
    ],
    "3": [
      {
        id: 1,
        senderId: "3",
        text: "Good morning! Are you interested in selling your harvest?",
        timestamp: "Yesterday, 8:00 AM",
        type: "text",
        isRead: true,
      },
      {
        id: 2,
        senderId: "me",
        text: "Yes, I have red rice (AT 362) available",
        timestamp: "Yesterday, 8:30 AM",
        type: "text",
        isRead: true,
      },
      {
        id: 3,
        senderId: "3",
        text: "Current buying price is LKR 83/kg for Grade A",
        timestamp: "Yesterday, 8:45 AM",
        type: "text",
        isRead: false,
      },
    ],
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedContact) {
      // In a real app, this would send the message to the backend
      console.log("Sending message:", messageInput, "to:", selectedContact.id);
      setMessageInput("");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "mill":
        return Building2;
      case "officer":
        return User;
      default:
        return Leaf;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "mill":
        return "from-amber-500 to-orange-600";
      case "officer":
        return "from-blue-500 to-indigo-600";
      default:
        return "from-emerald-500 to-teal-600";
    }
  };

  return (
    <div className="h-full min-h-0 bg-background">
      {/* Main Content */}
      <main className="mx-auto px-4 py-6 h-full min-h-0 flex flex-col">
        <div className="mx-auto h-full min-h-0 flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
            {/* Contacts List */}
            <Card className="border-border lg:col-span-1 flex flex-col min-h-0 h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-3">
                  <CardTitle className="text-lg">Conversations</CardTitle>
                  <Badge variant="secondary">
                    {contacts.filter((c) => c.unreadCount > 0).length} new
                  </Badge>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full">
                  <div className="space-y-1 p-3">
                    {filteredContacts.map((contact) => {
                      const RoleIcon = getRoleIcon(contact.role);
                      return (
                        <div
                          key={contact.id}
                          className={`p-3 rounded-xl cursor-pointer transition-all ${
                            selectedContact?.id === contact.id
                              ? "bg-primary/10 border border-primary/20"
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() => setSelectedContact(contact)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={contact.avatar} />
                                <AvatarFallback
                                  className={`bg-linear-to-br ${getRoleColor(contact.role)} text-white`}
                                >
                                  <RoleIcon className="w-5 h-5" />
                                </AvatarFallback>
                              </Avatar>
                              {contact.online && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-foreground truncate">
                                  {contact.name}
                                </h4>
                                <span className="text-xs text-muted-foreground">
                                  {contact.lastMessageTime}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="text-xs px-1.5 py-0"
                                >
                                  {contact.role === "mill"
                                    ? "Mill"
                                    : contact.role === "officer"
                                      ? "Officer"
                                      : "Farmer"}
                                </Badge>
                                {contact.location && (
                                  <span className="text-xs text-muted-foreground truncate">
                                    {contact.location}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate mt-1">
                                {contact.lastMessage}
                              </p>
                            </div>
                            {contact.unreadCount > 0 && (
                              <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
                                {contact.unreadCount}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="border-border lg:col-span-2 flex flex-col min-h-0 h-full">
              {selectedContact ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="pb-3 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback
                            className={`bg-linear-to-br ${getRoleColor(selectedContact.role)} text-white`}
                          >
                            {(() => {
                              const Icon = getRoleIcon(selectedContact.role);
                              return <Icon className="w-5 h-5" />;
                            })()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {selectedContact.name}
                          </h4>
                          <div className="flex items-center gap-2">
                            {selectedContact.online ? (
                              <span className="text-xs text-success flex items-center gap-1">
                                <span className="w-2 h-2 bg-success rounded-full" />
                                Online
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Offline
                              </span>
                            )}
                            {selectedContact.location && (
                              <span className="text-xs text-muted-foreground">
                                • {selectedContact.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Video className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 overflow-hidden p-0">
                    <ScrollArea className="h-full p-4">
                      <div className="space-y-4">
                        {messages[selectedContact.id]?.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.senderId === "me" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-2xl p-3 ${
                                message.senderId === "me"
                                  ? "bg-primary text-primary-foreground rounded-br-sm"
                                  : "bg-muted rounded-bl-sm"
                              }`}
                            >
                              {message.type === "text" && (
                                <p className="text-sm">{message.text}</p>
                              )}
                              {message.type === "image" && (
                                <div className="space-y-2">
                                  <img
                                    src={message.imageUrl}
                                    alt="Shared image"
                                    className="rounded-lg max-w-full h-auto"
                                  />
                                  {message.text && (
                                    <p className="text-sm">{message.text}</p>
                                  )}
                                </div>
                              )}
                              {message.type === "disease-query" &&
                                message.diseaseData && (
                                  <div className="p-3 rounded-lg bg-background/10 border border-background/20">
                                    <div className="flex items-center gap-2 mb-2">
                                      <AlertCircle className="w-4 h-4" />
                                      <span className="font-semibold text-sm">
                                        Disease Detection Result
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm">
                                        {message.diseaseData.disease}
                                      </span>
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {message.diseaseData.confidence}%
                                        confidence
                                      </Badge>
                                    </div>
                                  </div>
                                )}
                              <div
                                className={`flex items-center gap-1 mt-1 ${
                                  message.senderId === "me"
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                              >
                                <span className="text-xs opacity-70">
                                  {message.timestamp}
                                </span>
                                {message.senderId === "me" && (
                                  <CheckCheck
                                    className={`w-3 h-3 ${message.isRead ? "text-blue-400" : "opacity-70"}`}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>

                  {/* Message Input */}
                  <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Camera className="w-4 h-4" />
                      </Button>
                      <Input
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
                        className="flex-1"
                      />
                      <Button variant="ghost" size="icon">
                        <Smile className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        className="bg-linear-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90"
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim()}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      💡 Tip: You can send disease images directly to
                      agricultural officers for expert advice
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center">
                      <MessageSquare className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        Select a conversation
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Chat with paddy mills or agricultural officers
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Badge variant="outline" className="gap-1">
                        <Building2 className="w-3 h-3" />
                        Paddy Mills
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <User className="w-3 h-3" />
                        Agri Officers
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Camera className="w-3 h-3" />
                        Send Disease Images
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertCircle,
  Camera,
  CheckCheck,
  MessageSquare,
  MoreVertical,
  Paperclip,
  Phone,
  Send,
  Smile,
  Video,
} from "lucide-react";

type Contact = {
  id: string;
  name: string;
  location: string;
  status: "online" | "offline";
};

type DiseaseData = {
  disease: string;
  confidence: number;
};

type Message = {
  id: string;
  senderId: "me" | "contact";
  type: "text" | "image" | "disease-query";
  text?: string;
  imageUrl?: string;
  diseaseData?: DiseaseData;
  timestamp: string;
  isRead?: boolean;
};

const mockSelectedContact: Contact = {
  id: "1",
  name: "Kavishka Sulochana",
  location: "Elpitiya",
  status: "online",
};

const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "m1",
      senderId: "contact",
      type: "text",
      text: "Good morning! I checked the fields today.",
      timestamp: "9:40 AM",
      isRead: true,
    },
    {
      id: "m2",
      senderId: "contact",
      type: "disease-query",
      diseaseData: { disease: "Leaf blast", confidence: 87 },
      text: "Can you advise on treatment?",
      timestamp: "9:42 AM",
      isRead: true,
    },
    {
      id: "m3",
      senderId: "me",
      type: "text",
      text: "Apply tricyclazole and monitor for 48 hours.",
      timestamp: "9:44 AM",
      isRead: true,
    },
    {
      id: "m4",
      senderId: "me",
      type: "image",
      imageUrl:
        "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80",
      text: "Use this guideline for identification.",
      timestamp: "9:45 AM",
      isRead: true,
    },
    {
      id: "m5",
      senderId: "contact",
      type: "text",
      text: "Good morning! I checked the fields today.",
      timestamp: "9:40 AM",
      isRead: true,
    },
    {
      id: "m6",
      senderId: "contact",
      type: "disease-query",
      diseaseData: { disease: "Leaf blast", confidence: 87 },
      text: "Can you advise on treatment?",
      timestamp: "9:42 AM",
      isRead: true,
    },
    {
      id: "m7",
      senderId: "me",
      type: "text",
      text: "Apply tricyclazole and monitor for 48 hours.",
      timestamp: "9:44 AM",
      isRead: true,
    },
  ],
};

const ChatContent = () => {
  const selectedContact = mockSelectedContact;
  const messages = mockMessages;

  return (
    <Card className="lg:col-span-2 h-full min-h-0 flex flex-col overflow-hidden">
      {selectedContact ? (
        <>
          {/* Chat Header */}
          <CardHeader className="pb-3 border-b border-border shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>
                    {selectedContact.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-foreground">
                    {selectedContact.name}
                  </h4>
                  <div className="flex items-center gap-2">
                    {selectedContact.status === "online" ? (
                      <span className="text-xs text-success flex items-center gap-1">
                        <span className="w-2 h-2 bg-success rounded-full" />
                        Online
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="w-2 h-2 bg-muted-foreground rounded-full" />
                        Offline
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {selectedContact.location}
                    </span>
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
          <CardContent className="flex-1 min-h-0 overflow-hidden p-0">
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
                              <Badge variant="secondary" className="text-xs">
                                {message.diseaseData.confidence}% confidence
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
          <div className="p-4 border-t border-border shrink-0">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Camera className="w-4 h-4" />
              </Button>
              <Input placeholder="Type a message..." className="flex-1" />
              <Button variant="ghost" size="icon">
                <Smile className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                className="bg-linear-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              💡 Tip: You can send disease images directly to agricultural
              officers for expert advice
            </p>
          </div>
        </>
      ) : (
        <div className="flex-1 min-h-0 flex items-center justify-center">
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
          </div>
        </div>
      )}
    </Card>
  );
};

export default ChatContent;

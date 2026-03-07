"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  BellOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "alert" | "market" | "message" | "system";
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "alert",
    title: "Disease Alert: Bacterial Leaf Blight",
    description:
      "High risk detected in your Kandy district. Take preventive measures.",
    time: "5 minutes ago",
    read: false,
  },
  {
    id: "2",
    type: "market",
    title: "Rice Price Update",
    description: "Nadu rice prices increased by 8% in Colombo market.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "3",
    type: "message",
    title: "New Message from Agricultural Officer",
    description: "Your farm inspection has been scheduled for next week.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "4",
    type: "system",
    title: "Scan Report Ready",
    description: "Your disease detection scan from yesterday is now available.",
    time: "5 hours ago",
    read: true,
  },
  {
    id: "5",
    type: "alert",
    title: "Weather Warning",
    description: "Heavy rainfall expected in your area for the next 3 days.",
    time: "1 day ago",
    read: true,
  },
  {
    id: "6",
    type: "market",
    title: "New Buyer Request",
    description: "A rice mill in Kurunegala is interested in your harvest.",
    time: "2 days ago",
    read: true,
  },
];

const Notifications = () => {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case "market":
        return <TrendingUp className="w-5 h-5 text-primary" />;
      case "message":
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case "system":
        return <Calendar className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getBadgeVariant = (type: Notification["type"]) => {
    switch (type) {
      case "alert":
        return "destructive";
      case "market":
        return "default";
      case "message":
        return "secondary";
      case "system":
        return "outline";
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.read;
    return n.type === activeTab;
  });

  return (
    <div className="min-h-screen bg-background flex">
      <main className="flex-1 ml-64 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                Notifications
              </h1>
              <p className="text-muted-foreground mt-1">
                Stay updated with alerts, market prices, and messages
              </p>
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-sm">
                  {unreadCount} unread
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark all read
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-12 grid-cols-5 lg:inline-flex">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="alert">Alerts</TabsTrigger>
              <TabsTrigger value="market">Market</TabsTrigger>
              <TabsTrigger value="message">Messages</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {filteredNotifications.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <BellOff className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground">
                      No notifications
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      You&apos;re all caught up!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={cn(
                        "transition-all hover:shadow-md cursor-pointer",
                        !notification.read && "border-primary/50 bg-primary/5",
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-foreground truncate">
                                {notification.title}
                              </h3>
                              <Badge
                                variant={getBadgeVariant(notification.type)}
                                className="text-xs"
                              >
                                {notification.type}
                              </Badge>
                              {!notification.read && (
                                <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {notification.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {notification.time}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Notifications;

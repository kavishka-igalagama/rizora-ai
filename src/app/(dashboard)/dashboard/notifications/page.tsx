"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
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
import { getPusherClient } from "@/lib/pusher-client";

interface Notification {
  id: string;
  type: "alert" | "market" | "message" | "system";
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
  metadata?: {
    scanId?: string;
    disease?: string;
    confidence?: number;
    imageUrl?: string;
  };
}

type NotificationsUpdatedEvent = {
  unreadCount?: number;
};

const formatRelativeTime = (timestamp: string) => {
  const created = new Date(timestamp).getTime();
  if (Number.isNaN(created)) {
    return "just now";
  }

  const seconds = Math.max(0, Math.floor((Date.now() - created) / 1000));
  if (seconds < 60) {
    return "just now";
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  return new Date(created).toLocaleDateString();
};

const Notifications = () => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/notifications", {
        method: "GET",
        cache: "no-store",
      });

      const data = (await response.json()) as
        | { notifications: Notification[]; unreadCount: number }
        | { error?: string };

      if (!response.ok || !("notifications" in data)) {
        const apiError = "error" in data ? data.error : undefined;
        throw new Error(apiError || "Failed to load notifications.");
      }

      setNotifications(data.notifications);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load notifications.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const pusher = getPusherClient();
    const channelName = `private-user-${user.id}`;
    const channel = pusher.subscribe(channelName);

    const handleNewNotification = (payload: Notification) => {
      setNotifications((prev) => [payload, ...prev]);
    };

    const handleNotificationsUpdated = (
      _payload: NotificationsUpdatedEvent,
    ) => {
      void loadNotifications();
    };

    channel.bind("notification:new", handleNewNotification);
    channel.bind("notification:updated", handleNotificationsUpdated);

    return () => {
      channel.unbind("notification:new", handleNewNotification);
      channel.unbind("notification:updated", handleNotificationsUpdated);
      pusher.unsubscribe(channelName);
    };
  }, [loadNotifications, user?.id]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("notifications-unread-count-changed", {
        detail: { total: unreadCount },
      }),
    );
  }, [unreadCount]);

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

  const markAsRead = async (id: string) => {
    const target = notifications.find((notification) => notification.id === id);
    if (!target || target.read) {
      return;
    }

    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark notification as read.");
      }
    } catch (error) {
      console.error("Failed to mark notification as read", error);
      void loadNotifications();
    }
  };

  const markAllAsRead = async () => {
    if (!notifications.some((notification) => !notification.read)) {
      return;
    }

    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true })),
    );

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark notifications as read.");
      }
    } catch (error) {
      console.error("Failed to mark notifications as read", error);
      void loadNotifications();
    }
  };

  const deleteNotification = async (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );

    try {
      const response = await fetch(
        `/api/notifications?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete notification.");
      }
    } catch (error) {
      console.error("Failed to delete notification", error);
      void loadNotifications();
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.read;
    return n.type === activeTab;
  });

  return (
    <div className="min-h-screen bg-background flex">
      <main className="flex-1 p-6">
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
              {isLoading ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <span className="text-sm text-muted-foreground">
                      Loading notifications...
                    </span>
                  </CardContent>
                </Card>
              ) : errorMessage ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <span className="text-sm text-destructive">
                      {errorMessage}
                    </span>
                  </CardContent>
                </Card>
              ) : filteredNotifications.length === 0 ? (
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
                        "transition-all hover:shadow-md",
                        !notification.read && "border-primary/50 bg-primary/5",
                      )}
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
                              {formatRelativeTime(notification.createdAt)}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-primary"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() =>
                                deleteNotification(notification.id)
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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

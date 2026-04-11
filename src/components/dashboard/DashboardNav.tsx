"use client";

import Link from "next/link";
import { UserButton, useClerk, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  BookOpen,
  Calendar,
  DollarSign,
  LayoutDashboard,
  Leaf,
  MessageSquare,
  Microscope,
  Package,
  Settings,
  TrendingUp,
} from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { getPusherClient } from "@/lib/pusher-client";

interface DashboardNavProps {
  role: "farmer" | "mill" | "officer";
  userName?: string;
  onCloseMobile?: () => void;
  isMobileMenuOpen?: boolean;
}

type NavLink = {
  href: string;
  label: string;
  icon: ReactNode;
  divider?: boolean;
};

type ChatMessageEvent = {
  senderId?: string;
  recipientId?: string;
};

export default function DashboardNav({
  role,
  userName,
  onCloseMobile,
  isMobileMenuOpen,
}: DashboardNavProps) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  const canUseChat = role === "farmer" || role === "mill";

  const fetchChatUnreadCount = useCallback(async () => {
    if (!canUseChat || !user?.id) {
      setChatUnreadCount(0);
      return;
    }

    try {
      const response = await fetch("/api/chat/contacts", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch chat unread count");
      }

      const data = (await response.json()) as {
        contacts?: Array<{ unreadCount?: number }>;
      };

      const total = (data.contacts || []).reduce(
        (sum, contact) => sum + (contact.unreadCount || 0),
        0,
      );

      setChatUnreadCount(total);
    } catch (error) {
      console.error("Failed to fetch sidebar chat unread count", error);
    }
  }, [canUseChat, user?.id]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    void fetchChatUnreadCount();
  }, [fetchChatUnreadCount, isLoaded]);

  useEffect(() => {
    if (!pathname.startsWith("/dashboard/chat")) {
      return;
    }

    // Keep sidebar badge in sync after opening/reading conversations.
    void fetchChatUnreadCount();
  }, [fetchChatUnreadCount, pathname]);

  useEffect(() => {
    if (!canUseChat || !user?.id) {
      return;
    }

    const pusher = getPusherClient();
    const channelName = `private-user-${user.id}`;
    const channel = pusher.subscribe(channelName);

    const refreshUnreadCount = () => {
      void fetchChatUnreadCount();
    };

    const handleNewMessage = (payload: ChatMessageEvent) => {
      if (payload.recipientId === user.id) {
        setChatUnreadCount((prev) => prev + 1);
      }

      // Keep count authoritative in case optimistic update diverges.
      setTimeout(() => {
        void fetchChatUnreadCount();
      }, 250);
    };

    channel.bind("new-message", handleNewMessage);
    channel.bind("messages-read", refreshUnreadCount);

    return () => {
      channel.unbind("new-message", handleNewMessage);
      channel.unbind("messages-read", refreshUnreadCount);
      pusher.unsubscribe(channelName);
    };
  }, [canUseChat, fetchChatUnreadCount, user?.id]);

  useEffect(() => {
    const handleUnreadCountChanged = (event: Event) => {
      const customEvent = event as CustomEvent<{ total?: number }>;
      setChatUnreadCount(customEvent.detail?.total || 0);
    };

    window.addEventListener(
      "chat-unread-count-changed",
      handleUnreadCountChanged,
    );

    return () => {
      window.removeEventListener(
        "chat-unread-count-changed",
        handleUnreadCountChanged,
      );
    };
  }, []);

  const farmerLinks: NavLink[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "Disease Detection",
      href: "/dashboard/disease-detect",
      icon: <Microscope className="h-5 w-5" />,
    },
    {
      label: "Paddy Records",
      href: "/dashboard/paddy-records",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      label: "Market Prices",
      href: "/dashboard/market-prices",
      icon: <TrendingUp className="h-5 w-5" />,
    },
  ];

  const millLinks: NavLink[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      href: "/dashboard/pricing",
      label: "Price Management",
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      href: "/dashboard/paddy-collections",
      label: "Paddy Collections",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      href: "/dashboard/purchase-records",
      label: "Purchase Records",
      icon: <Package className="h-5 w-5" />,
    },
  ];

  const officerLinks: NavLink[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "Disease Detection",
      href: "/dashboard/disease-detect",
      icon: <Microscope className="h-5 w-5" />,
    },
  ];

  const commonLinks: NavLink[] = [
    {
      label: "Communication Hub",
      href: "/dashboard/chat",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      href: "/dashboard/notifications",
      label: "Notifications",
      icon: <Bell className="h-5 w-5" />,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const links =
    role === "farmer"
      ? farmerLinks
      : role === "mill"
        ? millLinks
        : role === "officer"
          ? officerLinks
          : [];

  const getUnreadForLink = (href: string) => {
    if (href === "/dashboard/chat") {
      return chatUnreadCount;
    }

    return 0;
  };

  const handleLinkClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 shadow-xl lg:shadow-none">
      {/* Logo/Header */}
      <div className="flex items-center justify-between h-18 px-4 border-b border-gray-200">
        <div className="flex gap-3">
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
            <div className="relative w-10 h-10 rounded-xl bg-linear-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-display font-bold text-lg text-foreground truncate">
              Rizora
            </span>
            <span className="text-xs text-muted-foreground truncate">
              Smart Farming
            </span>
          </div>
        </div>

        {/* Mobile Close Button */}
        {isMobileMenuOpen && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="mb-3 px-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Main Menu
          </span>
        </div>
        {links.map((link) => {
          const isActive = pathname === link.href;
          const unreadCount = getUnreadForLink(link.href);
          return (
            <div key={link.href}>
              {link.divider && (
                <div className="border-t border-gray-100 my-2" />
              )}
              <Link
                href={link.href}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <span className="shrink-0">{link.icon}</span>
                <span className="font-medium text-sm flex-1 truncate">
                  {link.label}
                </span>
                {Boolean(unreadCount) && (
                  <Badge
                    className={`h-5 min-w-5 rounded-full px-1.5 text-[11px] ${
                      isActive
                        ? "bg-primary-foreground text-primary"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="px-3 py-3 border-t border-gray-100 space-y-3">
        {commonLinks.map((link) => {
          const isActive = pathname === link.href;
          const unreadCount = getUnreadForLink(link.href);
          return (
            <div key={link.href}>
              {link.divider && (
                <div className="border-t border-gray-100 my-2" />
              )}
              <Link
                href={link.href}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <span className="shrink-0">{link.icon}</span>
                <span className="font-medium text-sm flex-1 truncate">
                  {link.label}
                </span>
                {Boolean(unreadCount) && (
                  <Badge
                    className={`h-5 min-w-5 rounded-full px-1.5 text-[11px] ${
                      isActive
                        ? "bg-primary-foreground text-primary"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Link>
            </div>
          );
        })}

        <div className="px-3 py-3 border-t border-gray-100 space-y-3" />

        <div className="flex items-center gap-2">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-700 truncate">
              {userName || "User"}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {role === "farmer"
                ? "Farmer"
                : role === "mill"
                  ? "Mill"
                  : role === "officer"
                    ? "Officer"
                    : ""}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => signOut()}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors font-medium text-sm cursor-pointer"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Sign out
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { Bell, Loader2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";

type NotificationBellProps = {
  role: "provider" | "gcc";
  isScrolled: boolean;
};

function formatTimestamp(timestamp: number) {
  const diff = Date.now() - timestamp;
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.max(1, Math.floor(diff / 60_000))}m ago`;
  if (diff < 86_400_000) return `${Math.max(1, Math.floor(diff / 3_600_000))}h ago`;
  if (diff < 604_800_000) return `${Math.max(1, Math.floor(diff / 86_400_000))}d ago`;

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(timestamp);
}

export function NotificationBell({ role, isScrolled }: NotificationBellProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const notifications = useQuery(api.notifications.listMine, { limit: 15 });
  const unreadCount = useQuery(api.notifications.getUnreadCount);
  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handlePointerDown);
      return () => document.removeEventListener("mousedown", handlePointerDown);
    }
  }, [open]);

  const unreadLabel = useMemo(() => {
    if (!unreadCount) return null;
    return unreadCount > 99 ? "99+" : String(unreadCount);
  }, [unreadCount]);

  const buttonClasses = isScrolled
    ? "text-enterprise-600 hover:text-enterprise-900 hover:bg-enterprise-100"
    : "text-white/80 hover:text-white hover:bg-white/10";

  const panelRoleLabel = role === "provider" ? "Provider" : "GCC";

  const handleOpenNotification = async (notificationId: string, link: string, isUnread: boolean) => {
    try {
      if (isUnread) {
        await markRead({ notification_id: notificationId as never });
      }
    } finally {
      setOpen(false);
      router.push(link);
    }
  };

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    try {
      await markAllRead({});
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Open notifications"
        onClick={() => setOpen((current) => !current)}
        className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors ${buttonClasses}`}
      >
        <Bell className="h-5 w-5" />
        {unreadLabel ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-white">
            {unreadLabel}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full mt-3 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-enterprise-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-enterprise-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-enterprise-900">{panelRoleLabel} notifications</p>
              <p className="text-xs text-enterprise-500">Latest updates across your dashboard</p>
            </div>
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={!unreadCount || isMarkingAll}
              className="text-xs font-medium text-primary disabled:cursor-not-allowed disabled:text-enterprise-300"
            >
              {isMarkingAll ? "Updating..." : "Mark all as read"}
            </button>
          </div>

          <div className="max-h-[28rem] overflow-y-auto">
            {notifications === undefined || unreadCount === undefined ? (
              <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-enterprise-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-enterprise-500">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notification) => {
                const isUnread = !notification.read_at;

                return (
                  <button
                    key={notification._id}
                    type="button"
                    onClick={() =>
                      handleOpenNotification(
                        notification._id,
                        notification.link,
                        isUnread
                      )
                    }
                    className={`block w-full border-b border-enterprise-100 px-4 py-3 text-left transition-colors last:border-b-0 ${
                      isUnread ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-enterprise-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-enterprise-900">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-sm leading-5 text-enterprise-600">
                          {notification.body}
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] font-medium text-enterprise-400">
                        {formatTimestamp(notification.created_at)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  getNotifications,
  markNotificationRead,
} from "@/lib/firebase/firestore";
import { formatDistanceToNow } from "@/lib/utils";
import type { Notification } from "@/types";

const NOTIF_ICONS: Record<Notification["type"], string> = {
  "skill-match": "🎯",
  upvote: "⬆️",
  solved: "✅",
  reply: "💬",
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getNotifications(user.uid).then((notifs) => {
      setNotifications(notifs);
      setLoading(false);
    });
  }, [user]);

  async function handleRead(notif: Notification) {
    if (notif.read) return;
    await markNotificationRead(notif.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)),
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="h-6 w-6" />
        <h1 className="text-xl font-bold">Notifikasi</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !notifications.length ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-4xl mb-3">🔔</div>
          <p className="text-muted-foreground text-sm">Belum ada notifikasi</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((notif) => (
            <Link
              key={notif.id}
              href={`/post/${notif.problemId}`}
              onClick={() => handleRead(notif)}
              className={`flex items-start gap-3 rounded-xl border p-4 transition-all hover:border-primary/40 ${
                !notif.read ? "border-primary/30 bg-primary/5" : "bg-card"
              }`}
            >
              <span className="text-xl">{NOTIF_ICONS[notif.type]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{notif.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {notif.problemTitle}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {notif.createdAt?.toDate
                    ? formatDistanceToNow(notif.createdAt.toDate())
                    : ""}
                </p>
              </div>
              {!notif.read && (
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

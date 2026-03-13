"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, Loader2 } from "lucide-react";
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

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Notifikasi</h1>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {unreadCount} belum dibaca
              </p>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
        </div>
      ) : !notifications.length ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center"
        >
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Bell className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">Belum ada notifikasi</p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((notif, i) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <Link
                href={`/post/${notif.problemId}`}
                onClick={() => handleRead(notif)}
                className={`flex items-start gap-3 rounded-2xl border p-4 transition-all hover:shadow-md hover:shadow-primary/5 ${
                  !notif.read
                    ? "border-primary/30 bg-primary/5 hover:border-primary/50"
                    : "bg-card hover:border-primary/40"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
                    !notif.read ? "bg-primary/10" : "bg-muted"
                  }`}
                >
                  <span className="text-lg">{NOTIF_ICONS[notif.type]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notif.read ? "font-medium" : ""}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {notif.problemTitle}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    {notif.createdAt?.toDate
                      ? formatDistanceToNow(notif.createdAt.toDate())
                      : ""}
                  </p>
                </div>
                {!notif.read && (
                  <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5 shrink-0 animate-pulse" />
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

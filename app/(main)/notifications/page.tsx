"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getNotifications,
  markNotificationRead,
} from "@/lib/firebase/firestore";
import { formatDistanceToNow } from "@/lib/utils";
import type { Notification } from "@/types";
import { useRouter } from "next/navigation";

const NOTIF_ICONS: Record<Notification["type"], string> = {
  "skill-match": "🎯",
  upvote: "⬆️",
  solved: "✅",
  reply: "💬",
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
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
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <button 
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-white/5 text-slate-400 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 border border-amber-400/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <Bell className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Notifikasi</h1>
            {unreadCount > 0 ? (
              <p className="text-xs text-amber-400 font-bold">
                {unreadCount} pesan baru 🌙
              </p>
            ) : (
              <p className="text-xs text-slate-500 font-medium">Semua sudah terbaca</p>
            )}
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-amber-400/50" />
        </div>
      ) : !notifications.length ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 py-24 text-center backdrop-blur-sm"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
            <Sparkles className="h-8 w-8 text-slate-600" />
          </div>
          <p className="text-slate-400 font-medium tracking-tight">Belum ada aktivitas baru di sini.</p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3">
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
                className={`group flex items-start gap-4 rounded-2xl border transition-all duration-300 p-4 backdrop-blur-sm shadow-lg ${
                  !notif.read
                    ? "border-amber-400/30 bg-amber-400/5 hover:border-amber-400/50"
                    : "border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10"
                }`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl shrink-0 transition-colors ${
                    !notif.read ? "bg-amber-400/20 border border-amber-400/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]" : "bg-white/5 border border-white/10 group-hover:bg-white/10"
                  }`}
                >
                  <span className="text-xl">{NOTIF_ICONS[notif.type]}</span>
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <p className={`text-sm leading-tight ${!notif.read ? "font-bold text-white" : "text-slate-300"}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 truncate font-medium">
                    {notif.problemTitle}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-1.5 font-bold uppercase tracking-wider">
                    {notif.createdAt?.toDate
                      ? formatDistanceToNow(notif.createdAt.toDate())
                      : "Baru saja"}
                  </p>
                </div>
                {!notif.read && (
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400 mt-2.5 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse" />
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

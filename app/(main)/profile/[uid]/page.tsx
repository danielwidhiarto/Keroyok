"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import SkillBadge from "@/components/SkillBadge";
import { cn } from "@/lib/utils";
import { getUserProfile } from "@/lib/firebase/firestore";
import { getLevelFromRep, getNextLevel } from "@/constants/levels";
import { useAuth } from "@/contexts/AuthContext";
import type { UserProfile } from "@/types";
import { Settings, Loader2, Zap } from "lucide-react";

export default function ProfilePage() {
  const params = useParams();
  const uid = params.uid as string;
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserProfile(uid).then((p) => {
      setProfile(p);
      setLoading(false);
    });
  }, [uid]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400/50" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-24 text-slate-400">
        User tidak ditemukan.
      </div>
    );
  }

  const level = getLevelFromRep(profile.reputation);
  const nextLevel = getNextLevel(profile.reputation);
  const progressToNext = nextLevel
    ? Math.round(
        ((profile.reputation - level.minRep) /
          (nextLevel.minRep - level.minRep)) *
          100,
      )
    : 100;
  const isOwn = user?.uid === uid;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md overflow-hidden"
      >
        {/* Gradient header */}
        <div className="h-28 bg-gradient-to-br from-amber-400/20 via-amber-400/5 to-transparent border-b border-white/5" />

        <div className="px-6 pb-6 -mt-10">
          <div className="flex items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <Avatar className="h-20 w-20 ring-4 ring-[#08111e]">
                <AvatarImage src={profile.photoURL ?? undefined} />
                <AvatarFallback className="text-2xl bg-amber-400/20 text-amber-400 font-bold">
                  {profile.displayName?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="pb-1">
                <h1 className="text-xl font-bold text-white">{profile.displayName}</h1>
                <p className={`text-sm font-medium mt-0.5 flex items-center gap-1.5 ${level.color}`}>
                  {level.emoji} {level.name}
                </p>
              </div>
            </div>
            {isOwn ? (
              <Link
                href="/profile/settings"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "rounded-xl border-white/10 bg-white/5 text-slate-300 hover:text-white"
                )}
              >
                <Settings className="h-4 w-4 mr-1.5 opacity-60" />
                Edit
              </Link>
            ) : (
              <div className="flex gap-2">
                <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 flex items-center gap-1.5 backdrop-blur-sm">
                  <Zap className="h-4 w-4 text-amber-400 fill-amber-400/20" />
                  <span className="text-sm font-bold text-amber-300">{profile.reputation} pts</span>
                </div>
              </div>
            )}
          </div>

          {/* Reputation Info */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 flex items-center gap-1.5">
                Progres Reputasi <span className="opacity-50">·</span> {level.name}
              </span>
              <span className="font-bold text-amber-400">{profile.reputation} / {nextLevel?.minRep ?? 'MAX'} pts</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden border border-white/5 p-[1px]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                initial={{ width: 0 }}
                animate={{ width: `${progressToNext}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            {nextLevel && (
              <p className="text-[11px] text-slate-500 text-right italic">
                {nextLevel.minRep - profile.reputation} pts lagi ke {nextLevel.emoji} {nextLevel.name}
              </p>
            )}
          </div>

          {/* Skills Area */}
          {profile.skills.length > 0 && (
            <div className="mt-6 pt-6 border-t border-white/5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                Top Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((tag) => (
                  <SkillBadge key={tag} skill={tag} />
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs text-slate-500 mb-1">Total Solusi</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">0</span>
            <span className="text-[10px] text-slate-400 border border-white/10 px-1.5 rounded-sm">Verified</span>
          </div>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs text-slate-500 mb-1">Masalah Terbantu</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">0</span>
            <span className="text-[10px] text-slate-400 border border-white/10 px-1.5 rounded-sm">Monthly</span>
          </div>
        </div>
      </div>
    </div>
  );
}

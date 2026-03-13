"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SkillBadge from "@/components/SkillBadge";
import { getTopHelpers } from "@/lib/firebase/firestore";
import { getLevelFromRep } from "@/constants/levels";
import { useAuth } from "@/contexts/AuthContext";
import type { UserProfile } from "@/types";
import { Trophy, Loader2, Crown, Medal } from "lucide-react";

const RANK_STYLE = [
  {
    medal: "🥇",
    ring: "ring-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]",
    bg: "border-amber-400/40 bg-gradient-to-br from-amber-400/20 via-amber-400/5 to-transparent",
    accent: "text-amber-300",
  },
  {
    medal: "🥈",
    ring: "ring-slate-300",
    bg: "border-slate-300/30 bg-gradient-to-br from-slate-300/15 via-slate-300/5 to-transparent",
    accent: "text-slate-100",
  },
  {
    medal: "🥉",
    ring: "ring-orange-400",
    bg: "border-orange-400/30 bg-gradient-to-br from-orange-400/15 via-orange-400/5 to-transparent",
    accent: "text-orange-200",
  },
];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [helpers, setHelpers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopHelpers().then((users) => {
      setHelpers(users);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 border border-amber-400/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
          <Trophy className="h-6 w-6 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Leaderboard</h1>
          <p className="text-xs text-slate-400 font-medium">Top helpers komunitas Keroyok 🌙</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {helpers.map((helper, index) => {
            const level = getLevelFromRep(helper.reputation);
            const isCurrentUser = user?.uid === helper.uid;
            const rankStyle = RANK_STYLE[index];
            const isTop3 = index < 3;

            return (
              <motion.div
                key={helper.uid}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Link href={`/profile/${helper.uid}`}>
                  <div
                    className={`flex items-center gap-4 rounded-2xl border transition-all duration-300 p-4 backdrop-blur-sm ${
                      isTop3
                        ? rankStyle.bg
                        : isCurrentUser
                          ? "border-amber-400/40 bg-amber-400/10 shadow-[0_0_20px_rgba(245,158,11,0.05)]"
                          : "border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <div className="w-8 text-center shrink-0">
                      {isTop3 ? (
                        <span className="text-2xl">{rankStyle.medal}</span>
                      ) : (
                        <span className="text-sm font-bold text-muted-foreground">
                          #{index + 1}
                        </span>
                      )}
                    </div>

                    <Avatar
                      className={`h-11 w-11 ${isTop3 ? `ring-2 ${rankStyle.ring}` : ""}`}
                    >
                      <AvatarImage src={helper.photoURL ?? undefined} />
                      <AvatarFallback>
                        {helper.displayName?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm truncate">
                          {helper.displayName}
                        </p>
                        {isCurrentUser && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                            kamu
                          </span>
                        )}
                      </div>
                      <p className={`text-xs ${level.color}`}>
                        {level.emoji} {level.name}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {helper.skills.slice(0, 3).map((skill) => (
                          <SkillBadge key={skill} skill={skill} />
                        ))}
                        {helper.skills.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{helper.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p
                        className={`text-lg font-bold ${isTop3 ? rankStyle.accent : ""}`}
                      >
                        {helper.reputation}
                      </p>
                      <p className="text-[10px] text-muted-foreground">pts</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

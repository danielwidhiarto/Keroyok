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
    ring: "ring-yellow-400",
    bg: "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200",
    accent: "text-yellow-600",
  },
  {
    medal: "🥈",
    ring: "ring-gray-300",
    bg: "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200",
    accent: "text-gray-500",
  },
  {
    medal: "🥉",
    ring: "ring-amber-600",
    bg: "bg-gradient-to-br from-orange-50 to-amber-50 border-amber-200",
    accent: "text-amber-600",
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
      <div className="flex items-center gap-2.5 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100">
          <Trophy className="h-5 w-5 text-yellow-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Leaderboard</h1>
          <p className="text-xs text-muted-foreground">Top helpers komunitas</p>
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
                    className={`flex items-center gap-4 rounded-2xl border p-4 transition-all hover:shadow-md hover:shadow-primary/5 ${
                      isTop3
                        ? rankStyle.bg
                        : isCurrentUser
                          ? "border-primary bg-primary/5"
                          : "bg-card hover:border-primary/40"
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

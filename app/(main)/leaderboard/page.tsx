"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SkillBadge from "@/components/SkillBadge";
import { getTopHelpers } from "@/lib/firebase/firestore";
import { getLevelFromRep } from "@/constants/levels";
import { useAuth } from "@/contexts/AuthContext";
import type { UserProfile } from "@/types";
import { Trophy, Loader2 } from "lucide-react";

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

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
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="h-6 w-6 text-yellow-500" />
        <h1 className="text-xl font-bold">Leaderboard</h1>
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
            const medal = RANK_MEDALS[index];

            return (
              <Link href={`/profile/${helper.uid}`} key={helper.uid}>
                <div
                  className={`flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm ${
                    isCurrentUser ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <div className="w-8 text-center">
                    {medal ? (
                      <span className="text-2xl">{medal}</span>
                    ) : (
                      <span className="text-lg font-bold text-muted-foreground">
                        #{index + 1}
                      </span>
                    )}
                  </div>

                  <Avatar className="h-10 w-10">
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
                        <span className="text-xs text-primary font-medium">
                          (kamu)
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
                    <p className="text-lg font-bold">{helper.reputation}</p>
                    <p className="text-xs text-muted-foreground">pts</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

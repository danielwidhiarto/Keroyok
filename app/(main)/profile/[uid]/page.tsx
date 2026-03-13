"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import SkillBadge from "@/components/SkillBadge";
import { cn } from "@/lib/utils";
import { getUserProfile } from "@/lib/firebase/firestore";
import { getLevelFromRep, getNextLevel, LEVELS } from "@/constants/levels";
import { useAuth } from "@/contexts/AuthContext";
import type { UserProfile } from "@/types";
import { ExternalLink, Settings, Loader2 } from "lucide-react";

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
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16 text-muted-foreground">
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
      {/* Profile card */}
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.photoURL ?? undefined} />
            <AvatarFallback className="text-xl">
              {profile.displayName?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold">{profile.displayName}</h1>
                <p className={`text-sm font-medium mt-0.5 ${level.color}`}>
                  {level.emoji} {level.name}
                </p>
              </div>
              {isOwn && (
                <Link
                  href="/profile/settings"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                  )}
                >
                  <Settings className="h-4 w-4 mr-1.5" />
                  Edit
                </Link>
              )}
            </div>

            {/* Reputation */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">
                  {profile.reputation} pts
                </span>
                {nextLevel && (
                  <span className="text-xs text-muted-foreground">
                    {nextLevel.emoji} {nextLevel.name} ({nextLevel.minRep} pts)
                  </span>
                )}
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progressToNext}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        {profile.skills.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((skill) => (
                <SkillBadge key={skill} skill={skill} />
              ))}
            </div>
          </div>
        )}

        {/* Mayar tip */}
        {profile.mayarLink && (
          <div className="mt-4">
            <a
              href={profile.mayarLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 hover:bg-amber-100 transition-colors w-fit"
            >
              ☕ Traktir {profile.displayName.split(" ")[0]}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Level progression */}
      <div className="rounded-xl border bg-card p-4">
        <h2 className="font-semibold text-sm mb-3">Perjalanan Level</h2>
        <div className="space-y-2">
          {LEVELS.map((lvl) => (
            <div
              key={lvl.name}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                level.name === lvl.name
                  ? "bg-primary/10 border border-primary/20"
                  : "bg-muted/40"
              }`}
            >
              <span className={`font-medium ${lvl.color}`}>
                {lvl.emoji} {lvl.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {lvl.minRep} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

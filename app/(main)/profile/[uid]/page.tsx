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
import { getLevelFromRep, getNextLevel, LEVELS } from "@/constants/levels";
import { useAuth } from "@/contexts/AuthContext";
import type { UserProfile } from "@/types";
import { ExternalLink, Settings, Loader2, Star } from "lucide-react";

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
        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
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
      {/* Profile card with gradient header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border bg-card overflow-hidden"
      >
        {/* Gradient header */}
        <div className="h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/30" />

        <div className="px-6 pb-6 -mt-10">
          <div className="flex items-end gap-4">
            <Avatar className="h-20 w-20 ring-4 ring-card">
              <AvatarImage src={profile.photoURL ?? undefined} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {profile.displayName?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pb-1">
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
            </div>
          </div>

          {/* Reputation progress */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-5 rounded-xl bg-muted/50 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">
                  {profile.reputation} pts
                </span>
              </div>
              {nextLevel && (
                <span className="text-xs text-muted-foreground">
                  {nextLevel.emoji} {nextLevel.name} ({nextLevel.minRep} pts)
                </span>
              )}
            </div>
            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressToNext}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
              />
            </div>
          </motion.div>

          {/* Skills */}
          {profile.skills.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Skills
              </p>
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
                className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-2.5 text-sm font-medium text-amber-800 hover:from-amber-100 hover:to-yellow-100 transition-all"
              >
                ☕ Traktir {profile.displayName.split(" ")[0]}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>
      </motion.div>

      {/* Level progression */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border bg-card p-5"
      >
        <h2 className="font-semibold text-sm mb-3">Perjalanan Level</h2>
        <div className="space-y-2">
          {LEVELS.map((lvl, i) => (
            <motion.div
              key={lvl.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all ${
                level.name === lvl.name
                  ? "bg-primary/10 border border-primary/20 shadow-sm shadow-primary/5"
                  : "bg-muted/40"
              }`}
            >
              <span className={`font-medium ${lvl.color}`}>
                {lvl.emoji} {lvl.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {lvl.minRep} pts
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

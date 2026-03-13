"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Plus, LogOut, User, Trophy, Settings, Zap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/firebase/auth";
import { getNotifications } from "@/lib/firebase/firestore";
import { getLevelFromRep } from "@/constants/levels";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    getNotifications(user.uid).then((notifs) => {
      setUnreadCount(notifs.filter((n) => !n.read).length);
    });
  }, [user]);

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  const level = profile ? getLevelFromRep(profile.reputation) : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#08111e]/80 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link
          href="/feed"
          className="flex items-center gap-1.5 font-bold text-lg"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/15 border border-amber-400/30">
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <span>Keroyok</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/post/new"
            className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Post Masalah</span>
          </Link>

          <Link
            href="/notifications"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "relative",
            )}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-amber-950 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="h-9 w-9 rounded-full cursor-pointer outline-none ring-2 ring-transparent hover:ring-amber-400/30 transition-all">
              <Avatar className="h-9 w-9">
                <AvatarImage src={profile?.photoURL ?? undefined} />
                <AvatarFallback>
                  {profile?.displayName?.charAt(0)?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{profile?.displayName}</p>
                {level && (
                  <p className="text-xs text-muted-foreground">
                    {level.emoji} {level.name} · {profile?.reputation} pts
                  </p>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link
                  href={`/profile/${user?.uid}`}
                  className="flex items-center w-full"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profil Saya
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/leaderboard" className="flex items-center w-full">
                  <Trophy className="mr-2 h-4 w-4" />
                  Leaderboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href="/profile/settings"
                  className="flex items-center w-full"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Pengaturan
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} variant="destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

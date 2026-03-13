"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Plus, LogOut, User, Trophy, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/firebase/auth";
import { getLevelFromRep } from "@/constants/levels";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { user, profile } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  const level = profile ? getLevelFromRep(profile.reputation) : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link
          href="/feed"
          className="flex items-center gap-1.5 font-bold text-lg"
        >
          <span className="text-2xl">⚡</span>
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
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          >
            <Bell className="h-5 w-5" />
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="h-9 w-9 rounded-full cursor-pointer outline-none">
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

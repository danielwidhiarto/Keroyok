"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { buttonVariants } from "@/components/ui/button";
import PostCard from "@/components/PostCard";
import { getProblems } from "@/lib/firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import type { Problem } from "@/types";
import { Plus, Sparkles } from "lucide-react";

function EmptyState({
  message,
  showCta = false,
}: {
  message: string;
  showCta?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 py-16 text-center backdrop-blur-sm"
    >
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/10 border border-amber-400/20">
        <Sparkles className="h-6 w-6 text-amber-400" />
      </div>
      <p className="text-sm text-slate-400">{message}</p>
      {showCta && (
        <Link
          href="/post/new"
          className={cn(buttonVariants({ size: "sm" }), "mt-5 gap-2 bg-amber-400 text-amber-950 hover:bg-amber-300 transition-colors rounded-xl font-bold")}
        >
          <Plus className="h-4 w-4" />
          Post Masalah Pertama
        </Link>
      )}
    </motion.div>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border border-white/5 bg-white/5 p-4 animate-pulse backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-6 w-6 rounded-full bg-white/10" />
            <div className="h-3 w-24 rounded-full bg-white/10" />
          </div>
          <div className="h-4 w-3/4 rounded-full bg-white/10 mb-2" />
          <div className="h-3 w-full rounded-full bg-white/10 mb-2" />
          <div className="h-3 w-2/3 rounded-full bg-white/10 mb-3" />
          <div className="flex gap-2">
            <div className="h-5 w-14 rounded-full bg-white/10" />
            <div className="h-5 w-14 rounded-full bg-white/10" />
            <div className="h-5 w-16 rounded-full bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProblemList({
  problems,
  loading,
}: {
  problems: Problem[];
  loading: boolean;
}) {
  if (loading) return <Skeleton />;
  if (!problems.length)
    return (
      <EmptyState
        message="Belum ada masalah di sini. Jadilah yang pertama!"
        showCta
      />
    );
  return (
    <div className="flex flex-col gap-3">
      {problems.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
        >
          <PostCard problem={p} />
        </motion.div>
      ))}
    </div>
  );
}

export default function FeedPage() {
  const { profile } = useAuth();
  const [latest, setLatest] = useState<Problem[]>([]);
  const [trending, setTrending] = useState<Problem[]>([]);
  const [matched, setMatched] = useState<Problem[]>([]);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [activeTab, setActiveTab] = useState("latest");

  useEffect(() => {
    getProblems("latest").then((p) => {
      setLatest(p);
      setLoadingLatest(false);
    });
  }, []);

  function handleTabChange(tab: string) {
    setActiveTab(tab);
    if (tab === "trending" && !trending.length) {
      setLoadingTrending(true);
      getProblems("trending").then((p) => {
        setTrending(p);
        setLoadingTrending(false);
      });
    }
    if (tab === "match" && !matched.length) {
      setLoadingMatch(true);
      getProblems("match", profile?.skills ?? []).then((p) => {
        setMatched(p);
        setLoadingMatch(false);
      });
    }
  }

  return (
    <div>
      <Tabs defaultValue="latest" onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-6 h-11 w-full gap-1 border border-white/5 bg-white/5 p-1 backdrop-blur-md overflow-hidden rounded-xl">
          <TabsTrigger 
            value="latest" 
            className="flex-1 rounded-lg transition-all data-[state=active]:bg-amber-400 data-[state=active]:text-amber-950 data-[state=active]:font-bold data-[state=active]:shadow-lg"
          >
            Terbaru
          </TabsTrigger>
          <TabsTrigger 
            value="trending" 
            className="flex-1 rounded-lg transition-all data-[state=active]:bg-amber-400 data-[state=active]:text-amber-950 data-[state=active]:font-bold data-[state=active]:shadow-lg"
          >
            Trending
          </TabsTrigger>
          <TabsTrigger 
            value="match" 
            className="flex-1 rounded-lg transition-all data-[state=active]:bg-amber-400 data-[state=active]:text-amber-950 data-[state=active]:font-bold data-[state=active]:shadow-lg"
          >
            Untukku
          </TabsTrigger>
        </TabsList>
        <TabsContent value="latest">
          <ProblemList problems={latest} loading={loadingLatest} />
        </TabsContent>
        <TabsContent value="trending">
          <ProblemList problems={trending} loading={loadingTrending} />
        </TabsContent>
        <TabsContent value="match">
          {!profile?.skills?.length ? (
            <EmptyState message="Tambahkan skills di profil supaya kami bisa match kamu ke masalah yang tepat" />
          ) : (
            <ProblemList problems={matched} loading={loadingMatch} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

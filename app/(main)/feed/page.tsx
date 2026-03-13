"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PostCard from "@/components/PostCard";
import { getProblems } from "@/lib/firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import type { Problem } from "@/types";

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl mb-3">🌵</div>
      <p className="text-muted-foreground text-sm">{message}</p>
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
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 rounded-xl border bg-muted/50 animate-pulse"
          />
        ))}
      </div>
    );
  }
  if (!problems.length)
    return (
      <EmptyState message="Belum ada masalah di sini. Jadilah yang pertama!" />
    );
  return (
    <div className="flex flex-col gap-3">
      {problems.map((p) => (
        <PostCard key={p.id} problem={p} />
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
      <Tabs defaultValue="latest" onValueChange={handleTabChange}>
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="latest" className="flex-1">
            Terbaru
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex-1">
            Trending
          </TabsTrigger>
          <TabsTrigger value="match" className="flex-1">
            Untukku ✨
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
            <EmptyState message="Tambahkan skills di profil supaya kami bisa match kamu ke masalah yang tepat 🎯" />
          ) : (
            <ProblemList problems={matched} loading={loadingMatch} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

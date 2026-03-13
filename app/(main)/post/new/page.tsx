"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SkillBadge from "@/components/SkillBadge";
import { useAuth } from "@/contexts/AuthContext";
import {
  createProblem,
  addReputation,
  createNotification,
  getUsersWithSkills,
} from "@/lib/firebase/firestore";
import { POINTS } from "@/constants/levels";
import type { Urgency } from "@/types";
import { Sparkles, Loader2 } from "lucide-react";

export default function NewPostPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("santai");
  const [tags, setTags] = useState<string[]>([]);
  const [taggingLoading, setTaggingLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [tagged, setTagged] = useState(false);

  async function handleAnalyze() {
    if (!title.trim() || !description.trim()) return;
    setTaggingLoading(true);
    try {
      const res = await fetch("/api/ai/tag-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      setTags(data.tags ?? []);
      setTagged(true);
    } catch {
      setTags([]);
      setTagged(true);
    } finally {
      setTaggingLoading(false);
    }
  }

  async function handlePost() {
    if (!user || !profile) return;
    setPosting(true);
    try {
      let finalTags = tags;
      if (!tagged) {
        const res = await fetch("/api/ai/tag-skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description }),
        });
        const data = await res.json();
        finalTags = data.tags ?? [];
      }

      const problemId = await createProblem({
        authorId: user.uid,
        authorName: profile.displayName,
        authorPhotoURL: profile.photoURL,
        title: title.trim(),
        description: description.trim(),
        tags: finalTags,
        urgency,
        status: "open",
      });

      await addReputation(user.uid, POINTS.POST_PROBLEM);

      // Notify matched users
      if (finalTags.length) {
        const matchedUsers = await getUsersWithSkills(finalTags);
        const notifs = matchedUsers
          .filter((u) => u.uid !== user.uid)
          .map((u) =>
            createNotification({
              userId: u.uid,
              type: "skill-match",
              problemId,
              problemTitle: title,
              message: `Ada yang butuh skill ${finalTags.join(", ")} kamu!`,
            }),
          );
        await Promise.allSettled(notifs);
      }

      router.push(`/post/${problemId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  }

  const canPost = title.trim().length >= 5 && description.trim().length >= 20;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-6">Post Masalah</h1>

      <div className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            Judul masalah
          </label>
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setTagged(false);
            }}
            placeholder="Ringkasan masalah kamu dalam 1 kalimat"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">
            Deskripsi lengkap
          </label>
          <Textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setTagged(false);
            }}
            placeholder="Ceritakan masalahmu dengan detail. Makin lengkap, makin akurat AI match ke orang yang tepat..."
            rows={6}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {description.length} karakter (min. 20)
          </p>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Urgensi</label>
          <Select
            value={urgency}
            onValueChange={(v) => setUrgency(v as Urgency)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="santai">😌 Santai</SelectItem>
              <SelectItem value="butuh-cepat">⚡ Butuh Cepat</SelectItem>
              <SelectItem value="urgent">🚨 Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* AI Tagging */}
        <div className="rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Skill Matching
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                AI analisis masalahmu dan cari orang yang tepat
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAnalyze}
              disabled={!canPost || taggingLoading}
            >
              {taggingLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Analisis"
              )}
            </Button>
          </div>

          {tagged && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    Skill yang dibutuhkan:
                  </span>
                  {tags.map((tag) => (
                    <SkillBadge key={tag} skill={tag} />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  AI tidak bisa mendeteksi skill spesifik. Akan diposting tanpa
                  tag.
                </p>
              )}
            </motion.div>
          )}
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handlePost}
          disabled={!canPost || posting}
        >
          {posting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            "Post Masalah ⚡"
          )}
        </Button>
      </div>
    </div>
  );
}

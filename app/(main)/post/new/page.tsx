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
import { Sparkles, Loader2, Send, Zap, ArrowLeft } from "lucide-react";

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
        await Promise.all(notifs);
      }

      router.push(`/post/${problemId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3"
      >
        <button 
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-white/5 text-slate-400 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Post Masalah Baru 🌙</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Komunitas siap bantu keroyok!</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/5 bg-white/5 p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-8"
      >
        {/* Title Section */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-amber-400 uppercase tracking-widest pl-1">Judul Masalah</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Apa masalah yang lagi kamu hadapi?"
            className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-400/50 rounded-xl transition-all text-lg font-medium"
          />
        </div>

        {/* Description Section */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-amber-400 uppercase tracking-widest pl-1">Detail Masalah</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan detailnya biar gampang dibantu..."
            rows={6}
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-400/50 rounded-xl transition-all leading-relaxed"
          />
        </div>

        {/* Urgency Section */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-amber-400 uppercase tracking-widest pl-1">Tingkat Urgensi</label>
          <Select
            value={urgency}
            onValueChange={(val) => setUrgency(val as Urgency)}
          >
            <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white rounded-xl focus:ring-amber-400/30">
              <SelectValue placeholder="Pilih urgensi" />
            </SelectTrigger>
            <SelectContent className="bg-[#0f1b2d] border-white/10 text-white rounded-xl">
              <SelectItem value="santai" className="hover:bg-white/5 focus:bg-white/5">☕ Santai - Bisa kapan saja</SelectItem>
              <SelectItem value="butuh-cepat" className="hover:bg-white/5 focus:bg-white/5">⏱️ Butuh Cepat - Hari ini kalau bisa</SelectItem>
              <SelectItem value="urgent" className="hover:bg-white/5 focus:bg-white/5">🚨 Urgent - Sekarang banget!</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* AI Skills Section */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-amber-400 uppercase tracking-widest pl-1">Kategori Skill (AI)</label>
            <button
              onClick={handleAnalyze}
              disabled={!title.trim() || !description.trim() || taggingLoading}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-amber-400/10 text-amber-400 px-3 py-1.5 rounded-full border border-amber-400/30 hover:bg-amber-400 hover:text-amber-950 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-30 disabled:shadow-none"
            >
              {taggingLoading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  AI Menganalisis...
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3" />
                  Analisis via AI
                </>
              )}
            </button>
          </div>
          
          <div className="min-h-[60px] rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 flex flex-wrap gap-2 items-center">
            {tags.length > 0 ? (
              tags.map((tag) => <SkillBadge key={tag} skill={tag} />)
            ) : (
              <span className="text-xs text-slate-500 italic">Gunakan tombol Analisis AI di atas untuk menentukan tag skill otomatis</span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-6 border-t border-white/5">
          <Button
            onClick={handlePost}
            disabled={!title.trim() || !description.trim() || posting}
            className="w-full h-14 bg-amber-400 text-amber-950 font-bold text-lg hover:bg-amber-300 rounded-2xl shadow-xl shadow-amber-900/20 transition-all flex items-center justify-center gap-2 group"
          >
            {posting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Mengunggah...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                Post & Keroyok Bareng!
              </>
            )}
          </Button>
          <p className="text-[10px] text-slate-500 text-center mt-4">
            Dengan mengirim, masalah kamu akan ditampilkan ke komunitas Keroyok dan di-match ke orang yang tepat.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

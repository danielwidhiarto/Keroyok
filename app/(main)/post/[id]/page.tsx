"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import SkillBadge from "@/components/SkillBadge";
import { useAuth } from "@/contexts/AuthContext";
import {
  getProblem,
  getReplies,
  createReply,
  upvoteReply,
  setReplyChosen,
  upvoteProblem,
  addReputation,
  createNotification,
  markProblemSolved,
} from "@/lib/firebase/firestore";
import { POINTS } from "@/constants/levels";
import { formatDistanceToNow } from "@/lib/utils";
import type { Problem, Reply } from "@/types";
import {
  ChevronUp,
  Check,
  Coffee,
  Loader2,
  MessageCircle,
  CheckCircle2,
  Send,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const URGENCY_CONFIG = {
  santai: {
    label: "Santai",
    class: "bg-emerald-400/10 text-emerald-300 border-emerald-400/25",
  },
  "butuh-cepat": {
    label: "Butuh Cepat",
    class: "bg-amber-400/10 text-amber-300 border-amber-400/25",
  },
  urgent: {
    label: "Urgent",
    class: "bg-rose-400/10 text-rose-300 border-rose-400/25",
  },
};

const STATUS_CONFIG = {
  open: { label: "Open", class: "bg-sky-400/10 text-sky-300 border-sky-400/25" },
  "in-progress": {
    label: "In Progress",
    class: "bg-violet-400/10 text-violet-300 border-violet-400/25",
  },
  solved: {
    label: "Solved",
    class: "bg-emerald-400/20 text-emerald-300 border-emerald-400/40",
  },
};

export default function PostDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user, profile } = useAuth();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const [p, r] = await Promise.all([getProblem(id), getReplies(id)]);
    setProblem(p);
    setReplies(r);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleUpvoteProblem() {
    if (!user || !problem) return;
    const hasUpvoted = problem.upvotedBy.includes(user.uid);
    await upvoteProblem(id, user.uid, hasUpvoted);
    setProblem((p) =>
      p
        ? {
            ...p,
            upvoteCount: p.upvoteCount + (hasUpvoted ? -1 : 1),
            upvotedBy: hasUpvoted
              ? p.upvotedBy.filter((uid) => uid !== user.uid)
              : [...p.upvotedBy, user.uid],
          }
        : p,
    );
  }

  async function handleUpvoteReply(reply: Reply) {
    if (!user) return;
    const hasUpvoted = reply.upvotedBy.includes(user.uid);
    await upvoteReply(id, reply.id, user.uid, hasUpvoted);
    setReplies((prev) =>
      prev.map((r) =>
        r.id === reply.id
          ? {
              ...r,
              upvoteCount: r.upvoteCount + (hasUpvoted ? -1 : 1),
              upvotedBy: hasUpvoted
                ? r.upvotedBy.filter((uid) => uid !== user.uid)
                : [...r.upvotedBy, user.uid],
            }
          : r,
      ),
    );
  }

  async function handleChooseReply(reply: Reply) {
    if (!user || !problem) return;
    if (problem.authorId !== user.uid) return;

    await setReplyChosen(id, reply.id);
    await markProblemSolved(id, reply.authorId, reply.authorName);
    await addReputation(reply.authorId, POINTS.SOLUTION_CHOSEN);
    await createNotification({
      userId: reply.authorId,
      type: "skill-match",
      problemId: id,
      problemTitle: problem.title,
      message: `${profile?.displayName} memilih solusimu sebagai yang terbaik!`,
    });
    await load();
  }

  async function handleSubmitReply() {
    if (!user || !profile || !replyContent.trim()) return;
    setSubmitting(true);
    try {
      await createReply({
        problemId: id,
        authorId: user.uid,
        authorName: profile.displayName,
        authorPhotoURL: profile.photoURL,
        content: replyContent.trim(),
      });
      await addReputation(user.uid, POINTS.GIVE_SOLUTION);
      if (problem) {
        await createNotification({
          userId: problem.authorId,
          type: "reply",
          problemId: id,
          problemTitle: problem.title,
          message: `${profile.displayName} membalas masalahmu`,
        });
      }
      setReplyContent("");
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400/50" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="text-center py-24 text-slate-400">
        <p className="mb-4">Masalah tidak ditemukan.</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
        </Button>
      </div>
    );
  }

  const isOP = user?.uid === problem.authorId;
  const hasUpvotedProblem = user ? problem.upvotedBy.includes(user.uid) : false;
  const urgency = URGENCY_CONFIG[problem.urgency as keyof typeof URGENCY_CONFIG] || URGENCY_CONFIG.santai;
  const status = STATUS_CONFIG[problem.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.open;
  const isSolved = problem.status === "solved";

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2"
      >
        <button 
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-white/5 text-slate-400 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium text-slate-400">Kembali ke Feed</span>
      </motion.div>

      {/* Problem Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-md transition-all shadow-xl ${isSolved ? "border-emerald-400/20" : ""}`}
      >
        <div className="flex items-start gap-4">
          <button
            onClick={handleUpvoteProblem}
            className={`flex flex-col items-center gap-0.5 rounded-xl border p-2.5 transition-all ${
              hasUpvotedProblem
                ? "border-amber-400 bg-amber-400/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                : "border-white/10 hover:border-amber-400/50 hover:bg-amber-400/5 text-slate-400"
            }`}
          >
            <ChevronUp className="h-5 w-5" />
            <span className="text-sm font-bold">{problem.upvoteCount}</span>
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${urgency.class}`}>
                {urgency.label}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${status.class}`}>
                {isSolved && <CheckCircle2 className="h-3 w-3" />}
                {status.label}
              </span>
              {problem.tags.map((tag) => (
                <SkillBadge key={tag} skill={tag} />
              ))}
            </div>

            <h1 className="text-2xl font-bold text-white mb-4 leading-tight">{problem.title}</h1>
            <p className="text-base text-slate-300 whitespace-pre-wrap leading-relaxed">
              {problem.description}
            </p>

            <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-4">
              <div className="flex items-center gap-2.5">
                <Avatar className="h-8 w-8 ring-2 ring-white/10">
                  <AvatarImage src={problem.authorPhotoURL ?? undefined} />
                  <AvatarFallback className="bg-amber-400/20 text-amber-400 text-xs font-bold">
                    {problem.authorName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link
                    href={`/profile/${problem.authorId}`}
                    className="text-sm font-semibold text-white hover:text-amber-400 block transition-colors"
                  >
                    {problem.authorName}
                  </Link>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {problem.createdAt?.toDate
                      ? formatDistanceToNow(problem.createdAt.toDate())
                      : "Baru saja"}
                  </span>
                </div>
              </div>
            </div>

            {isSolved && problem.solvedByName && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-emerald-400/10 border border-emerald-400/20 px-4 py-3 text-sm text-emerald-300">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span>Masalah ini telah diselesaikan oleh <strong>{problem.solvedByName}</strong></span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Replies Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <MessageCircle className="h-4 w-4 text-amber-400" />
          <h2 className="font-bold text-white uppercase tracking-widest text-xs">
            {replies.length} Solusi & Masukan
          </h2>
        </div>
        
        <div className="space-y-3">
          {replies.map((reply, index) => {
            const hasUpvoted = user ? reply.upvotedBy.includes(user.uid) : false;
            return (
              <motion.div
                key={reply.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className={`rounded-2xl border p-4 backdrop-blur-sm transition-all shadow-lg ${
                  reply.isChosen 
                    ? "border-amber-400/40 bg-amber-400/5 ring-1 ring-amber-400/10" 
                    : "border-white/5 bg-white/5 hover:border-white/10"
                }`}
              >
                {reply.isChosen && (
                  <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Solusi Terpilih 🌙
                  </div>
                )}
                
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleUpvoteReply(reply)}
                    className={`flex flex-col items-center gap-0.5 rounded-lg border p-1.5 transition-all shrink-0 ${
                      hasUpvoted
                        ? "border-amber-400 bg-amber-400/10 text-amber-400 shadow-sm"
                        : "border-white/10 hover:border-amber-400/50 hover:bg-white/5 text-slate-500"
                    }`}
                  >
                    <ChevronUp className="h-4 w-4" />
                    <span className="text-[10px] font-bold">{reply.upvoteCount}</span>
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {reply.content}
                    </p>
                    
                    <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7 ring-1 ring-white/10">
                          <AvatarImage src={reply.authorPhotoURL ?? undefined} />
                          <AvatarFallback className="bg-white/10 text-slate-400 text-[10px]">
                            {reply.authorName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link
                            href={`/profile/${reply.authorId}`}
                            className="text-xs font-semibold text-white hover:text-amber-400 transition-colors"
                          >
                            {reply.authorName}
                          </Link>
                          <p className="text-[10px] text-slate-500">
                            {reply.createdAt?.toDate
                              ? formatDistanceToNow(reply.createdAt.toDate())
                              : "Baru saja"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isOP && !isSolved && !reply.isChosen && (
                          <Button
                            size="sm"
                            className="h-8 rounded-xl bg-emerald-500 text-emerald-950 font-bold hover:bg-emerald-400 transition-colors"
                            onClick={() => handleChooseReply(reply)}
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Pilih
                          </Button>
                        )}
                        {reply.isChosen && (
                          <button
                            className="flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-[10px] font-bold text-amber-400 hover:bg-amber-400 hover:text-amber-950 transition-all"
                          >
                            <Coffee className="h-3.5 w-3.5" />
                            Traktir Kopi
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Reply Input Sticky Shadow Fix */}
      <div className="h-px w-full bg-transparent" />

      {/* Reply Form */}
      {!isSolved && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-white/10 bg-[#08111e]/80 backdrop-blur-xl p-5 shadow-2xl border-t-white/20"
        >
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-bold text-white text-sm">Berikan Solusi Terbaikmu 🌙</h3>
          </div>
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Ketik solusimu di sini, bantu teman dan bangun reputasimu..."
            rows={4}
            className="mb-4 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-400/50 rounded-xl transition-all"
          />
          <Button
            onClick={handleSubmitReply}
            disabled={!replyContent.trim() || submitting}
            className="w-full h-11 bg-amber-400 text-amber-950 font-bold hover:bg-amber-300 rounded-xl shadow-lg shadow-amber-900/20"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengirim Solusi...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Kirim Solusi
              </>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
}

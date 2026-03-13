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
} from "lucide-react";
import Link from "next/link";

const URGENCY_CONFIG = {
  santai: {
    label: "Santai",
    class: "bg-green-100 text-green-700 border-green-200",
  },
  "butuh-cepat": {
    label: "Butuh Cepat",
    class: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  urgent: {
    label: "Urgent",
    class: "bg-red-100 text-red-700 border-red-200",
  },
};

const STATUS_CONFIG = {
  open: { label: "Open", class: "bg-blue-100 text-blue-700 border-blue-200" },
  "in-progress": {
    label: "In Progress",
    class: "bg-purple-100 text-purple-700 border-purple-200",
  },
  solved: {
    label: "Solved",
    class: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
};

export default function PostDetailPage() {
  const params = useParams();
  const id = params.id as string;
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
    if (!hasUpvoted) {
      await addReputation(reply.authorId, POINTS.SOLUTION_UPVOTED);
    }
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
    await setReplyChosen(id, reply.id);
    await markProblemSolved(id, reply.authorId, reply.authorName);
    await addReputation(reply.authorId, POINTS.SOLUTION_CHOSEN);
    await createNotification({
      userId: reply.authorId,
      type: "solved",
      problemId: id,
      problemTitle: problem.title,
      message: `Solusimu untuk "${problem.title}" dipilih sebagai jawaban terbaik!`,
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
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Masalah tidak ditemukan.
      </div>
    );
  }

  const isOP = user?.uid === problem.authorId;
  const hasUpvotedProblem = user ? problem.upvotedBy.includes(user.uid) : false;
  const urgency = URGENCY_CONFIG[problem.urgency];
  const status = STATUS_CONFIG[problem.status];
  const isSolved = problem.status === "solved";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Problem header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border bg-card p-6 ${isSolved ? "border-emerald-200/60" : ""}`}
      >
        <div className="flex items-start gap-4">
          <button
            onClick={handleUpvoteProblem}
            className={`flex flex-col items-center gap-0.5 rounded-xl border p-2.5 transition-all ${
              hasUpvotedProblem
                ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10"
                : "border-border hover:border-primary/50 hover:bg-primary/5"
            }`}
          >
            <ChevronUp className="h-5 w-5" />
            <span className="text-sm font-bold">{problem.upvoteCount}</span>
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              <span
                className={`rounded-full border px-2 py-0.5 text-xs font-medium ${urgency.class}`}
              >
                {urgency.label}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${status.class}`}
              >
                {isSolved && <CheckCircle2 className="h-3 w-3" />}
                {status.label}
              </span>
              {problem.tags.map((tag) => (
                <SkillBadge key={tag} skill={tag} />
              ))}
            </div>

            <h1 className="text-xl font-bold mb-3">{problem.title}</h1>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {problem.description}
            </p>

            <div className="mt-4 flex items-center gap-2">
              <Avatar className="h-6 w-6 ring-2 ring-background">
                <AvatarImage src={problem.authorPhotoURL ?? undefined} />
                <AvatarFallback className="text-xs">
                  {problem.authorName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Link
                href={`/profile/${problem.authorId}`}
                className="text-xs font-medium hover:underline"
              >
                {problem.authorName}
              </Link>
              <span className="text-xs text-muted-foreground/50">·</span>
              <span className="text-xs text-muted-foreground/70">
                {problem.createdAt?.toDate
                  ? formatDistanceToNow(problem.createdAt.toDate())
                  : ""}
              </span>
            </div>

            {isSolved && problem.solvedByName && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2.5 text-sm text-emerald-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Diselesaikan oleh <strong>{problem.solvedByName}</strong>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Replies */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">{replies.length} Solusi</h2>
        </div>
        <div className="space-y-3">
          {replies.map((reply, index) => {
            const hasUpvoted = user
              ? reply.upvotedBy.includes(user.uid)
              : false;
            return (
              <motion.div
                key={reply.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.3 }}
                className={`rounded-2xl border bg-card p-4 transition-all ${reply.isChosen ? "border-emerald-300 bg-gradient-to-br from-emerald-50/80 to-emerald-50/30 shadow-sm shadow-emerald-100" : ""}`}
              >
                {reply.isChosen && (
                  <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold mb-2">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Solusi Terbaik
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleUpvoteReply(reply)}
                    className={`flex flex-col items-center gap-0.5 rounded-lg border p-1.5 transition-all shrink-0 ${
                      hasUpvoted
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50 hover:bg-primary/5"
                    }`}
                  >
                    <ChevronUp className="h-4 w-4" />
                    <span className="text-xs font-medium">
                      {reply.upvoteCount}
                    </span>
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {reply.content}
                    </p>
                    <div className="mt-3 flex items-center justify-between flex-wrap gap-2 border-t pt-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5 ring-1 ring-background">
                          <AvatarImage
                            src={reply.authorPhotoURL ?? undefined}
                          />
                          <AvatarFallback className="text-xs">
                            {reply.authorName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <Link
                          href={`/profile/${reply.authorId}`}
                          className="text-xs font-medium hover:underline"
                        >
                          {reply.authorName}
                        </Link>
                        <span className="text-xs text-muted-foreground/70">
                          {reply.createdAt?.toDate
                            ? formatDistanceToNow(reply.createdAt.toDate())
                            : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isOP && !isSolved && !reply.isChosen && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                            onClick={() => handleChooseReply(reply)}
                          >
                            <Check className="h-3 w-3" />
                            Pilih Solusi
                          </Button>
                        )}
                        {reply.isChosen && (
                          <a
                            href={`/profile/${reply.authorId}`}
                            className="flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors"
                          >
                            <Coffee className="h-3.5 w-3.5" />
                            Traktir {reply.authorName.split(" ")[0]}
                          </a>
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

      {/* Reply form */}
      {!isSolved && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border bg-card p-5"
        >
          <h3 className="font-semibold mb-3">Tulis Solusi</h3>
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Bagikan solusi atau pertanyaan klarifikasimu..."
            rows={4}
            className="mb-3"
          />
          <Button
            onClick={handleSubmitReply}
            disabled={!replyContent.trim() || submitting}
            className="w-full gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengirim...
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

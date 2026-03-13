import Link from "next/link";
import { MessageCircle, ChevronUp, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SkillBadge from "@/components/SkillBadge";
import type { Problem } from "@/types";
import { formatDistanceToNow } from "@/lib/utils";

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
    class: "bg-rose-400/10 text-rose-300 border-rose-400/25" 
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

export default function PostCard({ problem }: { problem: Problem }) {
  const urgency = URGENCY_CONFIG[problem.urgency];
  const status = STATUS_CONFIG[problem.status];
  const isSolved = problem.status === "solved";

  return (
    <Link href={`/post/${problem.id}`}>
      <div
        className={`group relative rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-md transition-all duration-300 hover:border-amber-400/30 hover:bg-white/10 hover:shadow-[0_8px_32px_rgba(245,158,11,0.1)] ${
          isSolved ? "border-emerald-400/30" : ""
        }`}
      >
        {/* Solved indicator strip */}
        {isSolved && (
          <div className="absolute top-0 left-0 h-full w-1 rounded-l-2xl bg-emerald-400" />
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {/* Author */}
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 ring-2 ring-background">
                <AvatarImage src={problem.authorPhotoURL ?? undefined} />
                <AvatarFallback className="text-xs">
                  {problem.authorName?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-muted-foreground">
                {problem.authorName}
              </span>
              <span className="text-xs text-muted-foreground/50">·</span>
              <span className="text-xs text-muted-foreground/70">
                {problem.createdAt?.toDate
                  ? formatDistanceToNow(problem.createdAt.toDate())
                  : "baru"}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-semibold leading-snug transition-colors group-hover:text-primary line-clamp-2">
              {problem.title}
            </h3>

            {/* Description preview */}
            {problem.description && (
              <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                {problem.description}
              </p>
            )}

            {/* Tags & badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${urgency.class}`}
              >
                {urgency.label}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${status.class}`}
              >
                {isSolved && <CheckCircle2 className="h-3 w-3" />}
                {status.label}
              </span>
              {problem.tags.slice(0, 3).map((tag) => (
                <SkillBadge key={tag} skill={tag} />
              ))}
              {problem.tags.length > 3 && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                  +{problem.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-3 flex items-center gap-4 border-t pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <ChevronUp className="h-3.5 w-3.5" />
            {problem.upvoteCount}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            {problem.replyCount} solusi
          </span>
        </div>
      </div>
    </Link>
  );
}

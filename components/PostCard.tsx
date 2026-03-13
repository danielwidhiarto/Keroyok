import Link from "next/link";
import { MessageCircle, ChevronUp, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import SkillBadge from "@/components/SkillBadge";
import type { Problem } from "@/types";
import { formatDistanceToNow } from "@/lib/utils";

const URGENCY_CONFIG = {
  santai: { label: "Santai", class: "bg-green-100 text-green-700" },
  "butuh-cepat": {
    label: "Butuh Cepat",
    class: "bg-yellow-100 text-yellow-700",
  },
  urgent: { label: "Urgent", class: "bg-red-100 text-red-700" },
};

const STATUS_CONFIG = {
  open: { label: "Open", class: "bg-blue-100 text-blue-700" },
  "in-progress": {
    label: "In Progress",
    class: "bg-purple-100 text-purple-700",
  },
  solved: { label: "✅ Solved", class: "bg-emerald-100 text-emerald-700" },
};

export default function PostCard({ problem }: { problem: Problem }) {
  const urgency = URGENCY_CONFIG[problem.urgency];
  const status = STATUS_CONFIG[problem.status];

  return (
    <Link href={`/post/${problem.id}`}>
      <div className="group rounded-xl border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {/* Author */}
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={problem.authorPhotoURL ?? undefined} />
                <AvatarFallback className="text-xs">
                  {problem.authorName?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {problem.authorName}
              </span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">
                {problem.createdAt?.toDate
                  ? formatDistanceToNow(problem.createdAt.toDate())
                  : "baru"}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-semibold leading-snug group-hover:text-primary line-clamp-2">
              {problem.title}
            </h3>

            {/* Tags & badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${urgency.class}`}
              >
                {urgency.label}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.class}`}
              >
                {status.label}
              </span>
              {problem.tags.map((tag) => (
                <SkillBadge key={tag} skill={tag} />
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
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

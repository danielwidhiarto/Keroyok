import { Badge } from "@/components/ui/badge";

const SKILL_COLORS: Record<string, string> = {
  Design: "bg-pink-100 text-pink-700 border-pink-200",
  Coding: "bg-blue-100 text-blue-700 border-blue-200",
  Marketing: "bg-orange-100 text-orange-700 border-orange-200",
  Hukum: "bg-red-100 text-red-700 border-red-200",
  Keuangan: "bg-green-100 text-green-700 border-green-200",
  Teknik: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Masak: "bg-amber-100 text-amber-700 border-amber-200",
  Bisnis: "bg-purple-100 text-purple-700 border-purple-200",
  Kesehatan: "bg-teal-100 text-teal-700 border-teal-200",
  Pendidikan: "bg-cyan-100 text-cyan-700 border-cyan-200",
  Fotografi: "bg-violet-100 text-violet-700 border-violet-200",
  Videografi: "bg-indigo-100 text-indigo-700 border-indigo-200",
  Menulis: "bg-lime-100 text-lime-700 border-lime-200",
  Musik: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  Olahraga: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Bahasa: "bg-sky-100 text-sky-700 border-sky-200",
  Psikologi: "bg-rose-100 text-rose-700 border-rose-200",
  Arsitektur: "bg-stone-100 text-stone-700 border-stone-200",
  Pertanian: "bg-green-100 text-green-800 border-green-200",
  Otomotif: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function SkillBadge({ skill }: { skill: string }) {
  const color = SKILL_COLORS[skill] ?? "bg-muted text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${color}`}
    >
      {skill}
    </span>
  );
}

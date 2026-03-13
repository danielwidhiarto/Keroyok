"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SkillBadge from "@/components/SkillBadge";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserProfile } from "@/lib/firebase/firestore";
import { SKILLS } from "@/constants/skills";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [mayarLink, setMayarLink] = useState(profile?.mayarLink ?? "");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    profile?.skills ?? [],
  );
  const [notifyOnSkillMatch, setNotifyOnSkillMatch] = useState(
    profile?.notifyOnSkillMatch ?? true,
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : prev.length < 5
          ? [...prev, skill]
          : prev,
    );
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        displayName: displayName.trim(),
        mayarLink: mayarLink.trim(),
        skills: selectedSkills,
        notifyOnSkillMatch,
      });
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-xl font-bold">Pengaturan Profil</h1>

      {/* Avatar preview */}
      <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
        <Avatar className="h-14 w-14">
          <AvatarImage src={profile?.photoURL ?? undefined} />
          <AvatarFallback>
            {displayName?.charAt(0)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{displayName || "Nama kamu"}</p>
          <p className="text-xs text-muted-foreground">Foto dari Google</p>
        </div>
      </div>

      {/* Display name */}
      <div>
        <label className="text-sm font-medium mb-1.5 block">Nama tampil</label>
        <Input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Nama lengkap atau panggilan"
        />
      </div>

      {/* Mayar link */}
      <div>
        <label className="text-sm font-medium mb-1.5 block">
          Mayar Link{" "}
          <span className="text-muted-foreground font-normal">(opsional)</span>
        </label>
        <Input
          value={mayarLink}
          onChange={(e) => setMayarLink(e.target.value)}
          placeholder="https://mayar.id/username"
          type="url"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Biar orang bisa traktir kamu ☕ setelah terima solusimu
        </p>
      </div>

      {/* Skills */}
      <div>
        <label className="text-sm font-medium mb-1.5 block">
          Skills ({selectedSkills.length}/5)
        </label>
        <div className="flex flex-wrap gap-2">
          {SKILLS.map((skill) => {
            const selected = selectedSkills.includes(skill);
            return (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:border-primary/50"
                }`}
              >
                {selected && <Check className="h-3.5 w-3.5" />}
                {skill}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notification preference */}
      <div>
        <label className="text-sm font-medium mb-1.5 block">
          Notifikasi skill match
        </label>
        <div className="flex flex-col gap-2">
          {[
            {
              value: true,
              label: "Ya, kabari aku saat ada masalah yang butuh skillku",
            },
            { value: false, label: "Tidak perlu, aku cari sendiri" },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => setNotifyOnSkillMatch(opt.value)}
              className={`rounded-lg border p-3 text-left text-sm transition-all ${
                notifyOnSkillMatch === opt.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Menyimpan...
          </>
        ) : saved ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Tersimpan!
          </>
        ) : (
          "Simpan Perubahan"
        )}
      </Button>
    </div>
  );
}

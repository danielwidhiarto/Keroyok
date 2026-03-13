"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { createUserProfile } from "@/lib/firebase/firestore";
import { SKILLS } from "@/constants/skills";
import { Check } from "lucide-react";

export default function OnboardingPage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(() => (user?.displayName ? 2 : 1));
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [notifyOnSkillMatch, setNotifyOnSkillMatch] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (profile) router.replace("/feed");
  }, [user, profile, loading, router]);

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : prev.length < 5
          ? [...prev, skill]
          : prev,
    );
  }

  async function handleFinish() {
    if (!user) return;
    setSaving(true);
    try {
      await createUserProfile(user.uid, {
        uid: user.uid,
        displayName,
        email: user.email ?? "",
        photoURL: user.photoURL ?? null,
        skills: selectedSkills,
        notifyOnSkillMatch,
        onboardingComplete: true,
      });
      await refreshProfile();
      router.replace("/feed");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="onboarding-page">
      {/* BG */}
      <div className="landing-bg" />
      <div className="orb orb-gold" style={{ opacity: 0.12 }} />
      <div className="orb orb-green" style={{ opacity: 0.08 }} />

      <div className="onboarding-inner">
        {/* Progress */}
        <div className="mb-8">
          <div className="onboarding-progress-label">
            <span>Langkah {step} dari 3</span>
            <span>{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="onboarding-progress-track">
            <motion.div
              className="onboarding-progress-fill"
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="onboarding-card"
            >
              <h2 className="onboarding-h2">Kenalan dulu yuk! 👋</h2>
              <p className="onboarding-sub">Siapa nama kamu?</p>

              <div className="flex flex-col items-center gap-4 mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.photoURL ?? undefined} />
                  <AvatarFallback className="text-2xl">
                    {displayName?.charAt(0)?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <p className="text-xs text-muted-foreground">
                  Foto dari Google kamu
                </p>
              </div>

              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nama lengkap atau panggilan"
                className="mb-4"
              />

              <Button
                className="w-full"
                onClick={() => setStep(2)}
                disabled={!displayName.trim()}
              >
                Lanjut
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="onboarding-card"
            >
              <h2 className="onboarding-h2">Skill kamu apa aja? 🎯</h2>
              <p className="onboarding-sub">
                Pilih maksimal 5 skill. Kamu akan di-match ke masalah yang butuh
                skill ini.
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {SKILLS.map((skill) => {
                  const selected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
                        selected
                          ? "border-amber-400 bg-amber-400/20 text-amber-300"
                          : "border-white/10 bg-white/5 text-slate-400 hover:border-amber-400/50"
                      }`}
                    >
                      {selected && <Check className="h-3.5 w-3.5" />}
                      {skill}
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground mb-4">
                {selectedSkills.length}/5 dipilih
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Kembali
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!selectedSkills.length}
                  className="flex-1"
                >
                  Lanjut
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="onboarding-card"
            >
              <h2 className="onboarding-h2">Preferensi notifikasi 🔔</h2>
              <p className="onboarding-sub">
                Mau dikabari kalau ada masalah yang butuh skill kamu?
              </p>

              <div className="flex flex-col gap-3 mb-6">
                {[
                  {
                    value: true,
                    label: "Ya, kabari aku!",
                    desc: "Dapet notif kalau ada yang butuh skill kamu",
                  },
                  {
                    value: false,
                    label: "No thanks",
                    desc: "Aku akan cari sendiri",
                  },
                ].map((opt) => (
                  <button
                    key={String(opt.value)}
                    onClick={() => setNotifyOnSkillMatch(opt.value)}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      notifyOnSkillMatch === opt.value
                        ? "border-amber-400 bg-amber-400/10"
                        : "border-white/10 bg-white/5 hover:border-amber-400/40"
                    }`}
                  >
                    <p className="font-medium text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {opt.desc}
                    </p>
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  Kembali
                </Button>
                <Button
                  onClick={handleFinish}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? "Menyimpan..." : "Gas! ⚡"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

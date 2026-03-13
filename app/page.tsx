"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  Zap,
  Users,
  Brain,
  Trophy,
  MessageCircle,
  ChevronRight,
  Star,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

/* ─────────────────────────────────────────
   Static data
───────────────────────────────────────── */
const HOW_IT_WORKS = [
  {
    num: "01",
    icon: MessageCircle,
    title: "Post Masalahmu",
    desc: "Ceritakan masalah yang kamu hadapi. Mau itu teknis, bisnis, desain, atau apapun.",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    glow: "rgba(245,158,11,0.15)",
  },
  {
    num: "02",
    icon: Brain,
    title: "AI Match ke Ahlinya",
    desc: "AI kami analisis masalahmu dan match ke orang yang punya keahlian yang tepat.",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/20",
    glow: "rgba(167,139,250,0.15)",
  },
  {
    num: "03",
    icon: Users,
    title: "Komunitas Keroyok",
    desc: "Orang-orang berbakat berkumpul, saling bantu, dan selesaikan masalah bersama.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    glow: "rgba(52,211,153,0.15)",
  },
];

const FEATURES = [
  { icon: Brain, label: "AI Skill Matching", desc: "Cocok otomatis ke yang tepat" },
  { icon: Users, label: "Komunitas Aktif", desc: "Ribuan ahli siap membantu" },
  { icon: Trophy, label: "Sistem Reputasi", desc: "Naik level saat bantu orang" },
  { icon: Star, label: "Solusi Terverifikasi", desc: "Pilih jawaban terbaik langsung" },
];

const PREVIEW_POSTS = [
  {
    title: "Butuh advice soal struktur database untuk SaaS multi-tenant",
    tags: ["Coding", "Bisnis"],
    urgency: "butuh-cepat",
    replies: 4,
    upvotes: 12,
  },
  {
    title: "Gimana cara pitching ke investor seed stage?",
    tags: ["Bisnis", "Marketing"],
    urgency: "santai",
    replies: 7,
    upvotes: 23,
  },
  {
    title: "Landing page saya bounce rate tinggi, ada yang mau review?",
    tags: ["Design", "Marketing"],
    urgency: "urgent",
    replies: 2,
    upvotes: 8,
  },
];

const URGENCY_STYLE: Record<string, string> = {
  santai: "bg-emerald-400/15 text-emerald-300 border-emerald-400/25",
  "butuh-cepat": "bg-amber-400/15 text-amber-300 border-amber-400/25",
  urgent: "bg-rose-400/15 text-rose-300 border-rose-400/25",
};

const URGENCY_LABEL: Record<string, string> = {
  santai: "Santai",
  "butuh-cepat": "Butuh Cepat",
  urgent: "Urgent",
};

function CrescentMoon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M40 8C29 13 23 24 27 37C31 50 44 56 56 52C47 61 34 63 22 57C9 50 3 36 9 23C15 10 28 5 40 8Z"
        fill="currentColor"
      />
    </svg>
  );
}

function LanternSVG({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="16" y="0" width="12" height="7" rx="2" fill="currentColor" opacity="0.5" />
      <line x1="22" y1="7" x2="22" y2="14" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <rect x="6" y="14" width="32" height="44" rx="5" fill="currentColor" opacity="0.1" />
      <rect x="6" y="14" width="32" height="44" rx="5" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <line x1="6" y1="24" x2="38" y2="24" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      <line x1="6" y1="36" x2="38" y2="36" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      <line x1="6" y1="48" x2="38" y2="48" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      <ellipse cx="22" cy="36" rx="9" ry="13" fill="currentColor" opacity="0.18" />
      <line x1="14" y1="58" x2="10" y2="68" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <line x1="30" y1="58" x2="34" y2="68" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <line x1="22" y1="58" x2="22" y2="70" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
    </svg>
  );
}

export default function RootPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [stars, setStars] = useState<{ id: number; width: number; height: number; top: string; left: string; duration: number; delay: number }[]>([]);

  useEffect(() => {
    // Generate star data only on client side to avoid hydration mismatch
    const newStars = [...Array(30)].map((_, i) => ({
      id: i,
      width: Math.random() * 2.5 + 1,
      height: Math.random() * 2.5 + 1,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: 2.5 + Math.random() * 3,
      delay: Math.random() * 5,
    }));
    setStars(newStars);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace(!profile?.onboardingComplete ? "/onboarding" : "/feed");
    }
  }, [user, profile, loading, router]);

  function handleLogin() {
    router.push("/login");
  }

  return (
    <div className="landing-page">
      <div className="landing-bg" />
      <div className="orb orb-gold" />
      <div className="orb orb-green" />
      <div className="orb orb-bottom" />

      {/* ── Star particles (rendered only on client) ── */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="star"
          style={{
            width: star.width,
            height: star.height,
            top: star.top,
            left: star.left,
            position: "fixed",
          }}
          animate={{ opacity: [0.1, 0.85, 0.1] }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
          }}
        />
      ))}

      <motion.div
        className="lantern lantern-left text-amber-400"
        animate={{ y: [0, -16, 0], rotate: [0, 4, -4, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <LanternSVG className="w-14 h-24" />
      </motion.div>
      <motion.div
        className="lantern lantern-right text-amber-300"
        animate={{ y: [0, -12, 0], rotate: [0, -3, 3, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      >
        <LanternSVG className="w-10 h-20" />
      </motion.div>

      <motion.div
        className="crescent text-amber-300"
        animate={{ rotate: [0, 6, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      >
        <CrescentMoon className="w-20 h-20" />
      </motion.div>

      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="flex items-center gap-2">
            <div className="landing-logo-icon overflow-hidden">
              <img src="/logo.png" alt="Keroyok Logo" className="w-full h-full object-cover scale-150" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">Keroyok</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleLogin} className="landing-nav-text-btn">
              Masuk
            </button>
            <button onClick={handleLogin} className="landing-btn-primary">
              Daftar Gratis <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </nav>

      <section className="hero-section">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="hero-badge"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>Komunitas problem-solving berbasis AI</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="hero-h1"
        >
          Masalah apapun,{" "}
          <span className="hero-h1-gradient">diselesaikan bareng</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.22 }}
          className="hero-sub"
        >
          Post masalahmu, AI kami match ke orang yang punya skill tepat,
          lalu komunitas keroyok bareng. Dari coding, desain, bisnis, hukum — semua ada ahlinya.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="cta-row"
        >
          <button onClick={handleLogin} className="cta-hero-btn group">
            Mulai Gratis
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
          <button onClick={handleLogin} className="cta-outline-btn">
            Sudah punya akun? Masuk
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="hero-social-proof"
        >
          <div className="flex -space-x-2">
            {["A", "B", "C", "D"].map((l) => (
              <div key={l} className="hero-avatar">{l}</div>
            ))}
          </div>
          <span className="text-sm text-slate-400">
            Ribuan masalah sudah diselesaikan
          </span>
        </motion.div>

        <motion.div
          className="scroll-hint"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        >
          <span>scroll</span>
          <div className="scroll-line" />
        </motion.div>
      </section>

      <section className="section">
        <div className="section-inner">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <h2 className="section-title">Lihat masalah yang lagi aktif</h2>
            <p className="section-sub">
              Ribuan orang nunggu bantuanmu — atau kamu yang butuh bantuan mereka
            </p>
          </motion.div>

          <div className="preview-feed">
            {PREVIEW_POSTS.map((post, i) => (
              <motion.div
                key={post.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ y: -3 }}
                className="preview-card"
              >
                <div className="flex items-start gap-3">
                  <div className="preview-card-avatar">
                    {post.title.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="preview-card-title">{post.title}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className={`preview-badge border ${URGENCY_STYLE[post.urgency]}`}>
                        {URGENCY_LABEL[post.urgency]}
                      </span>
                      {post.tags.map((t) => (
                        <span key={t} className="preview-tag">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="preview-card-footer">
                  <span className="preview-stat">
                    <MessageCircle className="h-3.5 w-3.5" /> {post.replies} solusi
                  </span>
                  <span className="preview-stat">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" /> {post.upvotes} up
                  </span>
                </div>
              </motion.div>
            ))}

            <div className="preview-cta-overlay">
              <button onClick={handleLogin} className="cta-hero-btn">
                Masuk untuk lihat semua
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <h2 className="section-title">Gimana cara kerjanya?</h2>
            <p className="section-sub">Tiga langkah. Simpel. Efektif.</p>
          </motion.div>

          <div className="hiw-grid">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.12 }}
                className="hiw-card"
                style={{ "--glow": step.glow } as React.CSSProperties}
              >
                <div className={`hiw-icon ${step.bg} border ${step.border}`}>
                  <step.icon className={`h-6 w-6 ${step.color}`} />
                </div>
                <div className="hiw-num">{step.num}</div>
                <h3 className="hiw-title">{step.title}</h3>
                <p className="hiw-desc">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <h2 className="section-title">Semua yang kamu butuhkan</h2>
            <p className="section-sub">
              Platform problem-solving dengan sistem reputasi untuk mendorong kebaikan komunitas
            </p>
          </motion.div>

          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.09 }}
                whileHover={{ y: -4 }}
                className="feature-card"
              >
                <div className="feature-icon bg-amber-400/10 border border-amber-400/20">
                  <f.icon className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="feature-title">{f.label}</h3>
                  <p className="feature-desc">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section pb-28">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="final-cta-box"
        >
          <div className="final-cta-orb" />
          <div className="final-cta-icon">
            <Zap className="h-8 w-8 text-amber-400" />
          </div>
          <h2 className="final-cta-title">Siap keroyok masalah bareng?</h2>
          <p className="final-cta-sub">
            Gratis selamanya. Tidak butuh kartu kredit. Langsung pakai Google.
          </p>
          <button onClick={handleLogin} className="cta-hero-btn mt-6 mx-auto group">
            <Zap className="h-4 w-4" />
            Mulai Sekarang — Gratis
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </section>

      <footer className="landing-footer">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="landing-logo-icon overflow-hidden">
            <img src="/logo.png" alt="Keroyok Logo" className="w-full h-full object-cover scale-150 opacity-70" />
          </div>
          <span className="font-semibold text-white/70 text-sm">Keroyok</span>
        </div>
        <p className="text-xs text-white/25">
          Selesaikan masalah bareng komunitas 🌙
        </p>
      </footer>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { signInWithGoogle } from "@/lib/firebase/auth";
import { useEffect } from "react";
import { Zap, Users, Brain, Trophy, ArrowLeft } from "lucide-react";

const FEATURES = [
  { icon: Brain, label: "AI Skill Match" },
  { icon: Users, label: "Komunitas Aktif" },
  { icon: Trophy, label: "Reputasi & Level" },
];

function MoonSmall() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10 text-amber-300 opacity-25">
      <path
        d="M28 5C20 9 16 17 19 26C22 35 31 39 39 36C32 43 22 44 14 39C5 33 1 22 6 13C11 4 20 1 28 5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function LoginPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace(profile ? "/feed" : "/onboarding");
    }
  }, [user, profile, loading, router]);

  async function handleGoogleLogin() {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="login-page">
      {/* BG */}
      <div className="landing-bg" />
      <div className="orb orb-gold" style={{ opacity: 0.14 }} />
      <div className="orb orb-green" style={{ opacity: 0.1 }} />

      {/* Stars */}
      {[...Array(18)].map((_, i) => (
        <motion.div
          key={i}
          className="star"
          style={{
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{ opacity: [0.1, 0.8, 0.1] }}
          transition={{
            duration: 2.5 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 4,
          }}
        />
      ))}

      {/* Moon deco */}
      <div className="absolute top-8 right-12 hidden sm:block">
        <MoonSmall />
      </div>

      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        onClick={() => router.push("/")}
        className="login-back-btn"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </motion.button>

      {/* Card */}
      <div className="login-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="login-card-wrap"
        >
          {/* Brand */}
          <div className="login-brand">
            <motion.div
              initial={{ scale: 0.55, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 220 }}
              className="login-logo"
            >
              <Zap className="h-10 w-10 text-amber-400" />
            </motion.div>
            <h1 className="login-title">Keroyok</h1>
            <p className="login-subtitle">
              Post masalah, AI match ke orang tepat, komunitas keroyok bareng
            </p>
          </div>

          {/* Card */}
          <div className="login-card">
            {/* Feature pills */}
            <div className="login-features">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="login-feature-pill"
                >
                  <div className="login-feature-icon">
                    <f.icon className="h-4 w-4 text-amber-400" />
                  </div>
                  <span className="login-feature-label">{f.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Google button */}
            <Button
              className="login-google-btn"
              size="lg"
              onClick={handleGoogleLogin}
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#fff"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#fff"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#fff"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#fff"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Masuk dengan Google
            </Button>

            <p className="login-terms">
              Dengan masuk, kamu setuju untuk saling bantu dan berbagi ilmu bersama komunitas 🌙
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

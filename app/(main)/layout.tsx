"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [stars, setStars] = useState<{ id: number; top: string; left: string; size: number }[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (!profile) router.replace("/onboarding");
  }, [user, profile, loading, router]);

  useEffect(() => {
    // Subtle star particles for main app background
    const newStars = [...Array(12)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 1.5 + 0.5,
    }));
    setStars(newStars);
  }, []);

  if (loading || !user || !profile) {
    return (
      <div className="landing-page flex min-h-screen items-center justify-center">
        <div className="landing-bg" />
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="landing-page min-h-screen">
      {/* Persistent Theme Background */}
      <div className="landing-bg opacity-40" />
      <div className="orb orb-gold opacity-10" />
      
      {/* Subtle stars background */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="star"
          initial={{ opacity: 0.1 }}
          animate={{ opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 4 + Math.random() * 2, repeat: Infinity }}
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            position: "fixed",
            zIndex: -1,
          }}
        />
      ))}

      <Navbar />
      <main className="relative z-10 mx-auto max-w-3xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}

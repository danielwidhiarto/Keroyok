import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Keroyok — Selesaikan masalah bareng komunitas",
  description:
    "Post masalah, AI match ke orang yang tepat, komunitas keroyok bareng.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} antialiased font-sans`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

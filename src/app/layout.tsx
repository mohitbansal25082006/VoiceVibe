import React from "react"; // <-- Fixes the TS error
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";  // Add Analytics import

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VoiceVibe – AI Interview Coach",
  description:
    "Practice realistic interviews, get AI feedback on voice & text, track your improvement.",
  keywords: ["ai interview coach", "interview practice", "mock interview"],
  authors: [{ name: "VoiceVibe Team" }],
  openGraph: {
    title: "VoiceVibe – AI Interview Coach",
    description: "Ace every interview with GPT-4 powered feedback.",
    url: "https://voicevibe.vercel.app",
    siteName: "VoiceVibe",
    images: [
      {
        url: "https://voicevibe.vercel.app/og.png",
        width: 1200,
        height: 630,
        alt: "VoiceVibe preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VoiceVibe – AI Interview Coach",
    description: "Practice interviews with AI feedback.",
    images: ["https://voicevibe.vercel.app/og.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {children}
          <Toaster richColors position="top-center" />
          <Analytics />  {/* Add here */}
        </body>
      </html>
    </ClerkProvider>
  );
}

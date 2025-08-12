// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Menu, X, Moon, Sun, Mic, BrainCircuit, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ---------- Re-usable section wrappers ---------- */
const Section = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <section className={cn("py-20 px-6 md:px-10 lg:px-16", className)}>
    {children}
  </section>
);

/* ---------- Navbar ---------- */
const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Mic className="h-7 w-7 text-primary" />
          <span className="text-2xl font-bold">VoiceVibe</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <SignedOut>
            <SignInButton>
              <Button variant="outline">Sign In</Button>
            </SignInButton>
            <SignUpButton>
              <Button>Get Started</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <UserButton />
          </SignedIn>
          <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded-md hover:bg-muted"
            aria-label="Toggle theme"
          >
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </nav>

        {/* Mobile nav */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setDark(!dark)}
            className="p-2 mr-2 rounded-md hover:bg-muted"
            aria-label="Toggle theme"
          >
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setOpen(!open)}>
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden flex flex-col gap-4 px-6 pb-4 border-t">
          <SignedOut>
            <SignInButton>
              <Button variant="outline" className="w-full">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton>
              <Button className="w-full">Get Started</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full">
                Dashboard
              </Button>
            </Link>
            <div className="flex justify-center">
              <UserButton />
            </div>
          </SignedIn>
        </div>
      )}
    </header>
  );
};

/* ---------- Hero ---------- */
const Hero = () => (
  <Section className="flex flex-col items-center text-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-800">
    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
      Ace Every Interview with{" "}
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
        AI Coaching
      </span>
    </h1>
    <p className="max-w-2xl mt-6 text-lg md:text-xl text-muted-foreground">
      Practice realistic questions, get instant feedback on tone & content, and
      track your progress—all powered by GPT-4.
    </p>

    <div className="mt-10 flex flex-col sm:flex-row gap-4">
      <SignedOut>
        <SignUpButton>
          <Button size="lg" className="h-12 px-8 text-base">
            Get Started Free
          </Button>
        </SignUpButton>
        <SignInButton>
          <Button size="lg" variant="outline" className="h-12 px-8 text-base">
            Sign In
          </Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <Link href="/dashboard">
          <Button size="lg" className="h-12 px-8 text-base">
            Go to Dashboard
          </Button>
        </Link>
      </SignedIn>
    </div>

    {/* Hero mock */}
    <div className="mt-16 w-full max-w-5xl">
      <Image
        src="/hero.png"
        alt="Interview simulation"
        width={1200}
        height={600}
        className="rounded-xl shadow-2xl border"
      />
    </div>
  </Section>
);

/* ---------- Features ---------- */
const Features = () => {
  const cards = [
    {
      icon: <Mic className="h-10 w-10 text-primary" />,
      title: "Voice & Text",
      desc: "Answer questions with speech or text—our AI understands both.",
    },
    {
      icon: <BrainCircuit className="h-10 w-10 text-primary" />,
      title: "Smart Feedback",
      desc: "Real-time analysis of tone, confidence, and content quality.",
    },
    {
      icon: <BarChart3 className="h-10 w-10 text-primary" />,
      title: "Progress Tracking",
      desc: "Visual dashboards to see how you improve over time.",
    },
  ];

  return (
    <Section>
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        Why VoiceVibe?
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {cards.map((c) => (
          <div
            key={c.title}
            className="flex flex-col items-center text-center p-8 rounded-xl border bg-card shadow-sm hover:shadow-lg transition"
          >
            {c.icon}
            <h3 className="mt-4 text-xl font-semibold">{c.title}</h3>
            <p className="mt-2 text-muted-foreground">{c.desc}</p>
          </div>
        ))}
      </div>
    </Section>
  );
};

/* ---------- Footer ---------- */
const Footer = () => (
  <footer className="border-t">
    <div className="max-w-7xl mx-auto py-6 px-6 text-center text-sm text-muted-foreground">
      © {new Date().getFullYear()} VoiceVibe – Built with Next.js 14, Clerk,
      Tailwind & ❤️.
    </div>
  </footer>
);

/* ---------- Main Page ---------- */
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
}

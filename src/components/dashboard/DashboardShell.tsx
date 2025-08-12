"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Clock,
  FileText,
  Mic,
  Plus,
  Sparkles,
  TrendingUp,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import InterviewSetup from "./InterviewSetup";
import { getInterviews, deleteInterview } from "@/lib/actions";
import type { QueryResultRow } from "@vercel/postgres";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Interview = {
  id: string;
  role: string;
  difficulty: "Easy" | "Medium" | "Hard";
  type: "Behavioral" | "Technical" | "Case-study";
  createdAt: string;
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

export default function DashboardShell({ userId }: { userId: string }) {
  const [showSetup, setShowSetup] = useState(false);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<string | null>(null);

  /* Fetch interviews */
  const refresh = () =>
    getInterviews(userId)
      .then((rows: QueryResultRow[]) => {
        const mapped: Interview[] = rows.map((r) => ({
          id: String(r.id),
          role: String(r.role),
          difficulty: (r.difficulty ?? "Easy") as Interview["difficulty"],
          type: (r.type ?? "Behavioral") as Interview["type"],
          createdAt: String(r.createdat ?? r.created_at ?? r.createdAt ?? Date.now()),
        }));
        setInterviews(mapped);
      })
      .catch(() => toast.error("Failed to load interviews"))
      .finally(() => setLoading(false));

  useEffect(() => {
    refresh();
  }, [userId]);

  /* Delete handler */
  async function handleDelete(id: string) {
    await deleteInterview(id);
    toast.success("Interview deleted");
    refresh();
    setToDelete(null);
  }

  /* Validation modal */
  const [showValidation, setShowValidation] = useState(false);

  const openSetup = () => setShowValidation(true);
  const confirmValidation = () => {
    setShowValidation(false);
    setShowSetup(true);
  };

  /* Stats */
  const total = interviews.length;
  const completed = interviews.filter((i) => Boolean(i.type)).length;
  const lastWeek = interviews.filter(
    (i) => new Date(i.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
  ).length;

  /* Empty state */
  if (!loading && total === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-3xl mx-auto px-6 py-24 text-center"
      >
        <Sparkles className="mx-auto h-16 w-16 text-primary mb-6" />
        <h2 className="text-3xl font-bold mb-2">Welcome to VoiceVibe!</h2>
        <p className="text-muted-foreground mb-8">
          You don’t have any interviews yet. Create your first one to start practicing.
        </p>
        <Button size="lg" onClick={openSetup}>
          <Plus className="mr-2 h-5 w-5" />
          Create Interview
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header + Home link */}
      <motion.header
        variants={container}
        initial="hidden"
        animate="show"
        className="flex items-center gap-4 mb-8"
      >
        <Link href="/" passHref>
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            VoiceVibe
          </Button>
        </Link>
        <motion.h1 variants={item} className="text-4xl font-bold">
          Dashboard
        </motion.h1>
      </motion.header>

      <Separator className="my-8" />

      {/* Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid md:grid-cols-3 gap-6 mb-8"
      >
        <StatCard
          icon={<Briefcase />}
          label="Total Interviews"
          value={loading ? <Skeleton className="h-8 w-12" /> : <span>{total}</span>}
          color="text-blue-500"
        />
        <StatCard
          icon={<TrendingUp />}
          label="Completed"
          value={loading ? <Skeleton className="h-8 w-12" /> : <span>{completed}</span>}
          color="text-green-500"
        />
        <StatCard
          icon={<Clock />}
          label="This Week"
          value={loading ? <Skeleton className="h-8 w-12" /> : <span>{lastWeek}</span>}
          color="text-purple-500"
        />
      </motion.div>

      {/* Quick Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex justify-between items-center"
      >
        <h2 className="text-2xl font-semibold">Recent Interviews</h2>
        <Button onClick={openSetup}>
          <Plus className="mr-2 h-4 w-4" />
          New Interview
        </Button>
      </motion.div>

      <AnimatePresence>
        {showSetup && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <InterviewSetup userId={userId} onClose={() => setShowSetup(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interviews Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {interviews.map((i) => (
            <motion.div key={i.id} variants={item}>
              <InterviewCard interview={i} onDelete={() => setToDelete(i.id)} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Validation Modal */}
      <AlertDialog open={showValidation} onOpenChange={setShowValidation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hold on!</AlertDialogTitle>
            <AlertDialogDescription>
              Please fill in <strong>Job Role</strong>, <strong>Difficulty</strong> and{" "}
              <strong>Type</strong> before starting the interview.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmValidation}>
              Got it, open form
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={Boolean(toDelete)} onOpenChange={() => setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete interview?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All data will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => toDelete && handleDelete(toDelete)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ---------- StatCard ---------- */
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  color: string;
}) {
  return (
    <Card className="flex items-center gap-4 p-6">
      <div className={cn("p-3 rounded-full bg-muted", color)}>{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="text-2xl font-bold">{value}</div>
      </div>
    </Card>
  );
}

/* ---------- Interview card ---------- */
function InterviewCard({
  interview,
  onDelete,
}: {
  interview: Interview;
  onDelete: () => void;
}) {
  const badgeColors: Record<Interview["difficulty"], string> = {
    Easy: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
    Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
    Hard: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
  };

  return (
    <Card className="hover:shadow-lg transition-shadow relative">
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-destructive/10"
        aria-label="Delete interview"
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </button>
      <CardHeader>
        <CardTitle className="text-lg">{interview.role}</CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText size={16} />
          <span>{interview.type}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Badge className={badgeColors[interview.difficulty]}>
            {interview.difficulty}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(interview.createdAt).toLocaleDateString()}
          </span>
        </div>
        <Link href={`/interview/${interview.id}`} passHref>
          <Button size="sm" className="w-full">
            <Mic className="mr-2 h-4 w-4" />
            Continue
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
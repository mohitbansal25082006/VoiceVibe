"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import InterviewSetup from "./InterviewSetup";
import PastInterviews from "./PastInterviews";

export default function DashboardShell({ userId }: { userId: string }) {
  const [showSetup, setShowSetup] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Interviews</h1>
        <Button onClick={() => setShowSetup(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Interview
        </Button>
      </header>

      {showSetup && (
        <InterviewSetup userId={userId} onClose={() => setShowSetup(false)} />
      )}

      <PastInterviews userId={userId} />
    </div>
  );
}
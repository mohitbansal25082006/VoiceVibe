"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { fetchQuestion, evaluateAnswer } from "@/lib/interview-ai";
import type { Feedback } from "@/lib/interview-ai";
import SpeechRecorder from "./SpeechRecorder";

interface InterviewRoomProps {
  interviewId: string;
  userId: string;
}

export default function InterviewRoom({ interviewId, userId }: InterviewRoomProps) {
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadQuestion = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    setAnswer("");
    try {
      const q: string = await fetchQuestion(interviewId, userId);
      setQuestion(q);
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  }, [interviewId, userId]);

  useEffect(() => {
    loadQuestion();
  }, [loadQuestion]);

  // --- New helper to save answer to backend ---
  async function saveAnswer() {
    if (!feedback) return;
    try {
      await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId,
          userId,
          question,
          answer,
          score: feedback.score,
          feedback: `${feedback.strengths} | ${feedback.improvements}`,
        }),
      });
    } catch (error) {
      console.error("Failed to save answer:", error);
    }
  }

  const submitAnswer = async () => {
    if (!answer.trim()) {
      toast.warning("Answer is empty");
      return;
    }
    setLoading(true);
    try {
      const fb: Feedback = await evaluateAnswer(question, answer);
      setFeedback(fb);
      await saveAnswer(); // <-- save after feedback
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  if (finished) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Interview finished!</h1>
        <p className="text-muted-foreground mb-6">
          Well done. Review your history on the dashboard.
        </p>
        <Button onClick={() => window.location.replace("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mock Interview</h1>
        <p className="text-muted-foreground">Answer the question below</p>
      </header>

      {/* Question */}
      <Card className="mb-8 p-6">
        <h2 className="font-semibold text-lg mb-2">Question</h2>
        <p className="text-muted-foreground">{question}</p>
      </Card>

      {/* Answer */}
      <Card className="p-6 mb-6">
        <h3 className="font-semibold mb-2">Your Answer</h3>
        <Textarea
          ref={textareaRef}
          rows={6}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type or record your answer..."
        />
        <div className="flex items-center gap-4 mt-4">
          <SpeechRecorder
            onTranscript={(txt: string) => setAnswer((a) => a + txt)}
          />
          <Button
            onClick={submitAnswer}
            disabled={loading || !answer.trim()}
            className="gap-2"
          >
            {loading ? "Evaluating..." : <Send size={16} />}
            Submit
          </Button>
        </div>
      </Card>

      {/* Feedback */}
      {feedback && (
        <Card className="p-6 mb-6">
          <h3 className="font-semibold mb-2">Feedback</h3>
          <div className="space-y-2">
            <p>
              <strong>Score:</strong> {feedback.score}/10
            </p>
            <p>
              <strong>Strengths:</strong> {feedback.strengths}
            </p>
            <p>
              <strong>Improvements:</strong> {feedback.improvements}
            </p>
          </div>
        </Card>
      )}

      {/* Next / Finish */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => setFinished(true)}
          disabled={loading}
        >
          Finish Interview
        </Button>
        <Button onClick={loadQuestion} disabled={loading} className="gap-2">
          <RotateCcw size={16} />
          Next Question
        </Button>
      </div>
    </div>
  );
}

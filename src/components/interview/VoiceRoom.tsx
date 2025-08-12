"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speak, transcribe } from "@/lib/voice";
import { toast } from "sonner";

/** Recorder ref type (we keep MediaStream separately) */
type RecorderRef = MediaRecorder | null;

export default function VoiceRoom({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<{ role: "ai" | "user"; text: string }[]>(
    []
  );
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [finished, setFinished] = useState(false);

  // refs
  const mediaRef = useRef<RecorderRef>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // prevents overlapping speak() calls
  const audioLock = useRef<boolean>(false);

  // storage key; we store a timestamp (ms) so we can ignore only very recent runs
  const startKey = `voiceRoomStarted:${userId}`;

  /* ---------- Preflight: request microphone permission early ---------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      if (sessionStorage.getItem(`${startKey}:micChecked`)) return;
    } catch {
      /* ignore storage errors */
    }

    (async () => {
      if (!navigator.mediaDevices || !("getUserMedia" in navigator.mediaDevices)) {
        try {
          sessionStorage.setItem(`${startKey}:micChecked`, "1");
        } catch {
          /* ignore */
        }
        return;
      }

      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        s.getTracks().forEach((t) => t.stop());
        try {
          sessionStorage.setItem(`${startKey}:micChecked`, "1");
        } catch {
          /* ignore */
        }
      } catch (err: unknown) {
        if (err instanceof DOMException) {
          if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            toast.error("Microphone permission denied. Allow mic access to use voice.");
            return;
          }
        }
        // debugging information
        // eslint-disable-next-line no-console
        console.info("Mic preflight:", err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Kick-off: welcome intro (timestamp guard, prevents strict-mode dup only) ---------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    // read stored timestamp (ms)
    let prevTs: number | null = null;
    try {
      const s = sessionStorage.getItem(startKey);
      if (s) prevTs = Number(s) || null;
    } catch {
      /* ignore */
    }

    const now = Date.now();
    const RECENT_MS = 2000; // 2 seconds window to treat as duplicate

    // If intro ran very recently, skip (this avoids strict-mode double-run)
    if (prevTs && now - prevTs < RECENT_MS) {
      // don't run intro
      // eslint-disable-next-line no-console
      console.debug("VoiceRoom: skipping intro due to recent session run");
      return;
    }

    // mark now (so if react double-mounts within RECENT_MS we skip)
    try {
      sessionStorage.setItem(startKey, String(now));
    } catch {
      /* ignore storage set errors */
    }

    let mounted = true;

    async function startInterview() {
      const uid = typeof userId === "string" ? userId.slice(0, 4) : "guest";
      const intro = `Hi ${uid}! I'm Alex, your AI interviewer today. Let’s begin. Tell me about your background.`;

      // Add intro message to UI (even if TTS fails)
      setMessages((prev) => {
        if (prev.some((m) => m.role === "ai" && m.text === intro)) return prev;
        return [...prev, { role: "ai", text: intro }];
      });

      // speak, with lock
      await speakSafe(intro);
    }

    if (mounted) startInterview();

    return () => {
      mounted = false;
      // cleanup any recorder & stream
      try {
        const rec = mediaRef.current;
        if (rec) {
          try {
            if (rec.state !== "inactive") rec.stop();
          } catch {
            /* ignore */
          }
        }
        const s = streamRef.current;
        s?.getTracks().forEach((t) => t.stop());
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("VoiceRoom cleanup error:", err);
      } finally {
        mediaRef.current = null;
        streamRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  /* ---------- Safe speak wrapper (prevents overlap) ---------- */
  async function speakSafe(text: string) {
    if (audioLock.current) {
      // already speaking — ignore
      // eslint-disable-next-line no-console
      console.debug("speakSafe: already speaking, ignoring new request");
      return;
    }

    audioLock.current = true;
    setIsSpeaking(true);
    try {
      await speak(text);
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error("TTS error:", err);
      toast.error("Audio playback failed.");
    } finally {
      setIsSpeaking(false);
      audioLock.current = false;
    }
  }

  /* ---------- Next question flow ---------- */
  async function handleNextTurn(newUserText: string) {
    setMessages((prev) => [...prev, { role: "user", text: newUserText }]);

    const prompt = `You are a friendly professional interviewer.
Previous user answer: ${newUserText}.
Ask **one short follow-up** or next question relevant to the interview.`;

    try {
      setIsSpeaking(true);

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 120,
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`OpenAI error ${res.status}: ${body}`);
      }

      const json = await res.json();
      const nextQuestion =
        typeof json?.choices?.[0]?.message?.content === "string"
          ? json.choices[0].message.content.trim()
          : "Tell me more.";

      setMessages((prev) => [...prev, { role: "ai", text: nextQuestion }]);
      await speakSafe(nextQuestion);
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error("handleNextTurn error:", err);
      toast.error("Failed to get next question from AI.");
    } finally {
      setIsSpeaking(false);
    }
  }

  /* ---------- Record & transcribe ---------- */
  async function toggleRecord() {
    if (typeof window === "undefined") {
      toast.error("Recording only works in a browser.");
      return;
    }

    if (!navigator.mediaDevices || !("getUserMedia" in navigator.mediaDevices)) {
      toast.error("Your browser doesn't support microphone access.");
      return;
    }

    if (typeof window.MediaRecorder === "undefined") {
      toast.error("Your browser doesn't support MediaRecorder.");
      return;
    }

    if (isSpeaking) {
      toast.info("Wait until the AI finishes speaking.");
      return;
    }

    if (isListening) {
      try {
        mediaRef.current?.stop();
      } catch (err: unknown) {
        // eslint-disable-next-line no-console
        console.error("Failed to stop recorder:", err);
      } finally {
        setIsListening(false);
      }
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // create recorder and keep stream separately (do NOT assign to recorder.stream)
      const recorder = new MediaRecorder(stream);
      mediaRef.current = recorder;
      streamRef.current = stream;

      const chunks: Blob[] = [];

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        setIsListening(false);

        // stop the saved stream's tracks
        try {
          streamRef.current?.getTracks().forEach((t) => t.stop());
        } catch {
          /* ignore */
        } finally {
          streamRef.current = null;
        }

        const blob = new Blob(chunks, { type: "audio/webm" });
        let text: string;
        try {
          text = await transcribe(blob);
        } catch (err: unknown) {
          // eslint-disable-next-line no-console
          console.error("Transcription error:", err);
          toast.error("Transcription failed.");
          return;
        }

        if (!text || typeof text !== "string" || text.trim() === "") {
          toast.warning("Could not understand you.");
          return;
        }

        await handleNextTurn(text);
      };

      recorder.start();
      setIsListening(true);
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error("Recording start failed:", err);

      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          toast.error("Microphone permission denied. Please allow mic access.");
          return;
        }
        if (err.name === "NotFoundError") {
          toast.error("No microphone found.");
          return;
        }
      }

      // object may carry a name property
      if (typeof err === "object" && err !== null && "name" in err) {
        const e = err as { name?: unknown };
        if (typeof e.name === "string") {
          if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
            toast.error("Microphone permission denied. Please allow mic access.");
            return;
          }
          if (e.name === "NotFoundError") {
            toast.error("No microphone found.");
            return;
          }
        }
      }

      toast.error("Failed to start audio recording.");
    }
  }

  if (finished)
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Great job, interview complete!</h1>
        <Button onClick={() => (window.location.href = "/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Voice Interview</h1>

      <div className="flex-1 space-y-4 overflow-y-auto max-h-[60vh]">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "p-3 rounded-lg",
              m.role === "ai" ? "bg-muted" : "bg-primary/10"
            )}
          >
            <span className="font-semibold">{m.role === "ai" ? "AI:" : "You:"}</span>{" "}
            {m.text}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button
          size="lg"
          onClick={toggleRecord}
          disabled={isSpeaking}
          className={cn(isListening && "bg-destructive")}
        >
          {isListening ? <MicOff /> : <Mic />} {isListening ? "Stop" : "Speak"}
        </Button>

        <Button variant="outline" onClick={() => setFinished(true)}>
          End Interview
        </Button>
      </div>
    </div>
  );
}

/* Tailwind helper */
const cn = (...classes: (string | false | undefined)[]) =>
  classes.filter(Boolean).join(" ");

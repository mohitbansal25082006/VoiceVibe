"use client";

import { useState, useRef } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// --- Minimal SpeechRecognition Types ---
interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

interface ISpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: { transcript: string };
    };
  };
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): ISpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): ISpeechRecognition;
    };
  }
}

interface Props {
  onTranscript: (text: string) => void;
}

export default function SpeechRecorder({ onTranscript }: Props) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  // Browser-only
  if (typeof window === "undefined") return null;

  const SpeechRecognitionClass =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognitionClass) {
    return (
      <p className="text-sm text-muted-foreground">
        Speech recognition not supported
      </p>
    );
  }

  const start = () => {
    const rec = new SpeechRecognitionClass();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = (e: ISpeechRecognitionEvent) => {
      const txt = e.results[0][0].transcript;
      onTranscript(txt.trim() + " ");
    };

    rec.onerror = () => toast.error("Speech recognition failed");
    rec.onend = () => setIsListening(false);

    rec.start();
    recognitionRef.current = rec;
    setIsListening(true);
  };

  const stop = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  return (
    <Button
      variant={isListening ? "destructive" : "outline"}
      size="sm"
      onClick={isListening ? stop : start}
      className="gap-2"
    >
      {isListening ? <MicOff size={16} /> : <Mic size={16} />}
      {isListening ? "Stop" : "Record"}
    </Button>
  );
}

// src/lib/voice.ts
let currentAudio: HTMLAudioElement | null = null;
let currentAudioUrl: string | null = null;

const OPENAI_BASE = "https://api.openai.com/v1";

export async function speak(
  text: string,
  voice: "alloy" | "echo" | "nova" = "nova"
): Promise<void> {
  // stop previous audio if any
  try {
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch {
        /* ignore */
      }
      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
      }
      currentAudio = null;
      currentAudioUrl = null;
    }
  } catch {
    /* ignore */
  }

  const res = await fetch(`${OPENAI_BASE}/audio/speech`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1",
      input: text,
      voice,
    }),
  });

  if (!res.ok) {
    let body = "";
    try {
      body = await res.text();
    } catch {
      /* ignore */
    }
    throw new Error(`TTS failed: ${res.status} ${body}`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  currentAudio = audio;
  currentAudioUrl = url;

  return new Promise<void>((resolve, reject) => {
    audio.onended = () => {
      try {
        if (currentAudioUrl) {
          URL.revokeObjectURL(currentAudioUrl);
        }
      } catch {
        /* ignore */
      } finally {
        currentAudio = null;
        currentAudioUrl = null;
        resolve();
      }
    };

    audio.onerror = () => {
      try {
        if (currentAudioUrl) {
          URL.revokeObjectURL(currentAudioUrl);
        }
      } catch {
        /* ignore */
      } finally {
        currentAudio = null;
        currentAudioUrl = null;
        reject(new Error("Audio playback failed"));
      }
    };

    audio.play().catch((err) => {
      // playback failed (autoplay restrictions, etc.)
      // reject so caller can handle it
      reject(err);
    });
  });
}

export async function transcribe(blob: Blob): Promise<string> {
  const form = new FormData();
  form.append("file", blob, "speech.wav");
  form.append("model", "whisper-1");

  const res = await fetch(`${OPENAI_BASE}/audio/transcriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
    },
    body: form,
  });

  if (!res.ok) {
    let body = "";
    try {
      body = await res.text();
    } catch {
      /* ignore */
    }
    throw new Error(`Transcription failed: ${res.status} ${body}`);
  }

  const json = await res.json();
  return (json.text ?? "").toString().trim();
}

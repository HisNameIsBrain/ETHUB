// lib/tts.ts
type SpeakOptions = {
  voice?: string;
  format?: "mp3" | "wav" | "ogg";
};

export async function speakWithOpenAI(text: string, options: SpeakOptions = {}) {
  if (typeof window === "undefined") return;

  const { voice = "alloy", format = "mp3" } = options;

  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice, format }),
  });

  if (!res.ok) throw new Error("TTS request failed");

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  try {
    const audio = new Audio(url);

    await new Promise<void>((resolve, reject) => {
      audio.onended = resolve;
      audio.onerror = () => reject(new Error("Audio playback failed"));
      audio.play().catch(reject);
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

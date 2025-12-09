// src/lib/tts.ts
type SpeakOptions = {
  voice?: string;
  format?: "mp3" | "ogg";
};

/**
 * Keeps the old name but now calls your /api/tts (Gemini) route.
 * Returns when playback has started (or throws on failure).
 */
export async function speakWithOpenAI(
  text: string,
  options: SpeakOptions = {}
): Promise<void> {
  const payload = {
    text,
    voice: options.voice,            // e.g. "Charon"
    format: options.format ?? "mp3", // "mp3" or "ogg"
  };

  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let err: unknown;
    try {
      err = await res.json();
    } catch {
      err = await res.text();
    }
    console.error("TTS HTTP error:", res.status, err);
    throw new Error("TTS request failed");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  return new Promise<void>((resolve, reject) => {
    const audio = new Audio(url);

    audio.onended = () => {
      URL.revokeObjectURL(url);
    };
    audio.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };

    audio
      .play()
      .then(() => {
        resolve();
      })
      .catch((e) => {
        URL.revokeObjectURL(url);
        reject(e);
      });
  });
}

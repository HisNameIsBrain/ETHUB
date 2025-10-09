// lib/tts.ts
type TTSFormat = "mp3" | "wav" | "ogg";

interface SpeakOpts {
  voice?: string;          // defaults to "alloy"
  format?: TTSFormat;      // defaults to "mp3"
  returnAudioEl?: boolean; // if true, returns an <audio> element
  signal?: AbortSignal;    // optional abort controller
}

/**
 * Synthesizes speech using your /api/tts route.
 * - Default: plays audio and returns void
 * - With { returnAudioEl: true }: returns an <audio> element (useful for visualizers)
 */
export async function speakWithOpenAI(
  text: string,
  opts: SpeakOpts = {}
): Promise<void | HTMLAudioElement> {
  const voice = opts.voice ?? "alloy";
  const format: TTSFormat = opts.format ?? "mp3";

  if (!text || typeof text !== "string") {
    throw new Error("TTS failed: Missing `text`");
  }

  const playAudio = (blobUrl: string) => {
    return new Promise<void | HTMLAudioElement>((resolve, reject) => {
      const audio = new Audio(blobUrl);
      audio.onended = () => resolve();
      audio.onerror = (e) => reject(e);
      audio.play().catch(() => resolve()); // ignore autoplay restrictions
      if (opts.returnAudioEl) resolve(audio);
    });
  };

  const fetchAndPlay = async (): Promise<void | HTMLAudioElement> => {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice, format }),
      signal: opts.signal,
    });

    if (!res.ok) {
      const msg = res.headers.get("content-type")?.includes("application/json")
        ? (await res.json()).error
        : (await res.text()).slice(0, 500);
      throw new Error(String(msg || `HTTP ${res.status}`));
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const result = await playAudio(url);
    URL.revokeObjectURL(url);
    return result;
  };

  try {
    return await fetchAndPlay();
  } catch (err: any) {
    const msg = String(err?.message ?? "");
    if (/terminated|timeout|429|502|503|504/i.test(msg)) {
      // retry once after brief delay
      await new Promise((r) => setTimeout(r, 300));
      return await fetchAndPlay();
    }
    throw new Error(`TTS failed: ${msg}`);
  }
}

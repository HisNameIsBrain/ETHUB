// lib/tts.ts
type TTSFormat = "mp3" | "wav" | "ogg";

interface SpeakOpts {
  voice?: string;          // defaults to "alloy"
  format?: TTSFormat;      // defaults to "mp3"
  returnAudioEl?: boolean; // if true, returns an <audio> element
  signal?: AbortSignal;    // optional abort controller
}

/**
 * Calls your /api/tts route to synthesize speech with OpenAI.
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

  async function tryOnce(): Promise<void | HTMLAudioElement> {
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

    const audio = new Audio(url);
    try {
      await audio.play();
    } catch {
      // ignore autoplay restrictions
    }

    return opts.returnAudioEl ? audio : undefined;
  }

  try {
    return await tryOnce();
  } catch (err: any) {
    const msg = String(err?.message ?? "");
    if (/terminated|timeout|429|502|503|504/i.test(msg)) {
      await new Promise((r) => setTimeout(r, 300));
      return await tryOnce();
    }
    throw new Error(`TTS failed: ${msg}`);
  }
}

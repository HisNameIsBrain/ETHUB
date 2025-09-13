// lib/tts.ts
import { voiceBus } from "./voiceBus";

export async function speakWithOpenAI(
  text: string,
  voice: string = "alloy",
  format: "mp3" | "wav" | "ogg" | "pcm" = "mp3",
  source: string = "AssistantLauncher"
) {
  voiceBus.emit("tts:start", { source });
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, voice, format }),
    });
    if (!res.ok) throw new Error(await res.text());

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    await playBlob(url, source);
  } catch (err: any) {
    voiceBus.emit("tts:end", { source, error: String(err?.message ?? err) });
    throw err;
  }
}

async function playBlob(url: string, source: string) {
  const audio = new Audio(url);
  try {
    await audio.play();
  } finally {
    URL.revokeObjectURL(url);
  }
  audio.onended = () => voiceBus.emit("tts:end", { source, error: null });
  audio.onerror = () =>
    voiceBus.emit("tts:end", { source, error: "audio playback error" });
}

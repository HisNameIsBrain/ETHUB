// lib/tts.ts
export async function speakWithOpenAI({
  text,
  voice = "alloy",
  format = "mp3",
}: {
  text: string;
  voice?: string;
  format?: "mp3" | "wav" | "ogg";
}) {
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice, format }),
  });

  if (!res.ok) {
    const ct = res.headers.get("content-type") || "";
    const msg = ct.includes("application/json")
      ? (await res.json()).error
      : (await res.text()).slice(0, 500);
    throw new Error(`TTS failed: ${msg}`);
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
}




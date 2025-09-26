// lib/tts.ts
export async function speakWithOpenAI(
  text: string,
  opts?: { voice?: string; format?: "mp3"|"wav"|"ogg"; model?: string; signal?: AbortSignal }
) {
  const clean = (text ?? "").trim();
  if (!clean) throw new Error("TTS failed: no text provided");

  const body = JSON.stringify({
    text: clean,
    voice: opts?.voice ?? "alloy",
    format: opts?.format ?? "mp3",
    model: opts?.model ?? "gpt-4o-mini-tts",
  });

  const tryOnce = async () => {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      signal: opts?.signal,
      cache: "no-store",
    });
    if (!res.ok) {
      const msg = res.headers.get("content-type")?.includes("application/json")
        ? (await res.json()).error
        : (await res.text()).slice(0, 500);
      throw new Error(msg || `HTTP ${res.status}`);
    }
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  };

  // one retry on “terminated”/transient messages
  try {
    return await tryOnce();
  } catch (e: any) {
    const m = String(e?.message ?? "");
    if (/terminated|timeout|429|502|503|504/i.test(m)) {
      await new Promise(r => setTimeout(r, 250));
      return await tryOnce();
    }
    throw new Error(`TTS failed: ${m}`);
  }
}

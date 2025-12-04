"use client";
import { useEffect, useState } from "react";

export default function VoiceVisualizerGate() {
  const [model, setModel] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const w = globalThis as any;
    const s = w.__assistantState as { model?: string; audioStream?: MediaStream } | undefined;
    if (s?.model) setModel(s.model);
    if (s?.audioStream) setStream(s.audioStream);
    const unsub = w.__onAssistantStateChange?.((next: any) => {
      if (next?.model !== undefined) setModel(next.model);
      if (next?.audioStream !== undefined) setStream(next.audioStream);
    });
    return () => { unsub?.(); };
  }, []);

  if (!(model === "gpt-4o-mini-tts" && stream)) return null;

  const VoiceVisualizer = (globalThis as any).VoiceVisualizerComponent as
    | ((p: { stream: MediaStream }) => JSX.Element)
    | undefined;

  return VoiceVisualizer ? <VoiceVisualizer stream={stream} /> : null;
}

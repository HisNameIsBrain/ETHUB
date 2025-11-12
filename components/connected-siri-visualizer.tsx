"use client";
import * as React from "react";
import SiriGlowVisualizer from "@/components/siri-glow-visualizer";

export default function ConnectedSiriVisualizer({ className = "" }: { className?: string }) {
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [mediaEl, setMediaEl] = React.useState<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    const w = window as any;
    const sub = (s: any) => {
      setStream(s?.audioStream ?? null);
      setMediaEl(s?.mediaEl ?? null);
    };
    if (w.__assistantState) sub(w.__assistantState);
    (w.__assistantSubscribers ||= new Set()).add(sub);
    return () => (w.__assistantSubscribers as Set<Function>).delete(sub);
  }, []);

  const idle = !stream && !mediaEl;

  return (
    <SiriGlowVisualizer
      className={className}
      stream={stream}
      mediaEl={mediaEl}
      idle={idle}
    />
  );
}

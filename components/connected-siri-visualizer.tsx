"use client";
import * as React from "react";
import SiriRibbonVisualizer from "./siri-ribbon-visualizer";

export default function ConnectedSiriVisualizer() {
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [mediaEl, setMediaEl] = React.useState<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    const w = window as any;
    // initial snapshot if present
    if (w.__assistantState) {
      setStream(w.__assistantState.audioStream ?? null);
      setMediaEl(w.__assistantState.mediaEl ?? null);
    }
    // subscribe to changes
    const sub = (s: any) => {
      setStream(s?.audioStream ?? null);
      setMediaEl(s?.mediaEl ?? null);
    };
    (w.__assistantSubscribers ||= new Set()).add(sub);
    return () => (w.__assistantSubscribers as Set<Function>).delete(sub);
  }, []);

  // If neither is attached, show idle animation
  const idle = !stream && !mediaEl;

  return (
    <SiriRibbonVisualizer
      className="absolute inset-0"
      stream={stream}
      mediaEl={mediaEl}
      idle={idle}
    />
  );
}

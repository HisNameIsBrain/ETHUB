
"use client";

import * as React from "react";

type Source = MediaStream | HTMLAudioElement | null;

export function useAudioAnalyser(source: Source, opts?: { fftSize?: number }) {
  const [levels, setLevels] = React.useState<number[]>(Array(32).fill(0));
  const rafRef = React.useRef<number | null>(null);
  const ctxRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const srcNodeRef = React.useRef<MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null>(null);
  const dataRef = React.useRef<Uint8Array | null>(null);

  React.useEffect(() => {
    cancelAnimationFrame(rafRef.current ?? 0);
    rafRef.current = null;

    if (!source) return;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = opts?.fftSize ?? 1024;
    analyser.smoothingTimeConstant = 0.75;

    let src: MediaStreamAudioSourceNode | MediaElementAudioSourceNode;
    if (source instanceof HTMLAudioElement) {
      src = ctx.createMediaElementSource(source);
    } else {
      src = ctx.createMediaStreamSource(source as MediaStream);
    }
    src.connect(analyser);
    analyser.connect(ctx.destination); // keeps graph “alive”; inaudible since we don’t alter gain

    const bins = analyser.frequencyBinCount;
    const data = new Uint8Array(bins);

    ctxRef.current = ctx;
    analyserRef.current = analyser;
    srcNodeRef.current = src;
    dataRef.current = data;

    const tick = () => {
      analyser.getByteFrequencyData(data);
      // downsample to ~32 bars
      const groups = 32;
      const step = Math.floor(bins / groups);
      const out: number[] = [];
      for (let g = 0; g < groups; g++) {
        let sum = 0;
        for (let i = g * step; i < (g + 1) * step; i++) sum += data[i] || 0;
        out.push(sum / step / 255); // normalize 0..1
      }
      setLevels(out);
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(rafRef.current ?? 0);
      try { src.disconnect(); } catch {}
      try { analyser.disconnect(); } catch {}
      try { ctx.close(); } catch {}
      dataRef.current = null;
      analyserRef.current = null;
      srcNodeRef.current = null;
      ctxRef.current = null;
    };
  }, [source, opts?.fftSize]);

  return levels; // array of 32 values in [0..1]
}

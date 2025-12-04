"use client";

import * as React from "react";

type Source = MediaStream | HTMLAudioElement | null;

// ---- single shared AudioContext (saves CPU, avoids multiple contexts)
const getCtx = () =>
  (window as any).__ETHUB_AUDIO_CTX__ ||
  ((window as any).__ETHUB_AUDIO_CTX__ = new (window.AudioContext ||
    (window as any).webkitAudioContext)());

// ---- cache one MediaElementSource per <audio> element
const elementNodeMap = new WeakMap<
  HTMLAudioElement,
  { node: MediaElementAudioSourceNode; refs: number }
>();

export function useAudioAnalyser(source: Source, opts?: { fftSize?: number }) {
  const [levels, setLevels] = React.useState<number[]>(Array(32).fill(0));
  const rafRef = React.useRef<number | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const srcNodeRef = React.useRef<
    MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null
  >(null);
  const dataRef = React.useRef<Uint8Array | null>(null);
  const usedAudioElRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    cancelAnimationFrame(rafRef.current ?? 0);
    rafRef.current = null;

    if (!source) return;

    const ctx = getCtx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = opts?.fftSize ?? 1024;
    analyser.smoothingTimeConstant = 0.75;

    let src: MediaStreamAudioSourceNode | MediaElementAudioSourceNode;

    if (source instanceof HTMLAudioElement) {
      // ✅ reuse the same MediaElementSourceNode for this element
      let cached = elementNodeMap.get(source);
      if (!cached) {
        cached = { node: ctx.createMediaElementSource(source), refs: 0 };
        elementNodeMap.set(source, cached);
      }
      cached.refs += 1;
      src = cached.node;
      usedAudioElRef.current = source;
    } else {
      // For MediaStream we can safely create a fresh node per hook instance
      src = ctx.createMediaStreamSource(source as MediaStream);
    }

    // connect: source -> analyser (no need to connect analyser to destination)
    src.connect(analyser);

    const bins = analyser.frequencyBinCount;
    const data = new Uint8Array(bins);

    analyserRef.current = analyser;
    srcNodeRef.current = src;
    dataRef.current = data;

    const tick = () => {
      analyser.getByteFrequencyData(data);
      // downsample to 32 bars
      const groups = 32;
      const step = Math.max(1, Math.floor(bins / groups));
      const out: number[] = new Array(groups);
      for (let g = 0; g < groups; g++) {
        let sum = 0;
        const start = g * step;
        const end = Math.min(bins, start + step);
        for (let i = start; i < end; i++) sum += data[i] || 0;
        out[g] = (sum / (end - start)) / 255; // normalize 0..1
      }
      setLevels(out);
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(rafRef.current ?? 0);

      try {
        // disconnect analyser from the graph
        analyser.disconnect();
      } catch {}

      if (source instanceof HTMLAudioElement) {
        // decrement refcount; keep the cached node alive if other users exist
        const cached = elementNodeMap.get(source);
        if (cached) {
          cached.refs = Math.max(0, cached.refs - 1);
          // We don't disconnect the cached node from anything else here:
          // it’s safe to leave; it only connected to `analyser` we just disconnected.
          // When refs hits 0, you *could* delete the map entry to allow GC:
          if (cached.refs === 0) {
            elementNodeMap.delete(source);
          }
        }
      } else {
        // MediaStream node was created just for this hook instance — disconnect it
        try {
          (srcNodeRef.current as MediaStreamAudioSourceNode | null)?.disconnect();
        } catch {}
      }

      analyserRef.current = null;
      srcNodeRef.current = null;
      dataRef.current = null;
      usedAudioElRef.current = null;
    };
  }, [source, opts?.fftSize]);

  return levels; // array of 32 values in [0..1]
}

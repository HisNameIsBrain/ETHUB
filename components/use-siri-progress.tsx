"use client";

import { useEffect, useRef, useState } from "react";

export function useSiriProgress({ auto = true }: { auto?: boolean } = {}) {
  const [progress, setProgress] = useState(0); // 0..1
  const raf = useRef<number | null>(null);

  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  const cancel = () => { if (raf.current) cancelAnimationFrame(raf.current); raf.current = null; };

  const start = () => {
    cancel();
    setProgress(0.04);
    const tick = () => {
      setProgress((p) => clamp(p + (0.92 - p) * 0.10));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  const complete = () => {
    cancel();
    setProgress(1);
    setTimeout(() => setProgress(0), 300);
  };

  const reset = () => { cancel(); setProgress(0); };

  useEffect(() => {
    if (!auto) return;
    if (document.readyState === "loading") start();
    else if (document.readyState === "interactive") setProgress(0.6);
    else setProgress(0);

    const onChange = () => { if (document.readyState === "complete") complete(); };
    const onBeforeUnload = () => start();

    document.addEventListener("readystatechange", onChange);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      cancel();
      document.removeEventListener("readystatechange", onChange);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto]);

  return { progress, setProgress, start, complete, reset };
}

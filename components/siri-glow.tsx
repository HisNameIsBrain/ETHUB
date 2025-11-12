"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";

export type SiriGlowProps = {
  height?: string;
  position?: "top" | "bottom";
  className?: string;
  progress?: number; // 0..1; if provided, component is controlled
  auto?: boolean; // auto = use document.readyState + beforeunload
  glowStrength?: number;
};

export function SiriGlow({
  height = "4px",
  position = "top",
  className = "",
  progress,
  auto = true,
  glowStrength = 12,
}: SiriGlowProps) {
  const [internal, setInternal] = useState(0);
  const controls = useAnimationControls();
  const raf = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const pct = Math.max(0, Math.min(1, progress ?? internal));
  const barWidth = useMemo(() => `${pct * 100}%`, [pct]);

  useEffect(() => {
    controls.start({
      backgroundPosition: ["0% 50%", "100% 50%"],
      transition: { repeat: Infinity, duration: 2, ease: "linear" },
    });
  }, [controls]);

  useEffect(() => {
    if (!auto || progress !== undefined) return;

    const clamp = (v: number) => Math.max(0, Math.min(1, v));

    const cancel = () => {
      if (raf.current !== null) {
        cancelAnimationFrame(raf.current);
        raf.current = null;
      }
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const tick = () => {
      setInternal((prev) => {
        const inc = prev < 0.7 ? 0.02 : 0.005;
        return clamp(prev + inc);
      });
      raf.current = requestAnimationFrame(tick);
    };

    const start = () => {
      cancel();
      setInternal(0.02);
      raf.current = requestAnimationFrame(tick);
    };

    const complete = () => {
      cancel();
      setInternal(1);
      timeoutRef.current = window.setTimeout(() => {
        setInternal(0);
      }, 400);
    };

    if (document.readyState === "loading") {
      start();
    } else if (document.readyState === "interactive") {
      setInternal(0.6);
    } else {
      setInternal(0);
    }

    const onReadyStateChange = () => {
      if (document.readyState === "complete") {
        complete();
      }
    };

    const onBeforeUnload = () => {
      start();
    };

    document.addEventListener("readystatechange", onReadyStateChange);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      cancel();
      document.removeEventListener("readystatechange", onReadyStateChange);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [auto, progress]);

  const gradient =
    "linear-gradient(90deg, red, orange, yellow, green, cyan, blue, violet)";

  const visible = pct > 0 && pct < 1 ? 1 : pct === 1 ? 1 : 0;

  return (
    <>
      <motion.div
        className={`pointer-events-none fixed ${position}-0 left-0 z-50 ${className}`}
        style={{
          height,
          width: barWidth,
          filter: `blur(${glowStrength}px)`,
          opacity: visible * 0.55,
          background: gradient,
          backgroundSize: "400% 100%",
        }}
        animate={controls}
      />
      <motion.div
        className={`fixed ${position}-0 left-0 z-50 ${className}`}
        style={{
          height,
          width: barWidth,
          opacity: visible,
          background: gradient,
          backgroundSize: "400% 100%",
        }}
        animate={controls}
      />
    </>
  );
}

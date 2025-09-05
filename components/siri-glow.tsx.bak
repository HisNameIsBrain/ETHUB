"use client";
import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

type SiriGlowProps = {
  height ? : string; // e.g. "4px"
  position ? : "top" | "bottom";
  className ? : string;
  progress ? : number; // 0..1 (if provided, controls width directly)
  auto ? : boolean; // true = track document readyState / reloads
  glowStrength ? : number; // px blur for glow
};

export function SiriGlow({
  height = "4px",
  position = "top",
  className = "",
  progress, // controlled
  auto = true,
  glowStrength = 12,
}: SiriGlowProps) {
  const [internal, setInternal] = useState(0); // 0..1
  const controls = useAnimationControls();
  const raf = useRef < number | null > (null);
  
  const pct = Math.max(0, Math.min(1, progress ?? internal));
  const barWidth = useMemo(() => `${pct * 100}%`, [pct]);
  
  // Animate rainbow sweep forever
  useEffect(() => {
    controls.start({
      backgroundPosition: [&quot;0% 50%&quot;, &quot;100% 50%&quot;],
      transition: { repeat: Infinity, duration: 2, ease: &quot;linear&quot; },
    });
  }, [controls]);
  
  // Auto-progress based on document readyState + a “smart” loader curve
  useEffect(() => {
    if (!auto || progress !== undefined) return;
    
    const clamp = (v: number) => Math.max(0, Math.min(1, v));
    
    const tick = () => {
      setInternal((p) => {
        // Ease: approach 0.9 asymptotically while loading
        const next = p + (0.9 - p) * 0.08; // faster at start, slower near 90%
        return clamp(next);
      });
      raf.current = requestAnimationFrame(tick);
    };
    
    const start = () => {
      cancel();
      setInternal(0.02); // jump visible
      raf.current = requestAnimationFrame(tick);
    };
    
    const complete = () => {
      cancel();
      setInternal(1);
      // fade out after short delay
      setTimeout(() => setInternal(0), 400);
    };
    
    const cancel = () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = null;
    };
    
    // initial state on mount
    if (document.readyState === &quot;loading&quot;) start();
    else if (document.readyState === &quot;interactive&quot;) setInternal(0.6);
    else setInternal(0);
    
    const onReady = () => complete();
    const onBeforeUnload = () => start(); // when user reloads/navigates away
    
    document.addEventListener(&quot;readystatechange&quot;, () => {
      if (document.readyState === &quot;complete&quot;) onReady();
    });
    window.addEventListener(&quot;beforeunload&quot;, onBeforeUnload);
    
    return () => {
      cancel();
      window.removeEventListener(&quot;beforeunload&quot;, onBeforeUnload);
    };
  }, [auto, progress]);
  
  // Style bits (rainbow + glow)
  const gradient =
    &quot;linear-gradient(90deg, red, orange, yellow, green, cyan, blue, violet)&quot;;
  
  const visible = pct > 0 && pct < 1 ? 1 : pct === 1 ? 1 : 0;
  
  return (
    <>
      {/* Glow */}
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
      {/* Solid bar */}
      <motion.div
        className={`fixed ${position}-0 left-0 w-0 z-50 ${className}`}
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

export default SiriGlow;
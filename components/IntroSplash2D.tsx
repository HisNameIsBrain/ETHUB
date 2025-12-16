"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

export function IntroSplash2D({
  enterMs = 900,
  holdMs = 1100,
  exitMs = 600,
}: {
  enterMs?: number;
  holdMs?: number;
  exitMs?: number;
}) {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");

  useEffect(() => {
    const a = window.setTimeout(() => setPhase("hold"), enterMs);
    const b = window.setTimeout(() => setPhase("exit"), enterMs + holdMs);
    const c = window.setTimeout(() => setVisible(false), enterMs + holdMs + exitMs);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
      window.clearTimeout(c);
    };
  }, [enterMs, holdMs, exitMs]);

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key="intro2d"
          className="fixed inset-0 z-[9999] grid place-items-center bg-black"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          aria-label="Loading ETHUB"
        >
          {/* background mood */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(34,211,238,0.12),transparent_52%),radial-gradient(circle_at_30%_70%,rgba(168,85,247,0.12),transparent_60%),radial-gradient(circle_at_70%_75%,rgba(244,114,182,0.10),transparent_60%)]" />

          <Blob phase={phase} />

          {/* ETHUB */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="select-none text-center">
              <div className="ethub-live text-3xl sm:text-4xl font-semibold tracking-[0.45em] text-white">
                ETHUB
              </div>
              <div className="mt-2 text-[10px] sm:text-xs tracking-[0.25em] text-white/75">
                Loading your workspace
              </div>
            </div>
          </div>

          <style jsx global>{`
            .ethub-live {
              text-shadow:
                0 0 10px rgba(56,189,248,.6),
                0 0 20px rgba(168,85,247,.5),
                0 0 32px rgba(244,114,182,.4);
              animation: ethubPulse 1.6s ease-in-out infinite;
            }
            @keyframes ethubPulse {
              0% { transform: scale(1); opacity:.9 }
              50% { transform: scale(1.03); opacity:1 }
              100% { transform: scale(1); opacity:.9 }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- PHYSICAL BLOB ---------------- */

function Blob({ phase }: { phase: "enter" | "hold" | "exit" }) {
  const size = 420;

  // physical drop Y
  const y = useMotionValue(phase === "enter" ? -180 : 0);
  const springY = useSpring(y, { stiffness: 150, damping: 18, mass: 0.95 });

  // wobble power based on velocity
  const wobble = useMotionValue(0);
  const lastY = useRef(0);

  useEffect(() => {
    const unsub = springY.on("change", (v) => {
      const vel = v - lastY.current;
      lastY.current = v;
      wobble.set(Math.min(1, Math.abs(vel) / 18));
    });
    return unsub;
  }, [springY, wobble]);

  // enter/exit triggers
  useEffect(() => {
    if (phase === "enter") y.set(0);
    if (phase === "exit") y.set(240);
  }, [phase, y]);

  // transforms derived from wobble (no wobble.to)
  const scaleX = useTransform(wobble, (v) => 1 + v * 0.12); // more wabbly
  const scaleY = useTransform(wobble, (v) => 1 - v * 0.10);
  const rotate = useTransform(wobble, (v) => (phase === "exit" ? 6 : 0) + v * 4);
  const blur = useTransform(wobble, (v) => `blur(${Math.min(10, v * 6)}px)`);

  return (
    <motion.div
      className="relative"
      style={{ y: springY, filter: blur }}
      initial={{ opacity: 0, scale: 1.3 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="block"
        style={{ scaleX, scaleY, rotate, transformOrigin: "50% 50%" }}
        aria-hidden="true"
      >
        <defs>
          {/* flowing iridescence */}
          <linearGradient id="iridescence" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="35%" stopColor="#a855f7" />
            <stop offset="65%" stopColor="#f472b6" />
            <stop offset="85%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>

          {/* interior banding to mimic depth */}
          <radialGradient id="membrane" cx="44%" cy="36%" r="70%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.65)" />
            <stop offset="28%" stopColor="rgba(125,211,252,0.28)" />
            <stop offset="55%" stopColor="rgba(168,85,247,0.22)" />
            <stop offset="78%" stopColor="rgba(244,114,182,0.14)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.0)" />
          </radialGradient>

          {/* Strong wobble distortion */}
          <filter id="wobbleFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.016"
              numOctaves="2"
              seed="9"
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="1.35s"
                values="0.012;0.024;0.014"
                repeatCount="indefinite"
              />
              <animate
                attributeName="seed"
                dur="2.4s"
                values="7;11;9"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="22"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {/* glow */}
          <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* membrane fill */}
        <path
          d="
            M50,7
            C73,7 88,22 91,40
            C94,60 81,80 64,90
            C47,99 28,95 17,82
            C5,67 6,45 14,30
            C22,13 34,7 50,7 Z
          "
          fill="url(#membrane)"
          opacity="0.95"
          filter="url(#wobbleFilter)"
        />

        {/* rainbow rim */}
        <path
          d="
            M50,7
            C73,7 88,22 91,40
            C94,60 81,80 64,90
            C47,99 28,95 17,82
            C5,67 6,45 14,30
            C22,13 34,7 50,7 Z
          "
          fill="none"
          stroke="url(#iridescence)"
          strokeWidth="3.4"
          opacity="0.92"
          filter="url(#glow)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="10 7"
        >
          <animate attributeName="stroke-dashoffset" dur="1.1s" values="0;-34" repeatCount="indefinite" />
        </path>

        {/* specular highlight */}
        <ellipse
          cx="40"
          cy="30"
          rx="18"
          ry="12"
          fill="rgba(255,255,255,0.32)"
          filter="url(#glow)"
        />

        {/* inner contour line */}
        <path
          d="
            M50,12
            C69,12 81,25 84,39
            C87,55 79,71 64,80
            C50,88 36,87 27,78
            C16,67 15,51 20,38
            C26,23 36,12 50,12 Z
          "
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1.2"
          opacity="0.75"
        />
      </motion.svg>

      <style jsx>{`
        /* subtle hue travel */
        svg {
          animation: hueSpin 6s linear infinite;
        }
        @keyframes hueSpin {
          0% { filter: hue-rotate(0deg) saturate(1.25); }
          100% { filter: hue-rotate(360deg) saturate(1.25); }
        }
      `}</style>
    </motion.div>
  );
}

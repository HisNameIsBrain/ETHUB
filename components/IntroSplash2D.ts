"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";

export function IntroSplash2D({
  holdMs = 1600,
  minMs = 900,
}: {
  holdMs?: number;
  minMs?: number;
}) {
  const [show, setShow] = React.useState(true);
  const started = React.useRef<number>(0);
  const done = React.useRef(false);

  React.useEffect(() => {
    started.current = performance.now();
    const t = window.setTimeout(() => {
      if (done.current) return;
      done.current = true;

      const elapsed = performance.now() - started.current;
      const remain = Math.max(0, minMs - elapsed);
      window.setTimeout(() => setShow(false), remain);
    }, holdMs);

    return () => window.clearTimeout(t);
  }, [holdMs, minMs]);

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key="intro2d"
          className="fixed inset-0 z-[9999] grid place-items-center bg-black"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          aria-label="Loading ETHUB"
        >
          {/* background mood */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(34,211,238,0.12),transparent_52%),radial-gradient(circle_at_30%_70%,rgba(168,85,247,0.12),transparent_60%),radial-gradient(circle_at_70%_75%,rgba(244,114,182,0.10),transparent_60%)]" />

          <motion.div
            className="relative h-[320px] w-[320px] sm:h-[420px] sm:w-[420px]"
            initial={{ scale: 1.35, opacity: 0, filter: "blur(10px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            exit={{ scale: 0.98, opacity: 0, filter: "blur(14px)" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <IridescentBlobSVG />
            {/* center text */}
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
          </motion.div>

          <style jsx global>{`
            .ethub-live {
              text-shadow:
                0 0 10px rgba(34, 211, 238, 0.55),
                0 0 18px rgba(168, 85, 247, 0.45),
                0 0 28px rgba(244, 114, 182, 0.35);
              animation: ethubPulse 1.6s ease-in-out infinite,
                hueSpin 5.5s linear infinite;
            }
            @keyframes ethubPulse {
              0% { transform: scale(1); opacity: 0.95; }
              50% { transform: scale(1.03); opacity: 1; }
              100% { transform: scale(1); opacity: 0.95; }
            }
            @keyframes hueSpin {
              0% { filter: hue-rotate(0deg) saturate(1.25); }
              100% { filter: hue-rotate(360deg) saturate(1.25); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function IridescentBlobSVG() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
      <defs>
        {/* Stronger wobble: displacement + animated turbulence */}
        <filter id="wobble" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.018"
            numOctaves="2"
            seed="8"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              dur="2.2s"
              values="0.014;0.024;0.016"
              repeatCount="indefinite"
            />
            <animate
              attributeName="seed"
              dur="3.4s"
              values="7;10;8"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="18"
            xChannelSelector="R"
            yChannelSelector="G"
          >
            <animate
              attributeName="scale"
              dur="1.3s"
              values="14;22;16"
              repeatCount="indefinite"
            />
          </feDisplacementMap>
        </filter>

        {/* Glow */}
        <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.1" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Iridescent fill */}
        <radialGradient id="membrane" cx="45%" cy="38%" r="70%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
          <stop offset="28%" stopColor="rgba(125,211,252,0.35)" />
          <stop offset="55%" stopColor="rgba(168,85,247,0.28)" />
          <stop offset="78%" stopColor="rgba(244,114,182,0.18)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.0)" />
        </radialGradient>

        {/* Rainbow edge (animated via hue rotation on group) */}
        <linearGradient id="rainbow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="25%" stopColor="#a855f7" />
          <stop offset="55%" stopColor="#f472b6" />
          <stop offset="80%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>

        {/* Specular highlight */}
        <radialGradient id="spec" cx="35%" cy="30%" r="45%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.70)" />
          <stop offset="35%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.0)" />
        </radialGradient>
      </defs>

      {/* Hue spin on entire blob for “iridescence travel” */}
      <g
        filter="url(#wobble)"
        style={{
          transformOrigin: "50px 50px",
          animation: "blobHue 6s linear infinite",
        }}
      >
        {/* membrane body */}
        <path
          d="M50,9
             C71,9 86,22 90,40
             C94,59 83,79 67,89
             C52,98 32,95 21,83
             C8,69 7,49 13,33
             C19,16 33,9 50,9 Z"
          fill="url(#membrane)"
          opacity="0.92"
        />

        {/* rainbow rim */}
        <path
          d="M50,9
             C71,9 86,22 90,40
             C94,59 83,79 67,89
             C52,98 32,95 21,83
             C8,69 7,49 13,33
             C19,16 33,9 50,9 Z"
          fill="none"
          stroke="url(#rainbow)"
          strokeWidth="3.2"
          opacity="0.9"
          filter="url(#glow)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="7 6"
          style={{
            animation: "dashFlow 1.25s linear infinite",
          }}
        />

        {/* inner soft rim */}
        <path
          d="M50,12
             C68,12 81,24 84,39
             C87,55 79,72 64,81
             C51,89 37,87 27,78
             C16,67 15,50 20,37
             C25,22 36,12 50,12 Z"
          fill="none"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="1.2"
          opacity="0.7"
        />

        {/* spec highlight */}
        <ellipse cx="41" cy="33" rx="18" ry="14" fill="url(#spec)" opacity="0.85" />

        {/* ambient halo */}
        <circle
          cx="50"
          cy="50"
          r="35"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="12"
          filter="url(#glow)"
        />
      </g>

      <style>{`
        @keyframes dashFlow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -26; }
        }
        @keyframes blobHue {
          0% { filter: hue-rotate(0deg) saturate(1.25); }
          100% { filter: hue-rotate(360deg) saturate(1.25); }
        }
      `}</style>
    </svg>
  );
}

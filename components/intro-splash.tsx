"use client";

import { AnimatePresence, motion, useAnimation } from "framer-motion";
import React from "react";

export function IntroSplash({
  minMs = 900,
  dropDelayMs = 900,
}: {
  minMs?: number;
  dropDelayMs?: number;
}) {
  const [show, setShow] = React.useState(true);
  const bubble = useAnimation();
  const text = useAnimation();

  React.useEffect(() => {
    let alive = true;

    const run = async () => {
      await bubble.start("in");
      await text.start("in");

      await new Promise((r) => setTimeout(r, dropDelayMs));

      // drop & dissolve
      text.start("drop");
      await bubble.start("drop");

      // ensure minimum on-screen time
      await new Promise((r) => setTimeout(r, minMs));
      if (!alive) return;
      setShow(false);
    };

    run();
    return () => {
      alive = false;
    };
  }, [bubble, text, dropDelayMs, minMs]);

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[9999] grid place-items-center bg-background/70 backdrop-blur-xl"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          aria-label="Loading ETHUB"
        >
          {/* water base */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42vh] bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.20),transparent_55%),radial-gradient(circle_at_20%_40%,rgba(168,85,247,0.14),transparent_55%),radial-gradient(circle_at_80%_65%,rgba(244,114,182,0.12),transparent_55%)]" />

          <motion.div
            className="relative h-[340px] w-[340px] sm:h-[460px] sm:w-[460px]"
            initial="initial"
            animate={bubble}
            variants={{
              initial: { opacity: 0, scale: 0.92, y: 10, filter: "blur(10px)" },
              in: {
                opacity: 1,
                scale: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { duration: 0.6, ease: "easeOut" },
              },
              drop: {
                y: 240,
                scale: 0.92,
                opacity: [1, 1, 0],
                filter: ["blur(0px)", "blur(0px)", "blur(16px)"],
                transition: { duration: 0.7, ease: "easeInOut" },
              },
            }}
          >
            {/* Procedural bubble (outline glow + distortion) */}
            <BubbleGlow />

            {/* ETHUB inside bubble */}
            <motion.div
              className="absolute inset-0 grid place-items-center"
              initial="initial"
              animate={text}
              variants={{
                initial: { opacity: 0, scale: 0.98, y: 4, filter: "blur(6px)" },
                in: {
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: { duration: 0.5, ease: "easeOut", delay: 0.12 },
                },
                drop: {
                  y: 220,
                  scale: 0.86,
                  opacity: [1, 1, 0],
                  filter: ["blur(0px)", "blur(0px)", "blur(14px)"],
                  transition: { duration: 0.75, ease: "easeInOut" },
                },
              }}
            >
              <div className="text-center">
                <div className="ethub-glow select-none text-3xl sm:text-4xl font-semibold tracking-[0.45em] text-foreground">
                  ETHUB
                </div>
                <div className="mt-2 text-[10px] sm:text-xs tracking-[0.25em] text-foreground/80">
                  Loading your workspace
                </div>
              </div>
            </motion.div>

            {/* dissolve spray (kicks in near drop) */}
            <motion.div
              className="pointer-events-none absolute inset-x-0 bottom-10 mx-auto h-24 w-72 rounded-full"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0, 0.6, 0],
                y: [0, 0, 8, 12],
                filter: ["blur(10px)", "blur(10px)", "blur(2px)", "blur(18px)"],
              }}
              transition={{
                delay: (dropDelayMs + 80) / 1000,
                duration: 0.9,
                ease: "easeOut",
              }}
              style={{
                background:
                  "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.38), transparent 65%)",
                mixBlendMode: "screen",
              }}
            />
          </motion.div>

          <style jsx global>{`
            /* ETHUB live outer glow (dynamic) */
            .ethub-glow {
              text-shadow:
                0 0 12px rgba(56, 189, 248, 0.55),
                0 0 22px rgba(168, 85, 247, 0.45),
                0 0 34px rgba(244, 114, 182, 0.35);
              animation: ethubPulse 1.8s ease-in-out infinite,
                ethubHue 5.5s linear infinite;
              filter: saturate(1.2);
            }
            @keyframes ethubPulse {
              0% { transform: translateZ(0) scale(1); opacity: 0.95; }
              50% { transform: translateZ(0) scale(1.02); opacity: 1; }
              100% { transform: translateZ(0) scale(1); opacity: 0.95; }
            }
            @keyframes ethubHue {
              0% { filter: hue-rotate(0deg) saturate(1.25); }
              100% { filter: hue-rotate(360deg) saturate(1.25); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Bubble outline with rainbow glow + “liquid” distortion.
 * Uses SVG turbulence + displacement (physics-like flow), plus animated hue.
 */
function BubbleGlow() {
  return (
    <div className="absolute inset-0">
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full"
        aria-hidden="true"
      >
        <defs>
          {/* Liquid distortion */}
          <filter id="liquid">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012"
              numOctaves="2"
              seed="8"
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="6s"
                values="0.010;0.014;0.010"
                repeatCount="indefinite"
              />
              <animate
                attributeName="seed"
                dur="8s"
                values="7;9;7"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="7"
              xChannelSelector="R"
              yChannelSelector="G"
            >
              <animate
                attributeName="scale"
                dur="2.8s"
                values="5;9;5"
                repeatCount="indefinite"
              />
            </feDisplacementMap>
          </filter>

          {/* Glow */}
          <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Animated rainbow stroke */}
          <linearGradient id="rainbow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="25%" stopColor="#a855f7" />
            <stop offset="55%" stopColor="#f472b6" />
            <stop offset="80%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>

        {/* Core bubble fill */}
        <g filter="url(#liquid)">
          <path
            d="M50,8
               C70,8 87,22 90,40
               C93,58 82,78 66,88
               C52,97 34,94 22,82
               C9,68 8,48 14,33
               C20,17 33,8 50,8 Z"
            fill="rgba(255,255,255,0.06)"
          />

          {/* thick glow stroke */}
          <path
            d="M50,8
               C70,8 87,22 90,40
               C93,58 82,78 66,88
               C52,97 34,94 22,82
               C9,68 8,48 14,33
               C20,17 33,8 50,8 Z"
            fill="none"
            stroke="url(#rainbow)"
            strokeWidth="2.8"
            opacity="0.85"
            filter="url(#glow)"
            style={{
              strokeLinecap: "round",
              strokeLinejoin: "round",
              animation: "strokeFlow 2.2s linear infinite, hueSpin 5.2s linear infinite",
              strokeDasharray: "6 6",
            }}
          />

          {/* inner highlight stroke */}
          <path
            d="M50,12
               C68,12 82,24 85,39
               C88,55 79,73 64,82
               C50,90 36,88 26,78
               C15,66 14,49 19,36
               C25,21 36,12 50,12 Z"
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1.2"
            opacity="0.6"
            filter="url(#glow)"
          />
        </g>

        <style>{`
          @keyframes strokeFlow {
            0% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: -24; }
          }
          @keyframes hueSpin {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
          }
        `}</style>
      </svg>

      {/* ambient halo */}
      <div className="pointer-events-none absolute inset-0 rounded-full blur-2xl opacity-50 [background:conic-gradient(from_90deg,rgba(34,211,238,0.35),rgba(168,85,247,0.28),rgba(244,114,182,0.26),rgba(245,158,11,0.24),rgba(34,211,238,0.35))] animate-[spin_7s_linear_infinite]" />
    </div>
  );
}

"use client";

import React, { useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useAnimationControls,
} from "framer-motion";

type EthubDropletIntroProps = {
  onDone?: () => void;
};

export function EthubDropletIntro({ onDone }: EthubDropletIntroProps) {
  const controls = useAnimationControls();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      await controls.start({
        y: ["-60vh", "0vh"],
        scaleX: [0.6, 1.2, 0.9, 1],
        scaleY: [0.9, 0.7, 1.15, 1],
        opacity: [0, 1, 1, 1],
        transition: {
          duration: 1.4,
          ease: [0.2, 0.8, 0.2, 1],
        },
      });

      if (cancelled) return;

      await controls.start({
        y: ["0vh", "-4vh", "2vh", "0vh"],
        scaleX: [1, 1.05, 0.98, 1],
        scaleY: [1, 0.95, 1.02, 1],
        transition: {
          duration: 0.9,
          ease: "easeOut",
        },
      });

      if (cancelled) return;

      await new Promise((r) => setTimeout(r, 700));
      if (cancelled) return;

      await controls.start({
        y: ["0vh", "80vh"],
        opacity: [1, 0],
        scaleX: [1, 0.9],
        scaleY: [1, 1.1],
        transition: {
          duration: 0.9,
          ease: [0.4, 0, 1, 1],
        },
      });

      if (!cancelled) onDone?.();
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [controls, onDone]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-xl"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.4 } }}
      >
        {/* subtle background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black to-blue-900/40" />

        {/* droplet halo (faint radiation) */}
        <motion.div
          className="absolute rounded-full blur-3xl"
          style={{ width: 260, height: 260 }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.35, 0.45, 0.35],
          }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.6), transparent 55%), radial-gradient(circle at 70% 80%, rgba(0,255,255,0.4), transparent 55%), radial-gradient(circle at 20% 80%, rgba(255,0,180,0.45), transparent 55%)",
            }}
          />
        </motion.div>

        {/* main droplet */}
        <motion.div
          animate={controls}
          className="relative"
          style={{ width: 180, height: 180 }}
        >
          {/* rainbow rim with shadow below it */}
          <div
            className="absolute -inset-[4px] rounded-[999px]"
            style={{
              background:
                "conic-gradient(from 0deg, #ff00f5, #ff8c00, #ffe600, #00f5ff, #0066ff, #b300ff, #ff00f5)",
              WebkitMask:
                "radial-gradient(circle at 50% 50%, transparent calc(50% - 2px), black calc(50% - 1px))",
              mask: "radial-gradient(circle at 50% 50%, transparent calc(50% - 2px), black calc(50% - 1px))",
              filter: "drop-shadow(0 0 10px rgba(0,0,0,0.9)) drop-shadow(0 0 16px rgba(255,255,255,0.25))",
            }}
          />

          {/* chrome / rainbow liquid interior */}
          <div
            className="absolute inset-0 rounded-[999px]"
            style={{
              background:
                "radial-gradient(120% 140% at 20% 0%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.1) 40%, transparent 70%), " +
                "radial-gradient(120% 120% at 15% 80%, rgba(0,255,200,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 80%), " +
                "radial-gradient(140% 140% at 80% 20%, rgba(255,0,180,0.9) 0%, rgba(0,0,0,0.4) 55%, transparent 85%), " +
                "radial-gradient(120% 120% at 60% 90%, rgba(0,120,255,0.95) 0%, rgba(0,0,0,0.35) 55%, transparent 85%)",
              boxShadow:
                "inset 0 0 30px rgba(255,255,255,0.6), inset 0 -22px 40px rgba(0,0,0,0.65), 0 16px 40px rgba(0,0,0,0.9)",
            }}
          />

          {/* subtle specular streaks */}
          <div
            className="absolute inset-[18%] rounded-[999px] opacity-80 mix-blend-screen"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.9), transparent 55%), linear-gradient(315deg, rgba(255,255,255,0.5), transparent 55%)",
            }}
          />

          {/* tiny inner logo / mark (optional) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-[11px] font-semibold tracking-[0.18em] uppercase text-white/90">
              ETHUB
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

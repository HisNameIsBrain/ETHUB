// components/top-siri-loader.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SiriGlow } from "@/components/siri-glow";

const DURATION_MS = 1200; // long enough for 2 full sweeps

export default function TopSiriLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), DURATION_MS);
    return () => clearTimeout(t);
  }, [pathname]);
  
  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="progressbar"
            aria-busy="true"
            className="fixed top-0 left-0 right-0 z-[9999] h-[6px] pointer-events-none"
          >
            {/* Core bright bar (crisp) */}
            <div className="relative h-full">
              {/* Blurry glow layer (neon aura) */}
              <div className="absolute inset-0 -z-10 blur-[10px] brightness-200 will-change-transform">
                <RainbowSweep />
              </div>

              {/* Crisp sweep on top */}
              <div className="absolute inset-0 will-change-transform">
                <RainbowSweep />
              </div>

              {/* Existing SiriGlow, tightened to height and brightened */}
              <div className="absolute inset-0 mix-blend-screen brightness-[1.6]">
                <SiriGlow height="6px" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyframes local to this component */}
      <style jsx>{`
        @keyframes sweep {
          0% {
            transform: translateX(-30%);
          }
          100% {
            transform: translateX(130%);
          }
        }
        @keyframes hueShift {
          0% {
            filter: hue-rotate(0deg);
          }
          100% {
            filter: hue-rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}

/** Animated rainbow bar that sweeps across exactly twice */
function RainbowSweep() {
  // Two full sweeps with a single element by using animation-iteration-count: 2
  return (
    <div className="relative h-full overflow-hidden">
      <div
        className="
          absolute top-0 h-full w-[35%]
          rounded-none
          shadow-[0_0_16px_4px_rgba(255,255,255,0.75)]
        "
        style={{
          animation: `sweep 0.6s linear 0s 2 both, hueShift 1.2s linear infinite`,
          // Bright neon rainbow gradient
          background:
            "linear-gradient(90deg, #ff0080, #ff8c00, #ffee00, #00ff85, #00cfff, #7a5cff, #ff0080)",
          backgroundSize: "200% 100%",
          filter: "saturate(1.6) contrast(1.3)",
        }}
      />
      {/* Faint base line for perceived brightness */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.15), rgba(255,255,255,0.25), rgba(255,255,255,0.15))",
        }}
      />
    </div>
  );
}
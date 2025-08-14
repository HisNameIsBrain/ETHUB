// components/top-siri-loader.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SiriGlow } from "@/components/siri-glow";

const SWEEP_ONCE_MS = 600; // one pass
const TOTAL_MS = SWEEP_ONCE_MS * 2; // exactly two full swipes

export default function TopSiriLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), TOTAL_MS);
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
            className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
          >
            {/* Track area: 6px bar + 48px aurora pool below */}
            <div className="relative h-[54px]">
              {/* --- The bar area (top 6px) --- */}
              <div className="absolute inset-x-0 top-0 h-[6px]">
                {/* Blurry neon aura directly around the bar */}
                <div className="absolute inset-0 -z-10 blur-[10px] brightness-200 will-change-transform">
                  <RainbowSweep />
                </div>

                {/* Crisp sweep */}
                <div className="absolute inset-0 will-change-transform">
                  <RainbowSweep />
                </div>

                {/* Your SiriGlow, brightened */}
                <div className="absolute inset-0 mix-blend-screen brightness-[1.6]">
                  <SiriGlow height="6px" />
                </div>
              </div>

              {/* --- Aurora ink pool (below the bar) --- */}
              <AuroraPool />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Local keyframes */}
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
        @keyframes auroraDrift {
          0% {
            transform: translateX(-10%) translateY(0);
          }
          100% {
            transform: translateX(10%) translateY(0);
          }
        }
      `}</style>
    </>
  );
}

/** Bright rainbow segment that sweeps exactly twice */
function RainbowSweep() {
  return (
    <div className="relative h-full overflow-hidden">
      <div
        className="absolute top-0 h-full w-[35%] shadow-[0_0_16px_6px_rgba(255,255,255,0.8)]"
        style={{
          animation: `sweep ${SWEEP_ONCE_MS}ms linear 0s 2 both, hueShift ${
            SWEEP_ONCE_MS * 2
          }ms linear infinite`,
          background:
            "linear-gradient(90deg,#ff0080,#ff8c00,#ffee00,#00ff85,#00cfff,#7a5cff,#ff0080)",
          backgroundSize: "200% 100%",
          filter: "saturate(1.7) contrast(1.25)",
          borderRadius: 0,
        }}
      />
      {/* subtle base line to lift brightness */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg,rgba(255,255,255,0.12),rgba(255,255,255,0.22),rgba(255,255,255,0.12))",
        }}
      />
    </div>
  );
}

/** Bottom “ink / aurora borealis” pool: blurred, semi-transparent, fades to transparent */
function AuroraPool() {
  return (
    <div className="absolute left-0 right-0 top-[6px] h-[48px] overflow-visible">
      {/* Layer 1: broad soft bloom that fades out toward the bottom */}
      <div
        className="
          absolute inset-x-0 top-0 h-full
          blur-[22px] opacity-70
          will-change-transform
        "
        style={{
          background:
            "radial-gradient(120% 100% at 50% 0%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.0) 70%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0.05))",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0.05))",
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Layer 2: aurora color ribbons with soft transparency and drift */}
      <div
        className="absolute inset-x-0 top-0 h-full opacity-65 blur-[18px] mix-blend-screen"
        style={{
          background:
            "conic-gradient(from 210deg at 50% -10%, rgba(255,0,128,0.6), rgba(255,140,0,0.6), rgba(255,238,0,0.5), rgba(0,255,133,0.55), rgba(0,207,255,0.55), rgba(122,92,255,0.55), rgba(255,0,128,0.6))",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.85), rgba(0,0,0,0))",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.85), rgba(0,0,0,0))",
          animation: "auroraDrift 2.4s ease-in-out 0s 1 alternate",
        }}
      />

      {/* Layer 3: a gentle vertical fade so the pool feels “ink-like” and transparent */}
      <div
        className="absolute inset-x-0 top-0 h-full pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.25), rgba(255,255,255,0.08), rgba(255,255,255,0))",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.85), rgba(0,0,0,0))",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.85), rgba(0,0,0,0))",
        }}
      />
    </div>
  );
}
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
        className="absolute top-0 h-full w-[35%]"
        style={{
          animation: `sweep ${SWEEP_ONCE_MS}ms linear 0s 2 both, hueShift ${
            SWEEP_ONCE_MS * 2
          }ms linear infinite`,
          background:
            "linear-gradient(90deg,#ff0080,#ff8c00,#ffee00,#00ff85,#00cfff,#7a5cff,#ff0080)",
          backgroundSize: "200% 100%",
          filter: "saturate(2) contrast(1.35) brightness(1.3)",
          boxShadow:
            "0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,0,128,0.6), 0 0 60px rgba(0,207,255,0.5)",
          borderRadius: 2,
        }}
      />
      {/* subtle base line to lift brightness */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg,rgba(255,255,255,0.2),rgba(255,255,255,0.35),rgba(255,255,255,0.2))",
        }}
      />
    </div>
  );
}

/** Bottom “ink / aurora borealis” pool */
function AuroraPool() {
  return (
    <div className="absolute left-0 right-0 top-[6px] h-[48px] overflow-visible">
      {/* Layer 1: bright bloom */}
      <div
        className="absolute inset-x-0 top-0 h-full blur-[28px] opacity-80 will-change-transform"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 0%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.0) 70%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0.05))",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0.05))",
        }}
      />

      {/* Layer 2: aurora color ribbons with shimmer */}
      <div
        className="absolute inset-x-0 top-0 h-full opacity-80 blur-[22px] mix-blend-screen"
        style={{
          background:
            "conic-gradient(from 210deg at 50% -10%, rgba(255,0,128,0.7), rgba(255,140,0,0.65), rgba(255,238,0,0.55), rgba(0,255,133,0.6), rgba(0,207,255,0.65), rgba(122,92,255,0.65), rgba(255,0,128,0.7))",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.95), rgba(0,0,0,0))",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.95), rgba(0,0,0,0))",
          animation: "auroraDrift 4s ease-in-out infinite alternate",
        }}
      />

      {/* Layer 3: extra shimmer fade */}
      <div
        className="absolute inset-x-0 top-0 h-full pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.3), rgba(255,255,255,0.1), rgba(255,255,255,0))",
        }}
      />
    </div>
  );
}
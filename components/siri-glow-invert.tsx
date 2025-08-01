"use client";

import { useEffect, useState } from "react";

export const SiriGlowInvert = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full h-[40px] z-[100] pointer-events-none overflow-hidden">
      <div
        className="w-full h-full bg-siri-gradient blur-2xl opacity-100 animate-siriMove"
        style={{
          maskImage: "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))",
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))",
        }}
      />
      <style jsx global>{`
        .bg-siri-gradient {
          background: linear-gradient(
            90deg,
            red,
            orange,
            yellow,
            green,
            blue,
            indigo,
            violet,
            red
          );
          background-size: 300% 100%;
        }

        @keyframes siriMove {
          0% {
            background-position: 50% 0%;
          }
          50% {
            background-position: 100% 0%;
          }
          100% {
            background-position: 0% 0%;
          }
        }

        .animate-siriMove {
          animation: siriMove 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
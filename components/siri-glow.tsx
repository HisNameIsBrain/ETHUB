// siri-glow.tsx
"use client";

import { motion } from "framer-motion";

export function SiriGlow({ height = "100%" }: { height ? : string }) {
  return (
    <motion.div
      className="w-full"
      style={{
        height,
        background: "linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #00ffff, #0000ff, #8b00ff)",
        backgroundSize: "400% 100%",
      }}
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%"],
      }}
      transition={{
        repeat: Infinity,
        duration: 2,
        ease: "linear",
      }}
    />
  );
}
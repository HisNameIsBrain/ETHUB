// components/siri-glow.tsx
"use client";
import { motion } from "framer-motion";

export function SiriGlow({ height = "100%" }: { height ? : string }) {
  return (
    <motion.div
      className="w-full"
      style={{
        height,
        background:
          "linear-gradient(90deg, red, orange, yellow, green, cyan, blue, violet)",
        backgroundSize: "400% 100%",
      }}
      animate={{ backgroundPosition: ["0% 50%", "100% 50%"] }}
      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
    />
  );
}
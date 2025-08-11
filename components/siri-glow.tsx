// components/siri-glow.tsx
"use client";
import { motion } from "framer-motion";

type SiriGlowProps = {
  height?: string;              // e.g. "4px"
  position?: "top" | "bottom";
  className?: string;
};

export function SiriGlow({
  height = "8px",
  position = "top",
  className = "",
}: SiriGlowProps) {
  return (
    <motion.div
      className={`fixed ${position}-0 left-0 w-full z-50 ${className}`}
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

export default SiriGlow;
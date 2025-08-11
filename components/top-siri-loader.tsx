// components/top-siri-loader.tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SiriGlow } from "@/components/siri-glow"; // named import ✅

export default function TopSiriLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="progressbar"
          aria-busy="true"
          className="fixed top-0 left-0 right-0 z-[9999] h-[4px] overflow-hidden pointer-events-none"
        >
          <SiriGlow height="4px" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function IntroSplash() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const finish = () => setShow(false);
    const timer = setTimeout(finish, 1200);

    window.addEventListener("load", finish, { once: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("load", finish);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="intro-overlay"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          aria-label="Loading ETHUB"
        >
          <motion.div
            className="intro-logo text-center text-2xl font-semibold tracking-[0.4em] text-foreground"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            ETHUB
            <motion.span
              className="mt-2 block text-xs font-normal tracking-[0.2em] text-foreground/80"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              Loading your workspace
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

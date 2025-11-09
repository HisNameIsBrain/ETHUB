// components/assistant/WaitingDots.tsx
import React, { useEffect, useState } from "react";

export const WaitingDots: React.FC = () => {
  const [dots, setDots] = useState(".");
  useEffect(() => {
    const id = setInterval(() => {
      setDots(prev => (prev === "..." ? "." : prev + "."));
    }, 800);
    return () => clearInterval(id);
  }, []);
  return <span aria-live="polite" className="font-mono">{dots.padEnd(3, " ")}</span>;
};

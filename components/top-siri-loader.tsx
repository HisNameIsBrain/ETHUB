"use client";
import * as React from "react";
type Props = { show?: boolean };
const TopSiriLoader: React.FC<Props> = ({ show = true }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <div className="h-1 overflow-hidden bg-transparent">
        <div className="h-full w-[200%] bg-gradient-to-r from-fuchsia-500 via-blue-500 to-emerald-400 animate-[siri_1.6s_ease_infinite]" />
      </div>
      <style jsx global>{`
        @keyframes siri {
          0% { transform: translateX(-50%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(50%); }
        }
      `}</style>
    </div>
  );
};
export default TopSiriLoader;

mkdir -p components && cat > components/spinner.tsx <<'TSX'
import * as React from "react";
type SpinnerProps = { size?: "sm" | "md" | "lg" | number; className?: string; };
export const Spinner: React.FC<SpinnerProps> = ({ size = "md", className }) => {
  const px = typeof size === "number" ? size : size === "sm" ? 16 : size === "md" ? 24 : 32;
  const stroke = Math.max(2, Math.round(px / 12));
  return (
    <svg width={px} height={px} viewBox="0 0 24 24" className={`animate-spin ${className ?? ""}`} role="status" aria-label="Loading">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth={stroke} fill="none" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" fill="none" />
    </svg>
  );
};
export default Spinner;
TSX

cat > components/top-siri-loader.tsx <<'TSX'
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
TSX

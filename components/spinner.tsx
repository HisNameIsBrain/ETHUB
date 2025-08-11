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

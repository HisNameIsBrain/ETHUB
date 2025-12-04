// app/(marketing)/_components/marketing-shell.tsx
"use client";
import ConnectedSiriVisualizer from "@/components/connected-siri-visualizer";

export default function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <ConnectedSiriVisualizer className="absolute inset-0 z-0 opacity-60 pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

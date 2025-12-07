import type { ReactNode } from "react";

export default function McLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen">{children}</div>;
}

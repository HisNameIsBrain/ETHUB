"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

// Your provided components
const Wrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <section
    className={cn(
      "w-full min-h-[calc(100vh-140px)] flex flex-col overflow-visible",
      className
    )}
  >
    {children}
  </section>
);

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex-1 rounded-xl border bg-background overflow-visible p-0">
    {children}
  </div>
);

// Example usage
export default function DemoPage() {
  return (
    <Wrapper className="bg-gray-50 dark:bg-neutral-900 p-4">
      <Shell>
        <div className="p-6 space-y-4">
          <h1 className="text-2xl font-bold">Shell inside Wrapper</h1>
          <p className="text-muted-foreground">
            This container expands to fit content without forcing scrollbars.
          </p>
          <div className="rounded-lg border bg-card p-4 shadow">
            <p className="text-sm">Example card content inside the shell.</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow">
            <p className="text-sm">Another card to show spacing.</p>
          </div>
        </div>
      </Shell>
    </Wrapper>
  );
}

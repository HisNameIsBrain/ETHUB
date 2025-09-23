import * as React from "react";
import AssistantLauncher from "@/components/assistant-launcher";
export default function ServicesSectionLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-[#1F1F1F]">
      {/* Sticky header: give it a real background + border and a consistent height */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="h-14 flex items-center gap-3 px-4">
        </div>
      </header>

      {/* Offset main content so nothing sits under the header */}
      <main className="flex-1 px-4 py-6 pt-10">
        {children}
      </main>
	<AssistantLauncher/>
      <footer className="border-t px-4 py-6 text-xs opacity-70">
        © {new Date().getFullYear()} ETHUB • All rights reserved
      </footer>
    </div>
  );
}

"use client";

import AssistantLauncher from "@/components/assistant-launcher";
import { Heroes } from "@/app/(marketing)/_components/heroes";

export default function MarketingPage() {
  return (
    <main className="min-h-screen w-full bg-[#020617] text-slate-50">
      {/* Centered content container */}
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-y-10 px-6 pb-20 pt-24">
        {/* Hero / main content */}
        <Heroes />

        {/* Assistant launcher anchored under content, right-aligned */}
        <div className="self-end">
          <AssistantLauncher />
        </div>
      </div>
    </main>
  );
}

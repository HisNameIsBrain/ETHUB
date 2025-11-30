"use client";

import AssistantLauncher from "@/components/assistant-launcher";
import { Heroes } from "@/app/(marketing)/_components/heroes";
export default function MarketingPage() {
  return (
    <div className="min-h-full flex flex-col dark:bg-[#1F1F1F]">
      <div className="flex flex-col items-center justify-center md:justify-start text-center gap-y-8 flex-1 px-6 pb-14">
        <Heroes />

        <div className="pt-4">
          <AssistantLauncher />
        </div>
      </div>
    </div>
  );
}

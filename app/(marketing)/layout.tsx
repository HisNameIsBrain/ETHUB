import React from "react";
import { AssistantLauncher } from "@/components/assistant-launcher";
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AssistantLauncher />
    <div className="h-full dark:bg-[#1F1F1F]">
      <main className="h-full pt-40">{children}</main>
    </div>
  );
}

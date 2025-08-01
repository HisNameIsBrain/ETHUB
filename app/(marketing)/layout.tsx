"use client";

import { SiriGlow } from "@/components/siri-glow";
import Navbar from "@/app/(marketing)/_components/navbar";
import React from "react";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full dark:bg-[#1F1F1F]">
      <SiriGlow />
      <Navbar />
      <main className="h-full pt-40">{children}</main>
    </div>
  );
}
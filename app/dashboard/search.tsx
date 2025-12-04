"use client";

import { Input } from "@/components/ui/input";

export default function Search({
  placeholder = "Search…",
}: {
  placeholder?: string;
}) {
  return (
    <div className="w-full max-w-sm">
      <Input placeholder={placeholder} aria-label="Search" />
    </div>
  );
}

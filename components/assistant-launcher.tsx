"use client";

import * as React from "react";
import { useState } from "react";
import { Plus } from "lucide-react";
import { SiriBubbleButton } from "@/components/siri-bubble-button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// available models for dropdown
const OPENAI_MODEL_OPTIONS = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini (fast, cheap)" },
  { value: "gpt-4o", label: "GPT-4o (balanced)" },
  { value: "gpt-4.1", label: "GPT-4.1 (latest)" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (legacy)" },
];

export default function AssistantLauncher() {
  const [open, setOpen] = useState(false);
  const [model, setModel] = useState("gpt-4o-mini");

  const handleOpenAssistant = () => {
    setOpen(true);
    console.log("Assistant opened with model:", model);
    // TODO: pass `model` into your Convex mutation or OpenAI request
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {/* Model selector */}
      <Select value={model} onValueChange={setModel}>
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Choose a model" />
        </SelectTrigger>
        <SelectContent align="end">
          {OPENAI_MODEL_OPTIONS.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Launcher button */}
      <SiriBubbleButton
        aria-label="Open assistant"
        onClick={handleOpenAssistant}
        className="group relative grid h-14 w-14 place-items-center rounded-full border bg-background/70 shadow-md"
      >
        <Plus className="h-6 w-6" />
      </SiriBubbleButton>
    </div>
  );
}

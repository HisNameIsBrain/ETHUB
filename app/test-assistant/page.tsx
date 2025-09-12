"use client";
import * as React from "react";
import { useAssistant } from "@/lib/useAssistant";

const MODELS = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini (default)" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4.1", label: "GPT-4.1" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
];

export default function TestAssistantPage() {
  const { history, busy, sendDebounced } = useAssistant();
  const [input, setInput] = React.useState("");
  const [model, setModel] = React.useState(MODELS[0].value);

  async function onSend() {
    const p = input.trim();
    if (!p) return;
    await sendDebounced(p, model);
    setInput("");
  }

  return (
    <div className="p-4 space-y-3 max-w-3xl mx-auto">
      <div className="flex gap-2">
        <select className="border rounded px-2 py-1" value={model} onChange={(e)=>setModel(e.target.value)}>
          {MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <input
          className="flex-1 border rounded px-3 py-2"
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          placeholder="Type a message"
          onKeyDown={(e)=>{ if(e.key==="Enter") onSend(); }}
        />
        <button className="px-3 py-2 rounded bg-black text-white disabled:opacity-50" onClick={onSend} disabled={busy}>
          {busy ? "…" : "Send"}
        </button>
      </div>

      <div className="border rounded p-3 space-y-2 max-h-[60vh] overflow-auto">
        {history.map((m,i)=>(
          <div key={i}><strong>{m.role==="user"?"User":"Assistant"}:</strong> {m.content || "(no reply)"}</div>
        ))}
      </div>
    </div>
  );
}

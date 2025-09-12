"use client";
import * as React from "react";
import { useAssistant } from "@/lib/useAssistant";
import { OPENAI_MODEL_OPTIONS } from "@/lib/openaiModels";

export default function Page() {
  const { history, busy, sendDebounced } = useAssistant();
  const [input, setInput] = React.useState("");
  const [model, setModel] = React.useState(OPENAI_MODEL_OPTIONS[0].value);

  async function onSend() {
    const p = input.trim();
    if (!p) return;
    await sendDebounced(p, model);
    setInput("");
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex gap-2">
        <select value={model} onChange={(e)=>setModel(e.target.value)} className="border rounded px-2 py-1">
          {OPENAI_MODEL_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <input className="flex-1 border rounded px-3 py-2" value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Say hi" />
        <button onClick={onSend} disabled={busy} className="px-3 py-2 rounded bg-black text-white disabled:opacity-50">
          {busy ? "…" : "Send"}
        </button>
      </div>
      <div className="border rounded p-3 space-y-2 max-h-80 overflow-auto">
        {history.map((m,i)=>(
          <div key={i}><strong>{m.role==="user"?"User":"Assistant"}:</strong> {m.content || "(no reply)"}</div>
        ))}
      </div>
    </div>
  );
}

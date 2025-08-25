"use client";

import * as React from "react";
import { useRef, useEffect, useState } from "react";
import { useChat } from "ai/react";
import { MessageSquareText, X, Mic, MicOff, Send, Loader2 } from "lucide-react";

// Small speech-recognition helper (Web Speech API)
function useSpeechInput(onTranscript: (text: string, isFinal: boolean) => void) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      const rec: SpeechRecognition = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      rec.onresult = (e: SpeechRecognitionEvent) => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          const text = res[0]?.transcript ?? "";
          onTranscript(text, res.isFinal);
        }
      };
      rec.onend = () => setListening(false);
      recognitionRef.current = rec;
      setSupported(true);
    }
  }, [onTranscript]);

  const start = React.useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch {
      // already started
    }
  }, []);
  const stop = React.useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return { listening, supported, start, stop };
}

type Props = {
  /** Optional: change API endpoint used by useChat */
  api?: string;
  /** Optional: default open on first load */
  defaultOpen?: boolean;
};

export default function FloatingBuildAssistant({ api = "/api/ai/chat", defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [draftFromMic, setDraftFromMic] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, stop, setInput } = useChat({
    api,
    onFinish: () => setDraftFromMic(""),
  });

  const { listening, supported, start, stop: stopMic } = useSpeechInput((text, isFinal) => {
    // Merge mic transcript into the input field
    setDraftFromMic(text);
    if (isFinal) {
      const merged = `${input}${input && text ? " " : ""}${text}`.trim();
      setInput(merged);
      setDraftFromMic("");
    }
  });

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Minimal focus trap when opening
  useEffect(() => {
    if (!open) return;
    const el = containerRef.current?.querySelector<HTMLTextAreaElement>("textarea");
    el?.focus();
  }, [open]);

  return (
    <>
      {/* Floating trigger button (top-right) */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed top-4 right-4 z-[60] inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 shadow-md hover:shadow-lg transition"
        aria-label="Open build assistant"
      >
        <MessageSquareText className="h-5 w-5" />
        <span className="hidden sm:inline">Assistant</span>
      </button>

      {/* Overlay + Card */}
      {open && (
        <div className="fixed inset-0 z-[59]">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            ref={containerRef}
            className="absolute top-4 right-4 w-[min(720px,calc(100vw-2rem))] h-[min(70vh,calc(100vh-2rem))] rounded-2xl border bg-background shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="font-semibold">Build Assistant</div>
              <div className="flex items-center gap-2">
                {/* Mic */}
                <button
                  onClick={() => (listening ? stopMic() : start())}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm ${listening ? "bg-red-50" : ""}`}
                  title={supported ? (listening ? "Stop voice" : "Start voice") : "Voice not supported"}
                  disabled={!supported}
                >
                  {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  <span className="hidden sm:inline">{listening ? "Stop" : "Voice"}</span>
                </button>

                {/* Stop generation */}
                <button
                  onClick={() => stop()}
                  className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm"
                  disabled={!isLoading}
                  title="Stop response"
                >
                  <Loader2 className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">Stop</span>
                </button>

                {/* Close */}
                <button
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                  <span className="hidden sm:inline">Close</span>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  Ask me to <b>create services</b>, <b>scaffold pages</b>, <b>write Convex code</b>, or <b>explain errors</b>.
                  <br />
                  Tip: <kbd className="px-1 border rounded">⌘/Ctrl</kbd> + <kbd className="px-1 border rounded">K</kbd> toggles me anywhere.
                </div>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`max-w-[85%] ${m.role === "user" ? "ml-auto text-right" : ""}`}>
                  <div className={`rounded-xl border px-3 py-2 whitespace-pre-wrap ${m.role === "user" ? "bg-accent/30" : ""}`}>
                    <div className="text-xs font-medium opacity-60 mb-1">
                      {m.role === "user" ? "You" : "Assistant"}
                    </div>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Composer */}
            <form
              onSubmit={handleSubmit}
              className="border-t p-3 flex items-end gap-2"
            >
              <textarea
                value={draftFromMic ? `${input}${input ? " " : ""}${draftFromMic}` : input}
                onChange={handleInputChange}
                rows={2}
                placeholder="Ask to add a public service 'Screen Repair' for $89…"
                className="flex-1 resize-none rounded-xl border px-3 py-2 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isLoading || (!input && !draftFromMic)}
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

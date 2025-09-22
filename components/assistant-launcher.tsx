"use client";

import * as React from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from "@/components/ui/select";
import { X, Send, Bot, Loader2 } from "lucide-react";
import { SiriGlowInvert } from "@/components/siri-glow-invert";

type Role = "system" | "user" | "assistant";

const OPENAI_MODEL_OPTIONS = [
  { id: "gpt-4o-mini", label: "GPT-4o mini" },
  { id: "gpt-4o", label: "GPT-4o" },
  { id: "gpt-4.1-mini", label: "GPT-4.1 mini" },
  { id: "gpt-4.1", label: "GPT-4.1" },
  { id: "o3-mini", label: "o3 mini" },
] as const;

/* ----- keyboard detection: center vs bottom anchoring on mobile ----- */
function useKeyboardOpen(thresholdPx = 150) {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const vv = (window as any).visualViewport as VisualViewport | undefined;
    const update = () => {
      const winH = window.innerHeight;
      const currH = vv ? vv.height : winH;
      setOpen(winH - currH > thresholdPx);
    };
    update();
    window.addEventListener("resize", update);
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    return () => {
      window.removeEventListener("resize", update);
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
    };
  }, [thresholdPx]);
  return open;
}

/* ----- big Siri rainbow behind the panel (visible but tasteful) ----- */
function GlowBackdrop({ spinning = true }: { spinning?: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute left-1/2 top-1/2 h-[1200px] w-[1200px] -translate-x-1/2 -translate-y-1/2">
        <SiriGlowInvert
          rotateSec={spinning ? 18 : 0}
          innerRotateSec={spinning ? 24 : 0}
          blurPx={30}
          insetPercent={-12}
          opacity={0.35}
          thicknessPx={26}
          inner
          colors={[
            "rgba(255,242,0,0.95)",
            "rgba(255,138,0,0.95)",
            "rgba(255,0,122,0.95)",
            "rgba(122,0,255,0.95)",
            "rgba(0,72,255,0.95)",
            "rgba(0,162,255,0.95)",
            "rgba(0,255,162,0.95)",
            "rgba(160,255,0,0.95)",
          ]}
          style={{ willChange: "transform", transform: "translateZ(0)" }}
          className="absolute inset-0"
        />
      </div>
      {/* light gloss so text stays readable while color shows through */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[1.5px] mix-blend-overlay" />
    </div>
  );
}

export default function AssistantLauncher() {
  /* ---- declare all hooks before any returns (no hooks-order bugs) ---- */
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const [model, setModel] = React.useState<string>(OPENAI_MODEL_OPTIONS[0].id);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [messages, setMessages] = React.useState<Array<{ role: Role; content: string }>>([]);

  const chatAction = useAction(api.openai.chat);
  const askAction = useAction(api.openai.ask);
  const moderateAction = useAction(api.openai.moderate);

  // prevent duplicate mounts
  React.useEffect(() => {
    const k = "__ETHUB_ASSISTANT_LAUNCHER__";
    // @ts-ignore
    if (window[k]) return;
    // @ts-ignore
    window[k] = true;
    setMounted(true);
    return () => {
      // @ts-ignore
      delete window[k];
    };
  }, []);

  const keyboardOpen = useKeyboardOpen(150);

  // click-away handler that doesn't close when interacting with Radix portals
  const panelRef = React.useRef<HTMLDivElement>(null);
  const onBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const path = (e.nativeEvent as any).composedPath?.() as EventTarget[] | undefined;
    if (!path) return setOpen(false);
    // If the click was inside the panel, ignore
    if (panelRef.current && path.includes(panelRef.current)) return;
    // If clicking a Radix portal/popper, ignore (keeps Select open)
    const clickedRadix = path.some(
      (el) =>
        el instanceof HTMLElement &&
        (el.dataset?.radixPopperContentWrapper !== undefined ||
          el.getAttribute?.("data-radix-portal") !== null ||
          el.id?.includes?.("radix-"))
    );
    if (clickedRadix) return;
    setOpen(false);
  };

  async function send(useAsk = false) {
    const text = input.trim();
    if (!text || busy) return;
    setBusy(true);
    try {
      const mod = await moderateAction({ input: text });
      if ((mod as any)?.flagged) {
        setMessages((m) => [...m, { role: "assistant", content: "Blocked by moderation." }]);
        return;
      }
      let res: { content?: string } | null = null;
      if (useAsk) {
        res = (await askAction({ prompt: text, model })) as any;
      } else {
        const next = [...messages, { role: "user", content: text }];
        setMessages(next);
        res = (await chatAction({ model, messages: next })) as any;
      }
      if (res?.content) setMessages((m) => [...m, { role: "assistant", content: res!.content! }]);
    } catch (e) {
      console.error(e);
      setMessages((m) => [...m, { role: "assistant", content: "Error talking to assistant." }]);
    } finally {
      setInput("");
      setBusy(false);
    }
  }

  if (!mounted) return null;

  // centered when keyboard closed; pinned near bottom when keyboard open
  const panelPos = keyboardOpen
    ? "fixed left-1/2 bottom-[max(1rem,env(safe-area-inset-bottom))] -translate-x-1/2"
    : "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2";

  return (
    <>
      {/* Launcher button */}
      {!open && (
        <button
          aria-label="Open Assistant"
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[95] h-16 w-16 rounded-full border border-white/10 bg-neutral-950 text-white shadow-[0_10px_40px_rgba(0,0,0,0.45)] overflow-hidden isolate grid place-items-center"
        >
          <SiriGlowInvert
            rotateSec={3.2}
            innerRotateSec={4.4}
            blurPx={14}
            insetPercent={-6}
            opacity={0.85}
            thicknessPx={11}
            inner
          />
          <Bot className="relative h-7 w-7" />
        </button>
      )}

      {/* Overlay + panel */}
      {open && (
        <div className="fixed inset-0 z-[96] bg-black/40 backdrop-blur-sm" onMouseDown={onBackdropMouseDown}>
          <div
            ref={panelRef}
            className={`${panelPos} z-[97] w-[min(720px,calc(100vw-2rem))] rounded-2xl
                        border border-white/25 shadow-2xl overflow-hidden relative
                        bg-white/60 backdrop-blur-md`}  // glass base so rainbow reads & text is legible
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* visible rotating Siri glow behind the content */}
            <GlowBackdrop spinning={!busy} />

            {/* Header */}
            <div className="relative z-[1] flex items-center justify-between p-3 border-b border-white/20">
              <div className="flex items-center gap-3">
                <div className="relative h-6 w-6 overflow-hidden rounded-full">
                  <SiriGlowInvert
                    rotateSec={3.6}
                    innerRotateSec={4.6}
                    blurPx={10}
                    insetPercent={-4}
                    opacity={0.8}
                    thicknessPx={8}
                    inner
                  />
                  <span className="absolute inset-[2px] rounded-full border border-white/30 bg-black/50" />
                </div>
                <span className="font-medium">ETHUB Assistant</span>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setOpen(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Controls */}
            <div className="relative z-[1] p-3 border-b border-white/15 bg-white/45 backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-1">
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger aria-label="Model">
                      <SelectValue placeholder="Model" />
                    </SelectTrigger>
                    {/* z-index so dropdown floats above panel & overlay */}
                    <SelectContent align="end" className="z-[999]">
                      {OPENAI_MODEL_OPTIONS.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1">
                  <Input placeholder="System (locked in code)" disabled value="" onChange={() => {}} />
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="relative z-[1] max-h-[45vh] overflow-y-auto p-3 space-y-3">
              {messages.length === 0 && (
                <div className="text-sm text-black/70">
                  New chat. Select a model and ask your question.
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === "user"
                      ? "ml-auto max-w-[85%] rounded-2xl bg-white/90 text-black px-3 py-2"
                      : "mr-auto max-w-[85%] rounded-2xl bg-black/55 text-white px-3 py-2 backdrop-blur"
                  }
                >
                  {m.content}
                </div>
              ))}
              {busy && (
                <div className="mr-auto inline-flex items-center gap-2 rounded-2xl bg-black/40 text-white px-3 py-2 text-sm backdrop-blur">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking…
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="relative z-[1] p-3 border-t border-white/15 bg-white/45 backdrop-blur-sm">
              <div className="flex items-end gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message…"
                  rows={keyboardOpen ? 4 : 3}
                  className="bg-white/70 text-black placeholder:text-black/60 border-white/30"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send(false);
                    }
                  }}
                />
                <div className="flex flex-col gap-2">
                  <Button onClick={() => void send(false)} disabled={busy || !input.trim()}>
                    <Send className="h-4 w-4 mr-2" /> Chat
                  </Button>
                  <Button variant="outline" onClick={() => void send(true)} disabled={busy || !input.trim()}>
                    <Send className="h-4 w-4 mr-2" /> Ask
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

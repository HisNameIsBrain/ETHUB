// components/assistant-launcher.tsx
"use client";

import React from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, MicOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speakWithOpenAI } from "@/lib/tts";
import { useUser } from "@clerk/nextjs";

type Role = "system" | "user" | "assistant";

const SYSTEM_PROMPT = {
  role: "system" as const,
  content:
    "You are ETHUB Assistant, a friendly, patient receptionist. Guide users step-by-step to collect device model, issue and desired service; confirm details before fetching parts & pricing; show premium first then economical alternative. Persona: concise, clear, supportive, encouraging.",
};

type IntakeState = "idle" | "askDeviceModel" | "askIssue" | "confirm" | "done";

export default function AssistantLauncher({
  onAssistantMessage,
}: {
  onAssistantMessage?: (s: string) => void;
}) {
  const { user, isLoaded } = useUser();
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Array<{ role: Role; content: string; thinking?: boolean }>>([]);
  const [busy, setBusy] = React.useState(false);
  const [muted, setMuted] = React.useState(false);
  const [intakeState, setIntakeState] = React.useState<IntakeState>("idle");
  const [intake, setIntake] = React.useState<any>({});
  const [ttsQueue, setTtsQueue] = React.useState<string[]>([]);
  const [ttsPlaying, setTtsPlaying] = React.useState(false);

  // mount guard (dev HMR protection)
  React.useEffect(() => {
    const key = "__ETHUB_ASSISTANT_LAUNCHER__";
    if ((window as any)[key]) return;
    (window as any)[key] = true;
    setMounted(true);
    return () => {
      delete (window as any)[key];
    };
  }, []);

  // Prefill user info from Clerk
  React.useEffect(() => {
    if (!isLoaded) return;
    if (user) {
      setIntake((s: any) => ({
        ...s,
        name:
          s.name ??
          (user.firstName ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}` : user.fullName ?? undefined),
        email: s.email ?? (user.primaryEmailAddress?.emailAddress ?? user.emailAddresses?.[0]?.emailAddress),
        phone: s.phone ?? user.phoneNumbers?.[0]?.phoneNumber ?? undefined,
      }));
    }
  }, [user, isLoaded]);

  // TTS runner: process queue sequentially
  React.useEffect(() => {
    if (!ttsPlaying && ttsQueue.length > 0 && !muted) {
      const next = ttsQueue[0];
      setTtsPlaying(true);
      speakWithOpenAI(next, { voice: "alloy", format: "mp3" })
        .catch(() => {})
        .finally(() => {
          setTtsQueue((q) => q.slice(1));
          setTtsPlaying(false);
        });
    }
  }, [ttsQueue, ttsPlaying, muted]);

  function enqueueTTS(message: string) {
    setTtsQueue((q) => [...q, message]);
  }

  function pushMessage(m: { role: Role; content: string; thinking?: boolean }) {
    setMessages((prev) => [...prev, m]);
    if (m.role === "assistant") enqueueTTS(m.content);
    if (m.role === "assistant" && onAssistantMessage) {
      try {
        JSON.parse(m.content);
      } catch {
        onAssistantMessage?.(m.content);
      }
    }
  }

  function clearConversation(keepPrefill = true) {
    setMessages([]);
    setIntake(keepPrefill ? { name: intake.name, email: intake.email, phone: intake.phone } : {});
    setIntakeState("idle");
  }

  // Helper: friendly hints for users who don't know
  function hintForField(field: "device" | "issue") {
    switch (field) {
      case "device":
        return "Hint: exact model is usually on the back or in Settings → About. For iPhone: Settings → General → About → Model Name. If unsure, tell me brand and any letters/numbers you see.";
      case "issue":
        return 'Hint: be specific — e.g., "Screen cracked (touch works)", "Battery drains fast", or "Phone won’t boot".';
    }
  }

  function looksLikeFullModel(text: string) {
    return (
      /\b(iphone|galaxy|pixel|ipad|macbook|oneplus|motorola|xiaomi|nokia)\b/i.test(text) ||
      /\b[A-Z]{1,3}\d{2,4}\b/.test(text) ||
      /\bSM-?\d{3,5}\b/i.test(text)
    );
  }

  // Combined fetch: prices (mobilesentrix) + images (image-search proxy)
  async function fetchPartsAndImages(query: string) {
    if (!query || query.trim().length < 3) return null;

    try {
      // 1) fetch prices from your server route
      const pricesRes = await fetch(`/api/mobilesentrix/prices?query=${encodeURIComponent(query)}`, { cache: "no-store" });
      if (!pricesRes.ok) {
        const txt = await pricesRes.text().catch(() => "");
        console.error("mobilesentrix error:", pricesRes.status, txt);
        return null;
      }
      const pricesJson = await pricesRes.json();

      // 2) fetch images from server proxy (Google CSE)
      const imagesRes = await fetch(`/api/image-search?query=${encodeURIComponent(query)}&num=6`, { cache: "no-store" });
      let images: any[] = [];
      if (imagesRes.ok) {
        const imgsJson = await imagesRes.json();
        images = imgsJson.images ?? [];
      } else {
        console.warn("image-search failed", imagesRes.status);
      }

      // 3) attach best image to each part
      function pickImageForTitle(title?: string) {
        if (!title) return images[0]?.thumbnail ?? images[0]?.link ?? null;
        const t = title.toLowerCase();
        // prefer image with title or context matching part title/model
        for (const img of images) {
          if ((img.title ?? "").toLowerCase().includes(t)) return img.link;
          if ((img.contextLink ?? "").toLowerCase().includes(t)) return img.link;
        }
        return images[0]?.thumbnail ?? images[0]?.link ?? null;
      }

      const recommended = pricesJson.recommended ? { ...pricesJson.recommended, image: pricesJson.recommended.image ?? pickImageForTitle(pricesJson.recommended.title ?? query) } : null;
      const alternative = pricesJson.alternative ? { ...pricesJson.alternative, image: pricesJson.alternative.image ?? pickImageForTitle(pricesJson.alternative.title ?? query) } : null;

      return { recommended, alternative };
    } catch (err) {
      console.error("fetchPartsAndImages error:", err);
      return null;
    }
  }

  // Main input handler (FSM)
  async function handleUserInput(raw: string) {
    const text = raw.trim();
    if (!text) return;

    pushMessage({ role: "user", content: text });

    switch (intakeState) {
      case "idle":
        if (/^(start|hi|hello|yes|ready)/i.test(text)) {
          if (!user) {
            pushMessage({ role: "assistant", content: "Please sign in to start a repair request." });
            return;
          }
          pushMessage({ role: "assistant", content: `✨ Hi ${intake.name ?? "there"} — ready when you are. What is the device name and exact model?` });
          setIntakeState("askDeviceModel");
        } else {
          pushMessage({ role: "assistant", content: "Say 'start' to begin the repair intake ✨." });
        }
        break;

      case "askDeviceModel":
        if (!looksLikeFullModel(text)) {
          // help user find the model rather than silently accept an invalid value
          pushMessage({ role: "assistant", content: `I think that might be incomplete. ${hintForField("device")}` });
          return;
        }
        setIntake((s: any) => ({ ...s, deviceAndModel: text }));
        pushMessage({ role: "assistant", content: `Nice — got "${text}". Now describe the issue and the service you'd like (e.g., screen, battery, data recovery).` });
        setIntakeState("askIssue");
        break;

      case "askIssue":
        setIntake((s: any) => ({ ...s, issue: text, service: text }));
        const summary = { ID: `IC-${Date.now().toString().slice(-6)}`, Description: `${intake.deviceAndModel ?? ""} — ${text}`, Service: text };
        setIntake((s: any) => ({ ...s, summary }));
        pushMessage({ role: "assistant", content: `Please confirm:\n• Device: ${intake.deviceAndModel}\n• Issue: ${text}\n\nReply "yes" to fetch parts & pricing, or "edit" to change.` });
        setIntakeState("confirm");
        break;

      case "confirm":
        if (/^y(es)?$/i.test(text)) {
          pushMessage({ role: "assistant", content: "Looking up parts and live pricing... 💫", thinking: true });
          const q = `${intake.deviceAndModel ?? ""} ${intake.service ?? ""}`.trim();
          const parts = await fetchPartsAndImages(q);
          setMessages((prev) => prev.map((m) => (m.thinking ? { ...m, thinking: false } : m)));
          if (!parts) {
            pushMessage({ role: "assistant", content: "Hmm — I couldn't fetch live parts right now. You can try again or ask for a manual estimate." });
            setIntakeState("confirm");
            return;
          }
          pushMessage({ role: "assistant", content: JSON.stringify({ type: "parts_suggestion", recommended: parts.recommended, alternative: parts.alternative }) });
          setIntakeState("done");
        } else if (/^edit/i.test(text)) {
          pushMessage({ role: "assistant", content: "Okay — say the updated device + model or issue to continue." });
          setIntakeState("askDeviceModel");
        } else {
          pushMessage({ role: "assistant", content: "Intake paused. Say 'start' to begin again." });
          setIntakeState("idle");
        }
        break;

      case "done":
        if (/^(start|new)/i.test(text)) clearConversation();
        else pushMessage({ role: "assistant", content: "Approve a part to save invoice, or say 'start' for a new intake." });
        break;
    }
  }

  async function onApprovePart(part: any) {
    const summary = intake.summary ?? {};
    const payload = {
      ticketId: summary.ID ?? `IC-${Date.now().toString().slice(-6)}`,
      name: intake.name ?? null,
      phone: intake.phone ?? null,
      email: intake.email ?? null,
      description: summary.Description ?? null,
      quote: (part.partPrice ?? part.minPrice ?? 0) + (part.labor ?? 100),
      service: summary.Service ?? intake.service ?? "Repair",
      warrantyAcknowledged: true,
      raw: { intake, part },
      status: "pending",
    };
    pushMessage({ role: "assistant", content: "Saving invoice..." });
    try {
      const res = await fetch("/api/portal/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("save failed");
      pushMessage({ role: "assistant", content: `✅ Invoice saved. Ticket: ${payload.ticketId}` });
    } catch (err) {
      console.error("save invoice error", err);
      pushMessage({ role: "assistant", content: "❌ Failed to save invoice. Contact support." });
    }
  }

  // Render message; special handling for parts_suggestion JSON
  function renderMessage(m: { role: Role; content: string; thinking?: boolean }, idx: number) {
    if (m.role === "assistant") {
      try {
        const parsed = JSON.parse(m.content);
        if (parsed?.type === "parts_suggestion") {
          const rec = parsed.recommended;
          const alt = parsed.alternative;
          return (
            <div key={idx} className="bg-gray-50 p-3 rounded-xl border shadow-sm space-y-3">
              {rec && (
                <div>
                  <div className="font-semibold">Recommended — Premium</div>
                  <div className="flex items-center gap-3 mt-2">
                    {rec.image ? <img src={rec.image} alt={rec.title} className="h-20 object-contain rounded" /> : <div className="h-20 w-20 bg-gray-100 rounded" />}
                    <div className="flex-1">
                      <div className="text-sm">{rec.title ?? intake.deviceAndModel}</div>
                      <div className="font-semibold text-lg">${((rec.partPrice ?? rec.minPrice ?? 0) + (rec.labor ?? 100)).toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">Part: ${(rec.partPrice ?? rec.minPrice ?? 0).toFixed(2)} + Labor: ${(rec.labor ?? 100).toFixed(2)}</div>
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" onClick={() => void onApprovePart(rec)}>Approve & Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => pushMessage({ role: "assistant", content: "Okay — not ordering premium. Choose alternative or edit intake." })}>No thanks</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {alt && (
                <div className="mt-3">
                  <div className="font-semibold">Alternative — Economical</div>
                  <div className="flex items-center gap-3 mt-2">
                    {alt.image ? <img src={alt.image} alt={alt.title} className="h-16 object-contain rounded" /> : <div className="h-16 w-16 bg-gray-50 rounded" />}
                    <div className="flex-1">
                      <div className="text-sm">{alt.title ?? intake.deviceAndModel}</div>
                      <div className="font-semibold text-lg">${((alt.partPrice ?? alt.maxPrice ?? 0) + (alt.labor ?? 100)).toFixed(2)}</div>
                      <div className="mt-2">
                        <Button size="sm" variant="outline" onClick={() => void onApprovePart(alt)}>Approve Economical</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        }
      } catch {
        // not JSON — fall through to text render
      }
    }

    return (
      <div key={idx} className={`${m.role === "assistant" ? "bg-blue-50 text-gray-900 self-start" : "bg-gray-200 text-gray-800 self-end"} rounded-xl px-3 py-2 shadow-sm max-w-[80%]`}>
        {m.content}
      </div>
    );
  }

  if (!mounted) return null;

  const rainbowStyle: React.CSSProperties = {
    background: "conic-gradient(from 0deg, #ff2d55, #ff9500, #ffcc00, #30d158, #5ac8fa, #5856d6, #ff2d55)",
    filter: "blur(10px)",
    mixBlendMode: "screen",
    pointerEvents: "none",
  };

  return (
    <>
      {ReactDOM.createPortal(
        <div className="fixed right-6 bottom-6 z-50">
          <div className="relative h-24 w-24 flex items-center justify-center">
            <motion.div className="absolute inset-0 rounded-full pointer-events-none" style={rainbowStyle} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 5, ease: "linear" }} />
            <motion.button aria-label="Open Assistant" onClick={() => { setOpen(true); if (messages.length === 0) pushMessage({ role: "assistant", content: "✨ Hey there! I’m ETHUB’s Assistant — say 'start' to begin your repair intake." }); }} className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 text-white shadow-2xl grid place-items-center relative z-10" whileHover={{ scale: 1.06 }} whileTap={{ scale: 1.03 }}>
              <Sparkles className="h-7 w-7 animate-pulse" />
            </motion.button>
          </div>
        </div>, document.body
      )}

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[96] bg-black/30 flex items-end justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            <motion.div className="m-6 w-[min(880px,calc(100vw-4rem))] rounded-2xl border bg-white text-neutral-900 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()} initial={{ y: 60, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, opacity: 0.8 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
              <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">ETHUB Assistant</div>
                  <div className="text-xs text-muted-foreground">Repair intake</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" onClick={() => setMuted(!muted)}>{muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}</Button>
                  <Button size="icon" variant="ghost" onClick={() => { setOpen(false); clearConversation(); }} aria-label="Close assistant"><X className="h-5 w-5" /></Button>
                </div>
              </div>

              <div className="max-h-[70vh] overflow-auto p-4 space-y-3">
                {messages.length === 0 && <div className="text-sm text-muted-foreground">Welcome — say 'start' to begin your repair intake. I'll prefill details when you're signed in.</div>}
                <div className="flex flex-col gap-3">{messages.map((m, i) => <div key={i} className="flex">{renderMessage(m, i)}</div>)}</div>
              </div>

              <form className="p-4 border-t flex gap-2" onSubmit={async (e) => { e.preventDefault(); const input = e.currentTarget.querySelector("input") as HTMLInputElement; const val = input?.value?.trim() ?? ""; if (!val) return; input.value = ""; await handleUserInput(val); }}>
                <input name="assistantInput" placeholder="Type here..." className="flex-1 rounded-md border px-3 py-2" disabled={busy} />
                <Button type="submit" disabled={busy || !isLoaded}>{busy ? "..." : "Send"}</Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

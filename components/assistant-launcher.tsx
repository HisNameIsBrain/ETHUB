"use client";

import React from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, MicOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { speakWithOpenAI } from "@/lib/tts";
import { useUser } from "@clerk/nextjs";

type Role = "system" | "user" | "assistant";

const SYSTEM_PROMPT = {
  role: "system" as const,
  content:
    "You are ETHUB Assistant, a friendly, patient receptionist. Your main goal is to guide users through repair intake step-by-step: ask for device name and exact model, issue, and requested service; confirm details before fetching parts & pricing; present premium first, then economical alternative. Persona: concise, clear, supportive, and encouraging.",
};

const CHAT_MODEL = "gpt-4o-mini" as const;
const TTS_VOICE = "alloy" as const;
const TTS_FORMAT = "mp3" as const;

type IntakeState = "idle" | "askDeviceModel" | "askIssue" | "confirm" | "done";

export default function AssistantLauncher({
  onAssistantMessage,
}: {
  onAssistantMessage?: (s: string) => void;
}) {
  const { user, isLoaded } = useUser();
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<
    Array<{ role: Role; content: string; thinking?: boolean }>
  >([]);
  const [busy, setBusy] = React.useState(false);
  const [muted, setMuted] = React.useState(false);

  const [intakeState, setIntakeState] =
    React.useState<IntakeState>("idle");
  const [intake, setIntake] = React.useState<any>({});

  // Convex bindings
  const createInvoiceMutation = useMutation(api.invoices.createInvoice);
  const chatAction = useAction(api.openai.chat);
  const moderateAction = useAction(api.openai.moderate);
  const fetchPartsForQuery = useAction(api.parts.fetchPartsForQuery); // ✅ fixed

  // --- TTS state ---
  const [ttsQueue, setTtsQueue] = React.useState<string[]>([]);
  const [ttsPlaying, setTtsPlaying] = React.useState(false);

  React.useEffect(() => {
    const key = "__ETHUB_ASSISTANT_LAUNCHER__";
    if ((window as any)[key]) return;
    (window as any)[key] = true;
    setMounted(true);
    return () => {
      delete (window as any)[key];
    };
  }, []);

  // Prefill user info
  React.useEffect(() => {
    if (!isLoaded) return;
    if (user) {
      setIntake((s: any) => ({
        ...s,
        name:
          s.name ??
          (user.firstName
            ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
            : user.fullName ?? undefined),
        email:
          s.email ??
          (user.primaryEmailAddress?.emailAddress ??
            user.emailAddresses?.[0]?.emailAddress),
        phone:
          s.phone ?? user.phoneNumbers?.[0]?.phoneNumber ?? undefined,
      }));
    }
  }, [user, isLoaded]);

  // --- TTS runner ---
  React.useEffect(() => {
    if (!ttsPlaying && ttsQueue.length > 0 && !muted) {
      const next = ttsQueue[0];
      setTtsPlaying(true);
      speakWithOpenAI(next, { voice: TTS_VOICE, format: TTS_FORMAT })
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
    setIntake(
      keepPrefill
        ? { name: intake.name, email: intake.email, phone: intake.phone }
        : {}
    );
    setIntakeState("idle");
  }

  async function saveInvoiceToPortal(payload: any) {
    try {
      if (createInvoiceMutation) {
        await createInvoiceMutation(payload);
        return { ok: true };
      } else {
        const res = await fetch("/api/portal/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Save failed");
        return { ok: true };
      }
    } catch (err) {
      console.error("save invoice error", err);
      return { ok: false, error: err };
    }
  }

  // --- Intake helper text ---
  function hintForField(field: "device" | "issue") {
    switch (field) {
      case "device":
        return `Exact model is often on the back of the device or in Settings → About. For iPhone: Settings → General → About → Model Name.`;
      case "issue":
        return `Describe the issue clearly, e.g. "Screen cracked — touch works" or "Battery dies within 2 hours".`;
    }
  }

  function startIntake() {
    if (!user) {
      pushMessage({ role: "assistant", content: "Please sign in to start a repair request." });
      return;
    }
    pushMessage({
      role: "assistant",
      content: `Hi ${intake.name ?? "there"}! Let's start your repair intake — I'll ask a few quick questions.`,
    });
    pushMessage({
      role: "assistant",
      content: `First: what's the device name and exact model? (e.g. iPhone 15 Pro Max A2849 or Samsung A13 SM-A136U)`,
    });
    setIntakeState("askDeviceModel");
  }

  function looksLikeFullModel(text: string) {
    return /\b(iphone|galaxy|pixel|ipad|macbook|oneplus|motorola|xiaomi|nokia)\b/i.test(text) ||
      /\b[A-Z]{1,3}\d{2,4}\b/.test(text) ||
      /\bSM-?\d{3,5}\b/i.test(text);
  }

  // --- OpenAI chat wrapper ---
  async function callOpenAIAndPush() {
    const payloadMessages = [
      SYSTEM_PROMPT,
      ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ];
    try {
      setBusy(true);
      const res = await chatAction({ model: CHAT_MODEL, messages: payloadMessages });
      const text = typeof res === "string" ? res : res?.content ?? "AI unavailable.";
      pushMessage({ role: "assistant", content: text });
    } catch (err) {
      console.error(err);
      pushMessage({ role: "assistant", content: "AI unavailable — please try again later." });
    } finally {
      setBusy(false);
    }
  }

  // --- User input ---
  async function handleUserInput(raw: string) {
    const text = raw.trim();
    if (!text) return;

    // moderation
    try {
      const mod = await moderateAction({ text });
      if (mod?.flagged) {
        pushMessage({ role: "assistant", content: "Sorry, I can’t assist with that content." });
        return;
      }
    } catch {}

    pushMessage({ role: "user", content: text });

    switch (intakeState) {
      case "idle":
        if (/^(start|hi|hello|yes|ready)/i.test(text)) startIntake();
        else await callOpenAIAndPush();
        break;

      case "askDeviceModel":
        if (!looksLikeFullModel(text)) {
          pushMessage({ role: "assistant", content: `That looks incomplete. ${hintForField("device")}` });
          return;
        }
        setIntake((s: any) => ({ ...s, deviceAndModel: text }));
        pushMessage({ role: "assistant", content: `Got it — "${text}". Now what issue are you facing?` });
        setIntakeState("askIssue");
        break;

      case "askIssue":
        setIntake((s: any) => ({ ...s, issue: text, service: text }));
        const summary = {
          ID: `IC-${Date.now().toString().slice(-6)}`,
          Description: `${intake.deviceAndModel ?? ""} — ${text}`,
          Service: text,
        };
        setIntake((s: any) => ({ ...s, summary }));
        pushMessage({
          role: "assistant",
          content: `Please confirm: \n• Device: ${intake.deviceAndModel}\n• Issue: ${text}\nReply "yes" to fetch parts.`,
        });
        setIntakeState("confirm");
        break;

      case "confirm":
        if (/^y(es)?$/i.test(text)) {
          pushMessage({ role: "assistant", content: "Looking up parts and live pricing...", thinking: true });
          const q = `${intake.deviceAndModel ?? ""} ${intake.service ?? ""}`;
          const parts = await fetchPartsForQuery({ query: q }); // ✅ correct usage
          setMessages((prev) => prev.map((m) => (m.thinking ? { ...m, thinking: false } : m)));
          if (!parts) {
            pushMessage({ role: "assistant", content: "Parts lookup failed. Try again later." });
            setIntakeState("idle");
            return;
          }
          pushMessage({
            role: "assistant",
            content: JSON.stringify({
              type: "parts_suggestion",
              recommended: parts.recommended,
              alternative: parts.alternative,
            }),
          });
          setIntakeState("done");
        }
        break;

      case "done":
        if (/^(start|new)/i.test(text)) clearConversation();
        else pushMessage({ role: "assistant", content: "Approve a part to save invoice or say 'start' for new intake." });
        break;
    }
  }

  async function onApprovePart(part: any) {
    const summary = intake.summary ?? {};
    const payload = {
      ticketId: summary.ID ?? `IC-${Date.now().toString().slice(-6)}`,
      name: intake.name,
      phone: intake.phone,
      email: intake.email,
      description: summary.Description,
      quote: (part.partPrice ?? 0) + (part.labor ?? 100),
      service: summary.Service ?? intake.service ?? "Repair",
      warrantyAcknowledged: true,
      raw: { intake, part },
      status: "pending",
    };
    pushMessage({ role: "assistant", content: "Saving invoice..." });
    const r = await saveInvoiceToPortal(payload);
    if (r.ok) pushMessage({ role: "assistant", content: `✅ Invoice saved. Ticket: ${payload.ticketId}` });
    else pushMessage({ role: "assistant", content: "❌ Failed to save invoice." });
  }

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
                    {rec.image && <img src={rec.image} alt={rec.title} className="h-20 object-contain rounded" />}
                    <div>
                      <div className="text-sm">{rec.title}</div>
                      <div className="font-semibold">
                        ${(rec.partPrice ?? rec.minPrice ?? 0) + (rec.labor ?? 100)}
                      </div>
                      <Button size="sm" onClick={() => void onApprovePart(rec)}>Approve & Save</Button>
                    </div>
                  </div>
                </div>
              )}
              {alt && (
                <div className="mt-3">
                  <div className="font-semibold">Alternative — Economical</div>
                  <div className="flex items-center gap-3 mt-2">
                    {alt.image && <img src={alt.image} alt={alt.title} className="h-16 object-contain rounded" />}
                    <div>
                      <div className="text-sm">{alt.title}</div>
                      <div className="font-semibold">
                        ${(alt.partPrice ?? alt.maxPrice ?? 0) + (alt.labor ?? 100)}
                      </div>
                      <Button size="sm" variant="outline" onClick={() => void onApprovePart(alt)}>Approve Economical</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        }
      } catch {}
    }

    return (
      <div
        key={idx}
        className={`${
          m.role === "assistant"
            ? "bg-blue-50 text-gray-900 self-start"
            : "bg-gray-200 text-gray-800 self-end"
        } rounded-xl px-3 py-2 shadow-sm max-w-[80%]`}
      >
        {m.content}
      </div>
    );
  }

  if (!mounted) return null;

  const orbit = { animate: { rotate: 360 }, transition: { repeat: Infinity, duration: 6, ease: "linear" } };
  const rainbowStyle: React.CSSProperties = {
    background: "conic-gradient(from 0deg, #ff2d55, #ff9500, #ffcc00, #30d158, #5ac8fa, #5856d6, #ff2d55)",
    filter: "blur(10px)",
    mixBlendMode: "screen",
    pointerEvents: "none",
  };

  return (
    <>
      {/* Floating launcher */}
      {ReactDOM.createPortal(
        <div className="fixed right-6 bottom-6 z-50">
          <div className="relative h-24 w-24 flex items-center justify-center">
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={rainbowStyle}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
            />
            <motion.button
              aria-label="Open Assistant"
              onClick={() => {
                setOpen(true);
                if (messages.length === 0)
                  pushMessage({
                    role: "assistant",
                    content: "Hi there! I’m ETHUB’s Assistant — say 'start' to begin your repair intake.",
                  });
              }}
              className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 text-white shadow-2xl grid place-items-center"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 1.03 }}
            >
              <Sparkles className="h-7 w-7 animate-pulse" />
            </motion.button>
          </div>
        </div>,
        document.body
      )}

      {/* Chat modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[96] bg-black/30 flex items-end justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="m-6 w-[min(880px,calc(100vw-4rem))] rounded-2xl border bg-white text-neutral-900 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 60, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 40, opacity: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {/* header with title + controls */}
              <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2 font-medium">
                  <div className="text-sm font-semibold">ETHUB Assistant</div>
                  <div className="text-xs text-muted-foreground">Repair intake</div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" onClick={() => setMuted(!muted)}>
                    {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setOpen(false);
                      clearConversation();
                    }}
                    aria-label="Close assistant"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="max-h-[70vh] overflow-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    Welcome — click "Start" or say 'start' to begin your repair intake. I'll prefill details when signed in.
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  {messages.map((m, i) => (
                    <div key={i} className="flex">
                      {renderMessage(m, i)}
                    </div>
                  ))}
                </div>
              </div>

              <form
                className="p-4 border-t flex gap-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const input = e.currentTarget.querySelector("input") as HTMLInputElement;
                  const val = input?.value?.trim() ?? "";
                  if (!val) return;
                  input.value = "";
                  await handleUserInput(val);
                }}
              >
                <input name="assistantInput" placeholder="Type here..." className="flex-1 rounded-md border px-3 py-2" />
                <Button type="submit" disabled={busy || !isLoaded}>
                  Send
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

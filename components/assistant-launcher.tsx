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

export default function AssistantLauncher({ onAssistantMessage }: { onAssistantMessage?: (s: string) => void }) {
  const { user, isLoaded } = useUser();
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Array<{ role: Role; content: string; thinking?: boolean }>>([]);
  const [busy, setBusy] = React.useState(false);
  const [muted, setMuted] = React.useState(false);

  const [intakeState, setIntakeState] = React.useState<IntakeState>("idle");
  const [intake, setIntake] = React.useState<any>({});
  const chatAction = useAction(api.openai.chat);
  const moderateAction = useAction(api.openai.moderate);
  const createInvoiceMutation = useMutation ? useMutation("invoices.create") : null;

  const [ttsQueue, setTtsQueue] = React.useState<string[]>([]);
  const [ttsPlaying, setTtsPlaying] = React.useState(false);

  // mount guard
  React.useEffect(() => {
    const key = "__ETHUB_ASSISTANT_LAUNCHER__";
    if ((window as any)[key]) return;
    (window as any)[key] = true;
    setMounted(true);
    return () => {
      delete (window as any)[key];
    };
  }, []);

  // prefill Clerk user info
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

  // TTS queue runner
  React.useEffect(() => {
    if (!ttsPlaying && ttsQueue.length > 0 && !muted) {
      const next = ttsQueue[0];
      setTtsPlaying(true);
      speakWithOpenAI(next, { voice: TTS_VOICE, format: TTS_FORMAT }).finally(() => {
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
      // pass plain assistant text to parent when a "final" intake is ready
      try	{
        const parsed = JSON.parse(m.content);
        // do not send JSON special messages; parent expects text intake when appropriate
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

async function fetchPartsForQuery(q: string) {
  if (!q || q.trim().length === 0) return null;

  try {
    // 1) Fetch prices from your server route (mobilesentrix)
    const pricesRes = await fetch(`/api/mobilesentrix/prices?query=${encodeURIComponent(q)}`, { cache: "no-store" });
    if (!pricesRes.ok) {
      const txt = await pricesRes.text().catch(() => "");
      console.error("mobilesentrix prices fetch failed", pricesRes.status, pricesRes.statusText, txt);
      return null;
    }
    const pricesJson = await pricesRes.json();

    // Expecting pricesJson to have recommended and alternative. If not, adapt as needed.
    const recommended = pricesJson.recommended ?? null;
    const alternative = pricesJson.alternative ?? null;

    // 2) Fetch images from our server proxy that calls Google CSE
    //    We request up to 6 images to increase chance of matching
    const imagesRes = await fetch(`/api/image-search?query=${encodeURIComponent(q)}&num=6`, { cache: "no-store" });
    let imagesJson = null;
    if (imagesRes.ok) imagesJson = await imagesRes.json();
    else {
      console.warn("image search failed", imagesRes.status, await imagesRes.text().catch(() => ""));
    }
    const images: Array<any> = imagesJson?.images ?? [];

    // 3) Simple matching: prefer image whose title or context includes model or keywords
    const allParts = [];
    if (recommended) allParts.push({ tier: "recommended", part: recommended });
    if (alternative) allParts.push({ tier: "alternative", part: alternative });

    // Helper: choose best image for a given part title
    function pickImageForPart(partTitle: string) {
      if (!partTitle) return null;
      const titleLower = partTitle.toLowerCase();
      // First try exact substring match in image.title or contextLink
      for (const img of images) {
        if ((img.title ?? "").toLowerCase().includes(titleLower)) return img.link;
        if ((img.contextLink ?? "").toLowerCase().includes(titleLower)) return img.link;
      }
      // Next, pick first thumbnail if any
      if (images.length > 0) return images[0].thumbnail ?? images[0].link;
      return null;
    }

    const enriched = {
      recommended: null,
      alternative: null,
    };

    if (recommended) {
      enriched.recommended = {
        ...recommended,
        image: recommended.image ?? pickImageForPart(recommended.title ?? q),
      };
    }
    if (alternative) {
      enriched.alternative = {
        ...alternative,
        image: alternative.image ?? pickImageForPart(alternative.title ?? q + " part"),
      };
    }

    return enriched;
  } catch (err) {
    console.error("fetchPartsForQuery combined error", err);
    return null;
  }
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

  // Helpful hints for users who don't know where to find info
  function hintForField(field: "device" | "issue") {
    switch (field) {
      case "device":
        return "Exact model is often on the back of the device or in Settings → About. For iPhone: Settings → General → About → Model Name. For Android: Settings → About phone → Model. If you can't find it, tell me the brand and any letters/numbers on the back and I’ll help pinpoint the model.";
      case "issue":
        return "Please describe the issue with your device. Explain in detail.: e.g., 'Screen cracked — touch works', 'Battery dies within 2 hours', 'Phone won't boot (stuck on logo)'.";
    }
  }

  // start intake
  function startIntake() {
    if (!user) {
      pushMessage({ role: "assistant", content: "Please sign in to start a repair request." });
      return;
    }
    pushMessage({
      role: "assistant",
      content: `Hi ${intake.name ?? "there"}! I'm here to guide you through a quick repair intake— we'll get this sorted together.`,
    });
    pushMessage({
      role: "assistant",
      content: `First: what's the device name and exact model? (e.g., iPhone 15 Pro Max A2849 or Samsung A13 SM-A136U). If you're unsure, reply 'I don't know' and I'll help you locate it.`,
    });
    setIntakeState("askDeviceModel");
  }

  // attempt to detect whether a model string is sufficiently precise
function looksLikeFullModel(text: string) {
  // Normalize input
  text = text.trim();

  // Return false for empty or non-alphanumeric strings
  if (!text || !/[a-z0-9]/i.test(text)) return false;

  // Check for known brand names or recognizable model codes
  return (
    /\b(iphone|ipad|macbook|mac|galaxy|pixel|surface|oneplus|xiaomi|nokia|sony|lg|htc|motorola)\b/i.test(text) ||
    /\b[A-Z]{1,3}\d{2,4}\b/.test(text) ||
    /\bSM-?\d{3,5}\b/i.test(text)
  );
}

  async function handleUserInput(raw: string) {
    const text = raw.trim();
    if (!text) return;

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
        if (/^(start|yes|ready|hi|hello)/i.test(text)) startIntake();
        else pushMessage({ role: "assistant", content: "Say 'start' to begin your repair intake." });
        break;

      case "askDeviceModel":
        if (/^(i dont know|I don't know|not sure|unsure|help|idk|ok)$/i.test(text)) {
          pushMessage({ role: "assistant", content: `No problem — ${hintForField("device")}` });
          // remain in askDeviceModel
          return;
        }

        // if text looks like a short brand or vague, ask to confirm
        if (!looksLikeFullModel(text)) {
          pushMessage({
            role: "assistant",
            content: `That looks a bit short or like a brand-only entry. ${hintForField("device")} Reply with the full model (or say 'help' to have me walk you through).`,
          });
          // keep in askDeviceModel to allow correction
          setIntake((s: any) => ({ ...s, deviceAndModel: text }));
          return;
        }

        // looks acceptable; set but confirm with the user
        setIntake((s: any) => ({ ...s, deviceAndModel: text }));
        pushMessage({ role: "assistant", content: `Thanks — I recorded: "${text}". Does that match what's written on your device or in settings? Reply 'yes' to continue or 'no' to correct.` });
        // move to a mini-confirm step by storing a temporary state in intake
        setIntake((s: any) => ({ ...s, deviceConfirmed: false }));
        setIntakeState("askIssue"); // still move user flow; we'll check confirmation logically before final summary
        break;

      case "askIssue":
        if (/^(i don't know|dont know|not sure|unsure|help|\?)$/i.test(text)) {
          pushMessage({ role: "assistant", content: `Okay — ${hintForField("issue")}` });
          return;
        }

        if (text.length < 5) {
          pushMessage({ role: "assistant", content: `Could you give a bit more detail? ${hintForField("issue")}` });
          return;
        }

        // Save issue, but require explicit confirmation before proceeding to parts lookup
        setIntake((s: any) => ({ ...s, issue: text, service: text }));
        const summary = {
          ID: `IC-${Date.now().toString().slice(-6)}`,
          Name: intake.name ?? "",
          Description: `${intake.deviceAndModel ?? ""} — ${text}`,
          Service: text,
        };
        setIntake((s: any) => ({ ...s, summary }));
        pushMessage({
          role: "assistant",
          content:
            "Summary prepared. Please confirm the details so I can fetch parts & pricing:\n\n" +
            `• Device: ${summary.Description.split(" — ")[0] || "(not set)"}\n` +
            `• Issue: ${text}\n\nReply 'yes' to continue, 'edit' to change any detail, or 'device' to update the device model.`,
        });
        setIntakeState("confirm");
        break;

      case "confirm":
        if (/^y(es)?$/i.test(text)) {
          // Ensure device is acceptable before lookup
          if (!intake.deviceAndModel || intake.deviceAndModel.length < 3) {
            pushMessage({ role: "assistant", content: `I need the device model to fetch parts. ${hintForField("device")}` });
            setIntakeState("askDeviceModel");
            return;
          }

          pushMessage({ role: "assistant", content: "Looking up parts and live pricing...", thinking: true });
          const q = `${intake.deviceAndModel ?? ""} ${intake.service ?? ""}`.trim();
          const parts = await fetchPartsForQuery(q);
          setMessages((prev) => prev.map((m) => (m.thinking ? { ...m, thinking: false } : m)));
          if (!parts) {
            pushMessage({ role: "assistant", content: "Parts lookup failed. Please try again later." });
            setIntakeState("idle");
            return;
          }
          pushMessage({
            role: "assistant",
            content: JSON.stringify({ type: "parts_suggestion", recommended: parts.recommended ?? null, alternative: parts.alternative ?? null }),
          });
          setIntakeState("done");
        } else if (/^edit$/i.test(text)) {
          pushMessage({ role: "assistant", content: "Okay — say the updated device + model or the corrected issue." });
          setIntakeState("askDeviceModel");
        } else if (/^device$/i.test(text)) {
          pushMessage({ role: "assistant", content: "Sure — what's the correct device model? (If you need help finding it, say 'help')" });
          setIntakeState("askDeviceModel");
        } else {
          pushMessage({ role: "assistant", content: "Intake paused. Say 'start' to begin again or 'edit' to change details." });
          setIntakeState("idle");
        }
        break;

      case "done":
        if (/^(start|new)/i.test(text)) clearConversation();
        else pushMessage({ role: "assistant", content: "Approve a part to save invoice, or say 'start' to create a new intake." });
        break;

      default:
        pushMessage({ role: "assistant", content: "Hmm — not sure where we are. Say 'start' to begin a new intake." });
        setIntakeState("idle");
        break;
    }
  }

  async function onApprovePart(part: any) {
    const summary = intake.summary ?? {};
    const payload = {
      ticketId: summary.ID ?? `IC-${Date.now().toString().slice(-6)}`,
      name: intake.name ?? null,
      phone: intake.phone ?? null,
      manufacturer: summary.Manufacturer ?? null,
      description: summary.Description ?? null,
      quote: part.total ?? null,
      deposit: "$0.00",
      service: summary.Service ?? intake.service ?? "Repair",
      warrantyAcknowledged: true,
      raw: { intake, part },
      status: "pending",
    };
    pushMessage({ role: "assistant", content: "Saving invoice..." });
    const r = await saveInvoiceToPortal(payload);
    if (r.ok) {
      pushMessage({ role: "assistant", content: `✅ Invoice saved. Ticket: ${payload.ticketId}` });
      if (onAssistantMessage) {
        onAssistantMessage(Object.entries(summary).map(([k, v]) => `${k}: ${v}`).join("\n"));
      }
    } else {
      pushMessage({ role: "assistant", content: "❌ Failed to save invoice. Contact support." });
    }
  }

  function renderMessage(m: { role: Role; content: string; thinking?: boolean }, idx: number) {
    if (m.role === "assistant") {
      try {
        const parsed = JSON.parse(m.content);
        if (parsed?.type === "parts_suggestion") {
          const rec = parsed.recommended;
          const alt = parsed.alternative;
          return (
            <div key={idx} className="bg-gray-50 p-3 rounded-xl shadow-sm border text-sm space-y-3">
              {rec && (
                <div>
                  <div className="font-semibold">Recommended — Premium (we recommend this)</div>
                  <div className="flex items-center gap-3 mt-2">
                    {rec.image ? <img src={rec.image} alt={rec.title} className="h-20 object-contain" /> : <div className="h-20 w-20 bg-gray-100 rounded" />}
                    <div>
                      <div className="text-sm">{rec.title}</div>
                      <div className="text-lg font-semibold">${(rec.total ?? 0).toFixed(2)}</div>
                      <div className="text-xs">Part: ${(rec.partPrice ?? 0).toFixed(2)} + Labor: ${rec.labor ?? 100}</div>
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
                    {alt.image ? <img src={alt.image} alt={alt.title} className="h-16 object-contain" /> : <div className="h-16 w-16 bg-gray-50 rounded" />}
                    <div>
                      <div className="text-sm">{alt.title}</div>
                      <div className="text-lg font-semibold">${(alt.total ?? 0).toFixed(2)}</div>
                      <div className="text-xs">Part: ${(alt.partPrice ?? 0).toFixed(2)} + Labor: ${alt.labor ?? 100}</div>
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
      } catch (_) {
        // not JSON
      }
    }

    return (
      <div
        key={idx}
        className={`${m.role === "assistant" ? "bg-blue-50 text-gray-900 self-start" : "bg-gray-200 text-gray-800 self-end"} rounded-xl px-3 py-2 shadow-sm max-w-[80%]`}
      >
        {m.content}
      </div>
    );
  }

  if (!mounted) return null;

  // orbit animation settings for the small star
  const orbit = { animate: { rotate: 360 }, transition: { repeat: Infinity, duration: 6, ease: "linear" } };

  // rainbow gradient style for outer ring (Siri-like)
  const rainbowStyle: React.CSSProperties = {
    background: "conic-gradient(from 0deg, #ff2d55, #ff9500, #ffcc00, #30d158, #5ac8fa, #5856d6, #ff2d55)",
    filter: "blur(10px)",
    mixBlendMode: "screen",
  };

  return (
    <>
      {/* Floating Assistant Button with Siri-like rainbow ring and animated bubbles */}
      {ReactDOM.createPortal(
        <div className="fixed right-6 bottom-6 z-50">
          <div className="relative h-24 w-24">
            {/* animated rainbow ring (rotates slowly) */}
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ ...rainbowStyle }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            />

            {/* multiple soft colored bubble accents */}
            <div className="absolute inset-0 pointer-events-none">
              {/* bubble elements positioned around button */}
              <motion.span
                className="absolute rounded-full opacity-70"
                style={{ width: 12, height: 12, top: 6, left: 14, background: "#ff2d55" }}
                animate={{ y: [0, -6, 0], opacity: [0.7, 0.4, 0.7] }}
                transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut", delay: 0.1 }}
              />
              <motion.span
                className="absolute rounded-full opacity-70"
                style={{ width: 10, height: 10, bottom: 10, right: 20, background: "#30d158" }}
                animate={{ y: [0, -8, 0], opacity: [0.8, 0.3, 0.8] }}
                transition={{ repeat: Infinity, duration: 3.4, ease: "easeInOut", delay: 0.4 }}
              />
              <motion.span
                className="absolute rounded-full opacity-70"
                style={{ width: 14, height: 14, top: 18, right: 6, background: "#5ac8fa" }}
                animate={{ y: [0, -5, 0], opacity: [0.6, 0.3, 0.6] }}
                transition={{ repeat: Infinity, duration: 3.1, ease: "easeInOut", delay: 0.25 }}
              />
              <motion.span
                className="absolute rounded-full opacity-70"
                style={{ width: 8, height: 8, left: 6, bottom: 18, background: "#ffcc00" }}
                animate={{ y: [0, -7, 0], opacity: [0.75, 0.35, 0.75] }}
                transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut", delay: 0.6 }}
              />
            </div>

            {/* main button sits above the ring */}
            <motion.button
              aria-label="Open Assistant"
              onClick={() => {
                setOpen(true);
                if (messages.length === 0) {
                  pushMessage({
                    role: "assistant",
                    content: "Hi there! I’m ETHUB’s Assistant — ready to guide you through a repair intake. Say 'start' to begin!",
                  });
                }
              }}
              className="relative h-16 w-16 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 text-white shadow-2xl grid place-items-center ring-0 focus:outline-none"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="absolute -inset-0.5 rounded-full opacity-30 blur-xl" />
              <motion.div className="absolute inset-0 pointer-events-none" {...orbit}>
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <motion.div style={{ translateX: 36 }} animate={{ translateX: [36, 36, 36] }} transition={{ duration: 0 }}>
                    <div className="absolute h-2 w-2 rounded-full bg-white/80 shadow-lg" />
                  </motion.div>
                </div>
              </motion.div>

              <Sparkles className="h-7 w-7 animate-pulse" />
            </motion.button>
          </div>
        </div>,
        document.body
      )}

      {/* Chat window modal */}
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
              <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2 font-medium">
                  ETHUB Assistant
                  <Button size="icon" variant="ghost" onClick={() => setMuted(!muted)}>
                    {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setOpen(false);
                    clearConversation();
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="max-h-[70vh] overflow-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    Welcome — click "Start" or say 'start' to begin your repair intake. I'll prefill details when signed in.
                  </div>
                )}
                <div className="flex flex-col gap-3">
                  {messages.map(renderMessage)}
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


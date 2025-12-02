// components/assistant-launcher.tsx
"use client";

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, MicOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser, SignIn, SignUp } from "@clerk/nextjs";
import { speakWithOpenAI } from "@/lib/tts";
import { authedFetch } from "@/utils/authedFetch";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

type Role = "system" | "user" | "assistant";
type IntakeState = "idle" | "askDeviceModel" | "askIssue" | "confirm" | "done";
type Part = {
  title: string;
  device?: string;
  category?: string;
  partPrice?: number;
  labor?: number;
  total?: number;
  type?: "Premium" | "Economical" | string;
  eta?: string;
  image?: string;
  source?: string;
  createdAt?: number;
};

const SYSTEM_PROMPT = {
  role: "system" as const,
  content:
    "You are ETHUB Assistant, a friendly, patient receptionist. Guide users step-by-step: ask for device + exact model, issue, and desired service; confirm all details; fetch parts & pricing; present premium first, then economical. Keep language clear, kind, and professional with a touch of sparkle.",
};

function GlowActionButton({
  label,
  glowSize = 124,
  onClick,
}: {
  label: string;
  glowSize?: number;
  onClick?: () => void;
}) {
  const inner = glowSize - 10; // reduce dark button by 10px
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: glowSize, height: glowSize }}
    >
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "conic-gradient(from 0deg,#7cf,#9f7fff,#ff7de9,#ffb86b,#7cf)",
          filter: "blur(6px) saturate(120%)",
          opacity: 0.7,
        }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
      />
      <button
        type="button"
        onClick={onClick}
        className="relative z-10 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white font-medium focus:outline-none focus:ring-2 focus:ring-white/20"
        style={{ width: inner, height: inner }}
      >
        {label}
      </button>
    </div>
  );
}

function AssistantLauncher({
  onAssistantMessage,
}: {
  onAssistantMessage?: (s: string) => void;
}) {
  const { user, isLoaded } = useUser();

  const cacheBundle = useMutation(api.parts.cacheBundle);
  const moderateAction = useAction(api.openai.moderate);

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ role: Role; content: string; thinking?: boolean }>
  >([]);
  const [busy, setBusy] = useState(false);
  const [muted, setMuted] = useState(false);

  const [intakeState, setIntakeState] = useState<IntakeState>("idle");
  const [intake, setIntake] = useState<any>({});
  const [lastParts, setLastParts] = useState<Part[] | null>(null);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);

  const [ttsQueue, setTtsQueue] = useState<string[]>([]);
  const [ttsPlaying, setTtsPlaying] = useState(false);

  const [authMode, setAuthMode] = useState<"none" | "signin" | "signup">(
    "none"
  );

  useEffect(() => {
    const key = "__ETHUB_ASSISTANT_LAUNCHER__";
    if ((window as any)[key]) return;
    (window as any)[key] = true;
    setMounted(true);
    return () => {
      delete (window as any)[key];
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !user) return;
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
      phone: s.phone ?? user.phoneNumbers?.[0]?.phoneNumber ?? undefined,
      userId: user.id,
    }));
  }, [isLoaded, user]);

  useEffect(() => {
    if (!ttsPlaying && ttsQueue.length > 0 && !muted) {
      const next = ttsQueue[0];
      const speakable = stripUnspeakable(next);
      if (speakable) {
        setTtsPlaying(true);
        speakWithOpenAI(speakable, { voice: "alloy", format: "mp3" })
          .catch(() => {})
          .finally(() => {
            setTtsQueue((q) => q.slice(1));
            setTtsPlaying(false);
          });
      } else setTtsQueue((q) => q.slice(1));
    }
  }, [ttsQueue, ttsPlaying, muted]);

  function stripUnspeakable(text: string): string | null {
    try {
      JSON.parse(text);
      return null;
    } catch {}
    if (/https?:\/\//i.test(text)) {
      const noUrls = text.replace(/https?:\/\/\S+/g, "").trim();
      return noUrls || null;
    }
    return text.trim() || null;
  }

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
    setLastParts(null);
    setSelectedPart(null);
    setAuthMode("none");
  }

  function hintForField(field: "device" | "issue") {
    return field === "device"
      ? "The exact model is in Settings → About. If it’s tricky, share the brand and any letters/numbers you see."
      : 'Short and specific helps: “Screen cracked (touch works)”, “Battery drains fast”, or “Phone won’t boot”.';
  }

  function looksLikeFullModel(text: string) {
    return (
      /\b(iphone|ipad|macbook|galaxy|pixel|oneplus|motorola|xiaomi|nokia|surface|sony|htc)\b/i.test(
        text
      ) ||
      /\b[A-Z]{1,3}\d{2,4}\b/.test(text) ||
      /\bSM-?\w+\b/i.test(text)
    );
  }

  function detectManufacturer(model: string | undefined): string | null {
    if (!model) return null;
    const s = model.toLowerCase();
    if (s.includes("iphone") || s.includes("ipad") || s.includes("mac"))
      return "Apple";
    if (s.includes("galaxy") || s.includes("sm-") || s.includes("samsung"))
      return "Samsung";
    if (s.includes("pixel")) return "Google";
    if (s.includes("oneplus")) return "OnePlus";
    if (s.includes("motorola") || s.includes("moto")) return "Motorola";
    if (s.includes("xiaomi") || s.includes("mi") || s.includes("redmi"))
      return "Xiaomi";
    if (s.includes("nokia")) return "Nokia";
    if (s.includes("sony") || s.includes("xperia")) return "Sony";
    if (s.includes("surface") || s.includes("microsoft")) return "Microsoft";
    return null;
  }

  async function fetchPartsAndImages(query: string) {
    if (!query || query.trim().length < 3) return null;
    try {
      const [pricesRes, imagesRes] = await Promise.all([
        fetch(`/api/mobilesentrix/prices?query=${encodeURIComponent(query)}`, {
          cache: "no-store",
        }),
        fetch(`/api/image-search?query=${encodeURIComponent(query)}&num=6`, {
          cache: "no-store",
        }),
      ]);

      let recommended: Part | null = null;
      let alternative: Part | null = null;
      let images: any[] = [];

      if (pricesRes.ok) {
        const pj = await pricesRes.json();
        recommended = pj.recommended ?? null;
        alternative = pj.alternative ?? null;
      }
      if (imagesRes.ok) {
        const ij = await imagesRes.json();
        images = ij.images ?? [];
      }

      function imgFor(title?: string) {
        if (!images?.length) return null;
        if (!title) return images[0]?.url || images[0]?.link || null;
        const lower = title.toLowerCase();
        for (const im of images) {
          const cand = im.url || im.link || im.thumbnail || im.image || im.src;
          const meta = `${im.title ?? ""} ${im.alt ?? ""} ${
            im.contextLink ?? ""
          }`.toLowerCase();
          if (meta.includes(lower)) return cand;
        }
        return images[0]?.url || images[0]?.link || null;
      }

      if (recommended) {
        recommended = {
          ...recommended,
          type: recommended.type || "Premium",
          eta: recommended.eta || "About 2 hours",
          image:
            recommended.image ||
            imgFor(recommended.title ?? query) ||
            undefined,
        };
      }
      if (alternative) {
        alternative = {
          ...alternative,
          type: alternative.type || "Economical",
          eta: alternative.eta || "About 2 hours",
          image:
            alternative.image || imgFor(alternative.title ?? query) || undefined,
        };
      }

      const parts: Part[] = [recommended, alternative].filter(Boolean) as Part[];
      if (parts.length || images.length) {
        try {
          await cacheBundle({ query, parts, images });
        } catch {}
      }
      return { recommended, alternative, images };
    } catch {
      return null;
    }
  }

  function startIntake() {
    if (!user) {
      pushMessage({
        role: "assistant",
        content:
          "Welcome to ETHUB — please sign in to use chat and I’ll prepare your repair intake.",
      });
      return;
    }
    pushMessage({
      role: "assistant",
      content: `✨ Hello ${
        intake.name ?? "there"
      } — What’s the device name and exact model?`,
    });
    setIntakeState("askDeviceModel");
  }

  async function handleUserInput(raw: string) {
    const text = raw.trim();
    if (!text) return;

    try {
      if (moderateAction) {
        const mod = await moderateAction({ text });
        if (mod?.flagged) {
          pushMessage({
            role: "assistant",
            content:
              "I can’t assist with that. If you’re ready, we can focus on your repair details.",
          });
          return;
        }
      }
    } catch {}

    pushMessage({ role: "user", content: text });

    switch (intakeState) {
      case "idle": {
        if (/^(start|hi|hello|yes|ready)/i.test(text)) startIntake();
        else
          pushMessage({
            role: "assistant",
            content: "Say **start** and I’ll begin your repair intake ✨",
          });
        break;
      }
      case "askDeviceModel": {
        if (!looksLikeFullModel(text)) {
          pushMessage({
            role: "assistant",
            content: `I might need the exact model. ${hintForField("device")}`,
          });
          return;
        }
        setIntake((s: any) => ({ ...s, deviceAndModel: text }));
        pushMessage({
          role: "assistant",
          content: `Got it — **${text}**. What’s the issue and the service you want? Here’s an example: “screen cracked (touch works)”.`,
        });
        setIntakeState("askIssue");
        break;
      }
      case "askIssue": {
        setIntake((s: any) => ({ ...s, issue: text, service: text }));
        const summary = {
          ID: `IC-${Date.now().toString().slice(-6)}`,
          Description: `${intake.deviceAndModel ?? ""} — ${text}`,
          Service: text,
        };
        setIntake((s: any) => ({ ...s, summary }));
        pushMessage({
          role: "assistant",
          content: `Let’s confirm:\n• Device: ${intake.deviceAndModel}\n• Issue/Service: ${text}\n\nReply **yes** and I’ll check parts & pricing, or say **edit** to adjust.`,
        });
        setIntakeState("confirm");
        break;
      }
      case "confirm": {
        if (/^y(es)?$/i.test(text)) {
          pushMessage({
            role: "assistant",
            content: "I’m finding the best parts and live pricing… 💫",
            thinking: true,
          });
          const q = `${intake.deviceAndModel ?? ""} ${
            intake.service ?? ""
          }`.trim();
          const parts = await fetchPartsAndImages(q);
          setMessages((prev) =>
            prev.map((m) => (m.thinking ? { ...m, thinking: false } : m))
          );

          if (!parts || (!parts.recommended && !parts.alternative)) {
            pushMessage({
              role: "assistant",
              content:
                "I couldn’t load parts just now. We can try again, or I can note a manual estimate and keep you moving.",
            });
            return;
          }

          const bundle = [parts.recommended, parts.alternative].filter(
            Boolean
          ) as Part[];
          setLastParts(bundle);
          pushMessage({
            role: "assistant",
            content: JSON.stringify({
              type: "parts_suggestion",
              parts: bundle,
              context: { device: intake.deviceAndModel, issue: intake.service },
            }),
          });
          setIntakeState("done");

          setTimeout(() => {
            if (!selectedPart && lastParts?.length) {
              const premium =
                lastParts.find((p) => p.type === "Premium") ?? lastParts[0];
              if (premium) {
                pushMessage({
                  role: "assistant",
                  content:
                    "I’ll proceed with the premium option for quality and longevity. If you prefer the economical option, just say so.",
                });
                void onApprovePart(premium);
              }
            }
          }, 10000);
        } else if (/^edit/i.test(text)) {
          pushMessage({
            role: "assistant",
            content:
              "No problem — share the updated device + model or the corrected issue.",
          });
          setIntakeState("askDeviceModel");
        } else {
          pushMessage({
            role: "assistant",
            content: "Intake paused. Say **start** when you’re ready ✨",
          });
          setIntakeState("idle");
        }
        break;
      }
      case "done": {
        const approveMatch = text.match(
          /^approve(?:\s+(premium|economical|alt|eco))?$/i
        );
        if (approveMatch) {
          let choice = approveMatch[1]?.toLowerCase();
          let part: Part | null = null;
          if (lastParts && lastParts.length) {
            if (!choice) {
              part =
                lastParts.find((p) => p.type === "Premium") ?? lastParts[0];
            } else if (choice.includes("premium")) {
              part =
                lastParts.find((p) => p.type === "Premium") ?? lastParts[0];
            } else if (/(economical|eco|alt)/i.test(choice)) {
              part =
                lastParts.find((p) => p.type !== "Premium") ??
                lastParts[lastParts.length - 1];
            }
          }
          if (!part) {
            pushMessage({
              role: "assistant",
              content:
                "I don’t see any parts to approve. Say **start** to begin a new intake.",
            });
          } else {
            setSelectedPart(part);
            await onApprovePart(part);
          }
          break;
        }
        if (/^(start|new)/i.test(text)) clearConversation();
        else
          pushMessage({
            role: "assistant",
            content:
              "Ready when you are. You can **approve**, **approve premium**, or **approve economical**. I’ll queue your repair as soon as you choose ✨",
          });
        break;
      }
    }
  }

  async function onApprovePart(part: Part) {
    const summary = intake.summary ?? {};
    const manufacturer = detectManufacturer(intake.deviceAndModel) ?? null;
    const quote = part.total ?? (part.partPrice ?? 0) + (part.labor ?? 100);

    const payload = {
      ticketId: summary.ID ?? `IC-${Date.now().toString().slice(-6)}`,
      description:
        summary.Description ??
        `${intake.deviceAndModel ?? ""} — ${
          intake.issue ?? intake.service ?? ""
        }`,
      service: summary.Service ?? intake.service ?? "Repair",
      quote,
      status: "pending",
      deposit: "$0.00",
      warrantyAcknowledged: true,
      manufacturer,
      email: intake.email ?? null,
      name: intake.name ?? null,
      phone: intake.phone ?? null,
      createdAt: Date.now(),
      raw: { intake, part },
    };

    pushMessage({
      role: "assistant",
      content: "Saving your intake — I’ve got everything lined up ✨",
    });

    try {
      const res = await authedFetch(
        "/api/portal/invoices",
        { method: "POST", body: JSON.stringify(payload) },
        { retryOnce: true }
      );
      if (!res.ok) {
        pushMessage({
          role: "assistant",
          content:
            "I couldn’t save that just now. I’ll keep your details ready and we can try again shortly.",
        });
        return;
      }
      pushMessage({
        role: "assistant",
        content:
          "✅ All set — your repair is queued under **Pending**. Thanks for choosing ETHUB — we’ll treat your device with care ✨",
      });
    } catch {
      pushMessage({
        role: "assistant",
        content:
          "I wasn’t able to save that this moment. Your details are safe here — try again when you’re ready.",
      });
    }
  }

  function renderMessage(
    m: { role: Role; content: string; thinking?: boolean },
    idx: number
  ) {
    if (m.role === "assistant") {
      try {
        const parsed = JSON.parse(m.content);
        if (parsed?.type === "parts_suggestion") {
          const parts: Part[] = parsed.parts ?? [];
          return (
            <div key={idx} className="bg-gray-50 p-3 rounded-xl border shadow-sm">
              <div className="text-sm text-muted-foreground mb-2">
                Options for <b>{parsed.context?.device}</b> —{" "}
                {parsed.context?.issue}
              </div>
              <div className="overflow-x-auto flex gap-4 snap-x pb-2">
                {parts.map((p: Part, i: number) => (
                  <div
                    key={i}
                    className="snap-center min-w-[280px] bg-white border rounded-xl shadow-sm p-3"
                  >
                    <div className="h-32 w-full grid place-items-center bg-gray-100 rounded">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.title}
                          className="h-28 object-contain"
                        />
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="mt-2 font-semibold text-sm">{p.title}</div>
                    <div className="text-xs text-muted-foreground mb-1">
                      {p.eta || "About 2 hours"} • {p.type || "Premium"}
                    </div>
                    <div className="text-sm">
                      ${((p.partPrice ?? 0) + (p.labor ?? 100)).toFixed(2)}{" "}
                      <span className="text-xs text-muted-foreground">
                        (Part + Labor)
                      </span>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedPart(p);
                          void onApprovePart(p);
                        }}
                      >
                        Select
                      </Button>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      This part matches your repair and will be installed by a
                      technician with care.
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs">
                You can also type <b>approve</b>, <b>approve premium</b>, or{" "}
                <b>approve economical</b>.
              </div>
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
        } rounded-xl px-3 py-2 shadow-sm max-w-[80%] whitespace-pre-line`}
      >
        {m.thinking ? "…" : m.content}
      </div>
    );
  }

  if (!mounted) return null;

  const rainbowStyle: React.CSSProperties = {
    background:
      "conic-gradient(from 0deg, #ff2d55, #ff9500, #ffcc00, #30d158, #5ac8fa, #5856d6, #ff2d55)",
    filter: "blur(10px)",
    mixBlendMode: "screen",
    pointerEvents: "none",
  };

  const needsAuth =
    !user &&
    messages.some(
      (m) =>
        m.role === "assistant" &&
        /please sign in to use chat/i.test(m.content)
    );

  return (
    <>
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
                if (messages.length === 0) {
                  pushMessage({
                    role: "assistant",
                    content:
                      "✨ Welcome — I’m ETHUB’s Assistant. Say **start** and I’ll take care of your repair intake.",
                  });
                }
              }}
              className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 text-white shadow-2xl grid place-items-center relative z-10"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 1.03 }}
            >
              <Sparkles className="h-7 w-7 animate-pulse" />
            </motion.button>
          </div>
        </div>,
        document.body
      )}

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
                <div className="flex items-center gap-2">
                  <div className="font-semibold">ETHUB Assistant</div>
                  <div className="text-xs text-muted-foreground">
                    Repair intake
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setMuted(!muted)}
                  >
                    {muted ? (
                      <MicOff className="h-5 w-5" />
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setOpen(false);
                      clearConversation();
                    }}
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="max-h-[70vh] overflow-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    Say **start** to begin. I’ll prefill what I can when you’re
                    signed in.
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  {messages.map((m, i) => (
                    <div key={i} className="flex">
                      {renderMessage(m, i)}
                    </div>
                  ))}

                  {needsAuth && (
                    <div className="flex flex-col items-start gap-3">
                      <div className="flex items-center gap-4">
                        <GlowActionButton
                          label="Sign in"
                          glowSize={132}
                          onClick={() => setAuthMode("signin")}
                        />
                        <GlowActionButton
                          label="Sign up"
                          glowSize={132}
                          onClick={() => setAuthMode("signup")}
                        />
                      </div>

                      {authMode === "signin" && (
                        <div className="w-full">
                          <SignIn
                            routing="hash"
                            afterSignInUrl="/portal"
                            fallbackRedirectUrl="/portal"
                            appearance={{
                              elements: {
                                formButtonPrimary: "siri-thin-glow-invert",
                              },
                            }}
                          />
                        </div>
                      )}

                      {authMode === "signup" && (
                        <div className="w-full">
                          <SignUp
                            routing="hash"
                            afterSignUpUrl="/portal"
                            fallbackRedirectUrl="/portal"
                            appearance={{
                              elements: {
                                formButtonPrimary: "siri-thin-glow-invert",
                              },
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <form
                className="p-4 border-t flex gap-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const input = e.currentTarget.querySelector(
                    "input"
                  ) as HTMLInputElement;
                  const val = input?.value?.trim() ?? "";
                  if (!val) return;
                  input.value = "";
                  setBusy(true);
                  try {
                    await handleUserInput(val);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <input
                  name="assistantInput"
                  placeholder="Type here…"
                  className="flex-1 rounded-md border px-3 py-2"
                  disabled={busy}
                />
                <Button type="submit" disabled={busy || !isLoaded}>
                  {busy ? "…" : "Send"}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export { AssistantLauncher };
export default AssistantLauncher;

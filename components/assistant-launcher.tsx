// components/assistant-launcher.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Mic, MicOff, Sparkles, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser, SignIn, SignUp } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { speakWithOpenAI } from "@/lib/tts";

import { authedFetch } from "@/convex/utils/authedFetch";

async function handleApproveAndSave(part: any) {
  try {
    // Step 1: Save temporary partsDoc
    const docRes = await authedFetch("/api/partsDocs/create", {
      method: "POST",
      body: JSON.stringify({ part }),
    });
    const partsDoc = await docRes.json();

    // Step 2: Promote to inventoryParts
    const invRes = await authedFetch("/api/inventoryParts/create", {
      method: "POST",
      body: JSON.stringify({
        name: part.title,
        device: part.device,
        price: part.partPrice,
        labor: part.labor,
        total: part.total,
        sku: part.source + "-" + part.title.replace(/\s+/g, "-"),
        vendor: part.source,
        stock: 1,
      }),
    });
    const inventory = await invRes.json();

    // Step 3: Optionally create invoice
    const invoiceRes = await authedFetch("/api/invoices/create", {
      method: "POST",
      body: JSON.stringify({
        partId: inventory.id,
        device: part.device,
        total: part.total,
      }),
    });

    console.log("✅ Saved successfully:", invoiceRes);
  } catch (error) {
    console.error("❌ Failed:", error);
  }
}

type Role = "system" | "user" | "assistant";
type IntakeState = "idle" | "askDeviceModel" | "askIssue" | "confirm" | "fetching" | "done";

type Part = {
  id?: string;
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
  sku?: string;
};

export default function AssistantLauncher() {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const afterUrl = useMemo(() => pathname || "/", [pathname]);

  const ingest = useAction(api.parts.ingestFromVendor);

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: Role; content: string; thinking?: boolean }>>([]);
  const [busy, setBusy] = useState(false);
  const [muted, setMuted] = useState(false);

  const [intakeState, setIntakeState] = useState<IntakeState>("idle");
  const [intake, setIntake] = useState<any>({});
  const [lastParts, setLastParts] = useState<Part[] | null>(null);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);

  const [authOverlay, setAuthOverlay] = useState<"none" | "signin" | "signup">("none");

  const [ttsQueue, setTtsQueue] = useState<string[]>([]);
  const [ttsPlaying, setTtsPlaying] = useState(false);

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
    if (/https?:\/\//i.test(text)) return text.replace(/https?:\/\/\S+/g, "").trim() || null;
    return text.trim() || null;
  }

  function enqueueTTS(message: string) {
    setTtsQueue((q) => [...q, message]);
  }

  function pushMessage(m: { role: Role; content: string; thinking?: boolean }) {
    setMessages((prev) => [...prev, m]);
    if (m.role === "assistant") enqueueTTS(m.content);
  }

  function clearConversation() {
    setMessages([]);
    setIntakeState("idle");
    setLastParts(null);
    setSelectedPart(null);
  }

  function looksLikeFullModel(text: string) {
    return (
      /\b(iphone|ipad|macbook|galaxy|pixel|oneplus|motorola|xiaomi|nokia|surface|sony|htc)\b/i.test(text) ||
      /\b[A-Z]{1,3}\d{2,4}\b/.test(text) ||
      /\bSM-?\w+\b/i.test(text)
    );
  }
  function detectManufacturer(model?: string) {
    if (!model) return null;
    const s = model.toLowerCase();
    if (s.includes("iphone") || s.includes("ipad") || s.includes("mac")) return "Apple";
    if (s.includes("galaxy") || s.includes("sm-") || s.includes("samsung")) return "Samsung";
    if (s.includes("pixel")) return "Google";
    if (s.includes("oneplus")) return "OnePlus";
    if (s.includes("motorola") || s.includes("moto")) return "Motorola";
    if (s.includes("xiaomi") || s.includes("mi") || s.includes("redmi")) return "Xiaomi";
    if (s.includes("nokia")) return "Nokia";
    if (s.includes("sony") || s.includes("xperia")) return "Sony";
    if (s.includes("surface") || s.includes("microsoft")) return "Microsoft";
    return null;
  }

  async function saveIntakeDraft(extra?: Partial<{ status: string }>) {
    const payload = {
      customerName: intake.name ?? null,
      contact: {
        phone: intake.phone ?? null,
        email: intake.email ?? null,
        preferred: intake.phone ? "phone" : "email",
      },
      deviceModel: intake.deviceAndModel ?? null,
      issueDescription: intake.issue ?? intake.service ?? null,
      requestedService: intake.service ?? null,
      notes: intake.notes ?? null,
      status: extra?.status ?? "submitted",
      manufacturer: detectManufacturer(intake.deviceAndModel),
      userId: intake.userId ?? null,
      createdAt: Date.now(),
    };
    try {
      await authedFetch("/api/portal/intake-drafts", { method: "POST", body: JSON.stringify(payload) }, { retryOnce: true });
    } catch {}
    return payload;
  }

  async function addToPartsCard(p: Part) {
    const card = {
      title: p.title,
      device: intake.deviceAndModel ?? p.device ?? null,
      category: p.category ?? null,
      type: p.type ?? "Premium",
      partPrice: p.partPrice ?? null,
      labor: p.labor ?? 100,
      total: p.total ?? (p.partPrice ?? 0) + (p.labor ?? 100),
      image: p.image ?? null,
      source: p.source ?? "MobileSentrix",
      sku: p.sku ?? null,
      createdAt: Date.now(),
      userId: intake.userId ?? null,
      notes: null,
    };
    try {
      await authedFetch("/api/parts/card", { method: "POST", body: JSON.stringify(card) }, { retryOnce: true });
    } catch {}
    return card;
  }

  async function onApprovePart(part: Part) {
    const manufacturer = detectManufacturer(intake.deviceAndModel);
    const quote = part.total ?? (part.partPrice ?? 0) + (part.labor ?? 100);

    const payload = {
      ticketId: `IC-${Date.now().toString().slice(-6)}`,
      description: `${intake.deviceAndModel ?? ""} — ${intake.issue ?? intake.service ?? ""}`,
      service: intake.service ?? "Repair",
      quote,
      status: "pending",
      deposit: "$0.00",
      warrantyAcknowledged: true,
      manufacturer,
      email: intake.email ?? null,
      name: intake.name ?? null,
      phone: intake.phone ?? null,
      createdAt: Date.now(),
      selectedPart: {
        id: part.id ?? crypto.randomUUID(),
        title: part.title,
        type: part.type ?? "Premium",
        partPrice: part.partPrice ?? null,
        labor: part.labor ?? 100,
        total: part.total ?? (part.partPrice ?? 0) + (part.labor ?? 100),
        image: part.image ?? null,
        source: part.source ?? "MobileSentrix",
        sku: part.sku ?? null,
      },
      partsOffered: lastParts ?? [],
      raw: { intake },
    };

    pushMessage({ role: "assistant", content: "Saving your intake…" });
    try {
      const res = await authedFetch("/api/portal/invoices", { method: "POST", body: JSON.stringify(payload) }, { retryOnce: true });
      if (!res.ok) {
        pushMessage({ role: "assistant", content: "Couldn’t save right now. We’ll try again shortly." });
        return;
      }
      pushMessage({ role: "assistant", content: "✅ Queued under Pending." });
    } catch {
      pushMessage({ role: "assistant", content: "Save failed. Details are cached here — retry when ready." });
    }
  }

  function startIntake() {
    if (!user) {
      pushMessage({ role: "assistant", content: "Welcome to ETHUB — please sign in so I can prepare your repair intake." });
      return;
    }
    pushMessage({ role: "assistant", content: `✨ Hello ${intake.name ?? "there"} — What’s the device name and exact model?` });
    setIntakeState("askDeviceModel");
  }

  function pickByPreference(parts: Part[] | null, pref: "premium" | "economical") {
    if (!parts?.length) return null;
    const cmp = (p: Part) => (p.type || "").toLowerCase();
    if (pref === "premium") return parts.find((p) => cmp(p).includes("premium")) ?? parts[0];
    return parts.find((p) => cmp(p).includes("econom")) ?? parts[parts.length - 1];
  }

  async function handleUserInput(raw: string) {
    const text = raw.trim();
    if (!text) return;

    pushMessage({ role: "user", content: text });

    if (intakeState === "idle") {
      if (/^(start|hi|hello|yes|ready)/i.test(text)) startIntake();
      else pushMessage({ role: "assistant", content: "Say **start** and I’ll begin your repair intake ✨" });
      return;
    }

    if (intakeState === "askDeviceModel") {
      if (!looksLikeFullModel(text)) {
        pushMessage({ role: "assistant", content: "I might need the exact model. The exact model is in Settings → About." });
        return;
      }
      setIntake((s: any) => ({ ...s, deviceAndModel: text }));
      pushMessage({ role: "assistant", content: `Got it — **${text}**. What’s the issue and the service you want? Example: “screen cracked (touch works)”.` });
      setIntakeState("askIssue");
      return;
    }

    if (intakeState === "askIssue") {
      setIntake((s: any) => ({
        ...s,
        issue: text,
        service: text,
        summary: {
          ID: `IC-${Date.now().toString().slice(-6)}`,
          Description: `${intake.deviceAndModel ?? ""} — ${text}`,
          Service: text,
        },
      }));
      pushMessage({
        role: "assistant",
        content: `Let’s confirm:\n• Device: ${intake.deviceAndModel}\n• Issue/Service: ${text}\n\nReply **yes** and I’ll check parts & pricing, or say **edit** to adjust.`,
      });
      setIntakeState("confirm");
      return;
    }

    if (intakeState === "confirm") {
      if (/^y(es)?$/i.test(text)) {
        await saveIntakeDraft({ status: "submitted" });
        pushMessage({ role: "assistant", content: "I’m finding the best parts and live pricing… 💫", thinking: true });
        setIntakeState("fetching");
        try {
          const res = await ingest({
            deviceModel: String(intake.deviceAndModel || ""),
            customerName: intake.name ?? "Walk-in",
            issue: String(intake.issue || intake.service || "TBD"),
            defaultLabor: 30,
          });
          setMessages((prev) => prev.map((m) => (m.thinking ? { ...m, thinking: false } : m)));
          const parts = (res?.partsPreview ?? []).map((p: any) => ({
            id: crypto.randomUUID(),
            title: p.title,
            device: p.device,
            category: undefined,
            partPrice: p.partPrice,
            labor: p.labor,
            total: p.total ?? ((p.partPrice ?? 0) + (p.labor ?? 0)),
            type: (p.type as any) ?? "Premium",
            eta: p.eta ?? "About 2 hours",
            image: p.image,
            source: p.source ?? "MobileSentrix",
            createdAt: p.createdAt ?? Date.now(),
            sku: undefined,
          })) as Part[];

          if (!parts.length) {
            pushMessage({ role: "assistant", content: "No parts found right now. I can note a manual estimate and keep you moving." });
            setIntakeState("done");
            return;
          }

          setLastParts(parts);
          pushMessage({
            role: "assistant",
            content: JSON.stringify({ type: "parts_suggestion", parts, context: { device: intake.deviceAndModel, issue: intake.service } }),
          });
          setIntakeState("done");
        } catch {
          setMessages((prev) => prev.map((m) => (m.thinking ? { ...m, thinking: false } : m)));
          pushMessage({ role: "assistant", content: "Couldn’t reach live pricing. Try again or proceed with a manual estimate." });
          setIntakeState("done");
        }
        return;
      }

      if (/^edit/i.test(text)) {
        pushMessage({ role: "assistant", content: "No problem — share the updated device + model or the corrected issue." });
        setIntakeState("askDeviceModel");
        return;
      }

      pushMessage({ role: "assistant", content: "Intake paused. Say **start** when you’re ready ✨" });
      setIntakeState("idle");
      return;
    }

    if (intakeState === "done") {
      if (/^(start|new)/i.test(text)) {
        clearConversation();
        return;
      }
      if (/^approve(\s+premium)?$/i.test(text)) {
        const p = pickByPreference(lastParts, "premium");
        if (p) {
          setSelectedPart(p);
          await onApprovePart(p);
        } else {
          pushMessage({ role: "assistant", content: "No premium option available." });
        }
        return;
      }
      if (/^approve\s+econom(ical)?$/i.test(text)) {
        const p = pickByPreference(lastParts, "economical");
        if (p) {
          setSelectedPart(p);
          await onApprovePart(p);
        } else {
          pushMessage({ role: "assistant", content: "No economical option available." });
        }
        return;
      }
      pushMessage({ role: "assistant", content: "Ready when you are. You can **approve**, **approve premium**, or **approve economical**." });
      return;
    }
  }

  const rainbowStyle: React.CSSProperties = {
    background: "conic-gradient(from 0deg, #5AC8FA, #5856D6, #FF2D55, #FF9500, #FFCC00, #30D158, #5AC8FA)",
    filter: "blur(10px)",
    mixBlendMode: "screen",
    pointerEvents: "none",
  };

  const LauncherBubble = (
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
              pushMessage({ role: "assistant", content: "✨ Welcome — I’m ETHUB’s Assistant. Say **start** and I’ll take care of your repair intake." });
            }
          }}
          className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 text-white shadow-2xl grid place-items-center relative z-10"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 1.03 }}
        >
          <Sparkles className="h-7 w-7 animate-pulse" />
        </motion.button>
      </div>
    </div>
  );

  function GradientBorderButton({ label, onClick, ariaLabel }: { label: string; onClick: () => void; ariaLabel?: string }) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel ?? label}
        className="relative w-full h-[48px] rounded-xl bg-neutral-950 text-white font-medium text-[14px] shadow-[0_2px_0_rgba(0,0,0,0.45)] hover:bg-neutral-900 active:translate-y-[0.5px] transition-colors overflow-hidden"
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-xl p-[3.5px]"
          style={{
            background: "linear-gradient(90deg, #ff2d55, #ff9500, #ffcc00, #30d158, #5ac8fa, #5856d6, #ff2d55)",
            backgroundSize: "200% 100%",
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            animation: "ethubRainbowSlide 3.8s linear infinite",
          }}
        />
        <span
          aria-hidden
          className="absolute -inset-[10px] rounded-[16px] blur-[20px] opacity-60 pointer-events-none"
          style={{
            background: "linear-gradient(90deg, #ff2d55, #ff9500, #ffcc00, #30d158, #5ac8fa, #5856d6, #ff2d55)",
            backgroundSize: "200% 100%",
            animation: "ethubRainbowSlide 3.8s linear infinite",
            mixBlendMode: "screen",
          }}
        />
        <span className="relative z-10">{label}</span>
        <ArrowRight className="h-[16px] w-[16px] relative z-10 ml-2" />
      </button>
    );
  }

  function renderMessage(m: { role: Role; content: string; thinking?: boolean }, idx: number) {
    try {
      if (m.role === "assistant") {
        const parsed = JSON.parse(m.content);
        if (parsed?.type === "parts_suggestion") {
          const parts: Part[] = parsed.parts ?? [];
          return (
            <div key={idx} className="bg-gray-50 p-3 rounded-xl border shadow-sm">
              <div className="text-sm text-muted-foreground mb-2">
                Options for <b>{parsed.context?.device}</b> — {parsed.context?.issue}
              </div>
              <div className="overflow-x-auto flex gap-4 snap-x pb-2">
                {parts.map((p: Part, i: number) => (
                  <div key={i} className="snap-center min-w-[280px] bg-white border rounded-xl shadow-sm p-3">
                    <div className="h-32 w-full grid place-items-center bg-gray-100 rounded">
                      {p.image ? <img src={p.image} alt={p.title} className="h-28 object-contain" /> : <div className="text-xs text-muted-foreground">No image</div>}
                    </div>
                    <div className="mt-2 font-semibold text-sm">{p.title}</div>
                    <div className="text-xs text-muted-foreground mb-1">{p.eta || "About 2 hours"} • {p.type || "Premium"}</div>
                    <div className="text-sm">
                      ${((p.partPrice ?? 0) + (p.labor ?? 100)).toFixed(2)} <span className="text-xs text-muted-foreground">(Part + Labor)</span>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" onClick={() => { setSelectedPart(p); void onApprovePart(p); }}>Select</Button>
                      <Button size="sm" variant="outline" onClick={() => void addToPartsCard(p)}>
                        <Plus className="h-3.5 w-3.5 mr-1" /> PartsCard
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs">Type <b>approve</b>, <b>approve premium</b>, or <b>approve economical</b>.</div>
            </div>
          );
        }
      }
    } catch {}

    return (
      <div
        key={idx}
        className={`${m.role === "assistant" ? "bg-blue-50 text-gray-900 self-start" : "bg-gray-200 text-gray-800 self-end"} rounded-xl px-3 py-2 shadow-sm max-w-[80%] whitespace-pre-line`}
      >
        {m.thinking ? "…" : m.content}
      </div>
    );
  }

  if (!mounted) return null;

  const needsAuth = !user && messages.some((m) => m.role === "assistant" && /please sign in/i.test(m.content));

  return (
    <>
      {ReactDOM.createPortal(LauncherBubble, document.body)}

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
                  <div className="text-xs text-muted-foreground">Repair intake</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" onClick={() => setMuted(!muted)} aria-label={muted ? "Unmute" : "Mute"}>
                    {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => { setOpen(false); clearConversation(); }} aria-label="Close">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="max-h-[70vh] overflow-auto p-4 space-y-3">
                {messages.length === 0 && <div className="text-sm text-muted-foreground">Say <b>start</b> to begin. I’ll prefill what I can when you’re signed in.</div>}
                <div className="flex flex-col gap-3">
                  {messages.map((m, i) => (
                    <div key={i} className="flex">{renderMessage(m, i)}</div>
                  ))}

                  {!user && (
                    <div className="self-start rounded-2xl border bg-white/80 p-3 shadow-sm backdrop-blur-sm w-[min(640px,100%)]">
                      <div className="text-[13px] text-neutral-800 mb-2">Sign in to use chat.</div>
                      <div className="flex flex-col gap-2">
                        <GradientBorderButton label="Sign in" onClick={() => setAuthOverlay("signin")} />
                        <GradientBorderButton label="Sign up" onClick={() => setAuthOverlay("signup")} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <form
                className="p-4 border-t flex gap-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const input = e.currentTarget.querySelector("input") as HTMLInputElement;
                  const val = input?.value?.trim() ?? "";
                  if (!val) return;
                  setBusy(true);
                  input.value = "";
                  await handleUserInput(val);
                  setBusy(false);
                }}
              >
                <input name="assistantInput" placeholder="Type here…" className="flex-1 rounded-md border px-3 py-2" disabled={busy} />
                <Button type="submit" disabled={busy || !isLoaded}>{busy ? "…" : "Send"}</Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {authOverlay !== "none" && (
        <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setAuthOverlay("none")}>
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-neutral-950 text-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <div className="text-white/90 text-sm font-semibold">{authOverlay === "signin" ? "Login" : "Create your account"}</div>
              <button onClick={() => setAuthOverlay("none")} className="text-white/70 hover:text-white" aria-label="Close">×</button>
            </div>
            <div className="p-3">
              {authOverlay === "signin" ? (
                <SignIn routing="hash" afterSignInUrl={afterUrl} fallbackRedirectUrl={afterUrl} appearance={{ elements: { card: "bg-neutral-950", headerTitle: "text-white", headerSubtitle: "text-white/70", formFieldInput: "bg-neutral-900 border-white/15 text-white placeholder:text-white/40", formButtonPrimary: "bg-white text-black hover:bg-white/90 rounded-lg" }, layout: { socialButtonsPlacement: "bottom" } }} />
              ) : (
                <SignUp routing="hash" afterSignUpUrl={afterUrl} fallbackRedirectUrl={afterUrl} appearance={{ elements: { card: "bg-neutral-950", headerTitle: "text-white", headerSubtitle: "text-white/70", formFieldInput: "bg-neutral-900 border-white/15 text-white placeholder:text-white/40", formButtonPrimary: "bg-white text-black hover:bg-white/90 rounded-lg" }, layout: { socialButtonsPlacement: "bottom" } }} />
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes ethubRainbowSlide {
          0% { background-position: 0% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </>
  );
}

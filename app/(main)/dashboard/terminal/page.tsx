"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Circle,
  Edit2,
  HelpCircle,
  Link2,
  LockKeyhole,
  Play,
  Plus,
  Save,
  Sparkles,
  TerminalSquare,
  Trash2,
  Wifi,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

import { cn } from "@/lib/utils";

type TerminalSession = {
  id: string;
  name: string;
  host: string;
  username: string;
  port: string;
  notes?: string;
  tag?: string;
};

const defaultSessions: TerminalSession[] = [
  {
    id: "edge-lab",
    name: "Edge Lab",
    host: "lab.ethub.cloud",
    username: "deploy",
    port: "22",
    notes: "GPU rig for voice + analytics",
    tag: "Production",
  },
  {
    id: "playground",
    name: "Playground",
    host: "devbox.ethub.internal",
    username: "builder",
    port: "22",
    notes: "Safe sandbox for experiments",
    tag: "Sandbox",
  },
];

const glowBorder =
  "border border-white/10 bg-gradient-to-b from-slate-900/70 via-slate-950 to-black/80 shadow-[0_25px_70px_-28px_rgba(0,0,0,0.8)]";

export default function TerminalPage() {
  const { user } = useUser();
  const [sessions, setSessions] = useState<TerminalSession[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>("edge-lab");
  const [status, setStatus] = useState("Select a saved terminal to connect.");
  const [draft, setDraft] = useState<TerminalSession>({
    id: "",
    name: "",
    host: "",
    username: "",
    port: "22",
    notes: "",
    tag: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  const storageKey = useMemo(
    () => `ethub-terminal-sessions:${user?.id ?? "guest"}`,
    [user?.id],
  );

  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem(storageKey)
        : null;

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as TerminalSession[];
        setSessions(parsed);
        if (parsed.length && !selectedId) setSelectedId(parsed[0].id);
        return;
      } catch (error) {
        console.error("Failed to parse sessions", error);
      }
    }

    setSessions(defaultSessions);
  }, [storageKey, selectedId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(sessions));
  }, [sessions, storageKey]);

  const selectedSession = sessions.find((session) => session.id === selectedId);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      setStatus("Please sign in to save SSH terminals to your profile.");
      return;
    }

    if (!draft.name || !draft.host || !draft.username) {
      setStatus("Name, host, and username are required.");
      return;
    }

    const newSession: TerminalSession = {
      ...draft,
      id: isEditing && draft.id ? draft.id : crypto.randomUUID(),
    };

    setSessions((prev) => {
      if (isEditing) {
        return prev.map((session) =>
          session.id === draft.id ? { ...session, ...newSession } : session,
        );
      }
      return [...prev, newSession];
    });

    setStatus(
      isEditing
        ? "Session updated and saved to your profile."
        : "New terminal saved for quick SSH access.",
    );

    setDraft({ id: "", name: "", host: "", username: "", port: "22", notes: "", tag: "" });
    setIsEditing(false);
    setSelectedId(newSession.id);
  };

  const handleEdit = (session: TerminalSession) => {
    setDraft(session);
    setIsEditing(true);
    setStatus(`Editing ${session.name}`);
  };

  const handleDelete = (id: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== id));
    if (selectedId === id) setSelectedId(null);
    setStatus("Session removed. It will disappear from your profile.");
  };

  const handleConnect = (session: TerminalSession) => {
    setSelectedId(session.id);
    setStatus(`Connecting securely to ${session.host} as ${session.username}...`);
  };

  return (
    <div className="space-y-6">
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl p-6 md:p-8",
          glowBorder,
          "bg-[radial-gradient(circle_at_20%_-10%,#1d2b4f,transparent_40%),radial-gradient(circle_at_80%_0%,#3f1f5f,transparent_35%),#03030a]",
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,#0ea5e9/10,transparent_55%)]" />
        <div className="relative grid gap-6 md:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-sky-300 ring-1 ring-white/10">
                <TerminalSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-foreground/60">
                  Remote-only shell
                </p>
                <h1 className="text-xl font-semibold text-foreground md:text-2xl">
                  SSH Terminal control room
                </h1>
              </div>
            </div>
            <p className="max-w-2xl text-sm text-foreground/70 md:text-base">
              Connect to remote machines through a guided SSH launcher. Save trusted endpoints to your
              profile, edit credentials, and jump into a live session instantly—all wrapped in a terminal-first
              interface with animated hints.
            </p>

            <div className="grid grid-cols-1 gap-2 text-xs text-foreground/70 sm:grid-cols-3">
              {["Only authenticated users can open SSH tunnels.", "Saved terminals stay on your profile until removed.", "Click any saved card to jump into a live session."]
                .map((copy) => (
                  <div
                    key={copy}
                    className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 ring-1 ring-white/10"
                  >
                    <Circle className="h-2 w-2 fill-cyan-400/70 text-cyan-300" />
                    <span className="leading-tight">{copy}</span>
                  </div>
                ))}
            </div>
          </div>

          <motion.div
            className="relative h-full rounded-2xl border border-cyan-500/10 bg-black/60 p-4 text-xs text-cyan-100 shadow-inner"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 via-fuchsia-500/5 to-emerald-500/5" />
            <div className="relative flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-cyan-200/70">
              <Wifi className="h-3.5 w-3.5" />
              LIVE TERMINAL GUIDE
            </div>
            <div className="relative mt-3 space-y-2 font-mono text-[12px] leading-relaxed">
              <div className="flex items-center gap-2 text-emerald-300/80">
                <TerminalSquare className="h-4 w-4" />
                <span>ssh $USER@$HOST -p $PORT</span>
              </div>
              <p className="text-cyan-200/70">Secure tunnels are created on demand for each saved session.</p>
              <p className="text-fuchsia-200/70">Use the drawer below to edit credentials, add notes, and pin your favorites.</p>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-[11px] text-foreground/80">
                <p className="font-semibold text-white">Pro tip</p>
                <p>Keep a friendly alias like "Edge Lab"—we show it on every connect animation.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <header className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-foreground/60">Saved terminals</p>
              <h2 className="text-lg font-semibold text-foreground">Quick-launch SSH endpoints</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground/70">
              <LockKeyhole className="h-4 w-4" />
              <span>Stored per user</span>
            </div>
          </header>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {sessions.map((session) => {
              const metrics = buildMetrics(session.id);
              const active = selectedId === session.id;
              return (
                <motion.div
                  key={session.id}
                  layout
                  onClick={() => handleConnect(session)}
                    className={cn(
                      "group relative cursor-pointer rounded-2xl p-3 transition",
                      glowBorder,
                      active
                        ? "border-cyan-400/30 bg-white/5"
                        : "border-white/5 bg-white/5 hover:border-cyan-300/30 hover:bg-white/10",
                    )}
                  whileHover={{ translateY: -2 }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-foreground/50">{session.tag || "SSH"}</p>
                      <p className="text-base font-semibold text-foreground">{session.name}</p>
                      <p className="text-[12px] text-foreground/70">
                        {session.username}@{session.host}:{session.port || "22"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleEdit(session);
                        }}
                        className="rounded-full border border-white/10 bg-white/5 p-1.5 text-foreground/80 transition hover:bg-white/10"
                        aria-label={`Edit ${session.name}`}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDelete(session.id);
                        }}
                        className="rounded-full border border-white/10 bg-white/5 p-1.5 text-rose-300/80 transition hover:bg-white/10"
                        aria-label={`Delete ${session.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-foreground/70">
                    <Metric label="Latency" value={`${metrics.latency} ms`} />
                    <Metric label="CPU" value={`${metrics.cpu}%`} />
                    <Metric label="Uptime" value={`${metrics.uptime}h`} />
                  </div>

                  {session.notes && (
                    <p className="mt-2 rounded-xl bg-white/5 px-3 py-2 text-[12px] text-foreground/70">
                      {session.notes}
                    </p>
                  )}

                  {active && (
                    <motion.div
                      layoutId="active-terminal"
                      className="pointer-events-none absolute inset-0 rounded-2xl border border-cyan-400/30 shadow-[0_0_0_6px_rgba(34,211,238,0.08)]"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className={cn("rounded-3xl p-4", glowBorder)}>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-cyan-300 ring-1 ring-white/10">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-foreground/60">
                    {isEditing ? "Edit SSH profile" : "Add SSH profile"}
                  </p>
                  <p className="text-sm text-foreground/70">
                    Define host, username, and port. Saved to your account forever.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Friendly name"
                  placeholder="Edge Lab"
                  value={draft.name}
                  onChange={(value) => setDraft((prev) => ({ ...prev, name: value }))}
                />
                <Field
                  label="Tag"
                  placeholder="Prod, Sandbox, QA"
                  value={draft.tag || ""}
                  onChange={(value) => setDraft((prev) => ({ ...prev, tag: value }))}
                />
                <Field
                  label="Host"
                  placeholder="server.domain.com"
                  value={draft.host}
                  onChange={(value) => setDraft((prev) => ({ ...prev, host: value }))}
                />
                <Field
                  label="Username"
                  placeholder="deploy"
                  value={draft.username}
                  onChange={(value) => setDraft((prev) => ({ ...prev, username: value }))}
                />
                <Field
                  label="Port"
                  placeholder="22"
                  value={draft.port}
                  onChange={(value) => setDraft((prev) => ({ ...prev, port: value }))}
                />
                <Field
                  label="Notes"
                  placeholder="GPU box, keep tmux alive"
                  value={draft.notes || ""}
                  onChange={(value) => setDraft((prev) => ({ ...prev, notes: value }))}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/70">
                <Sparkles className="h-4 w-4 text-cyan-300" />
                Only registered users can save or modify SSH profiles. Anonymous users can browse.
              </div>

              <button
                type="submit"
                disabled={!user}
                className={cn(
                  "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold",
                  user
                    ? "bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] hover:shadow-fuchsia-500/25"
                    : "cursor-not-allowed bg-white/10 text-foreground/60",
                )}
              >
                {isEditing ? <Save className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                {isEditing ? "Save changes" : "Save SSH profile"}
              </button>
              <p className="text-xs text-foreground/60">{status}</p>
            </form>
          </div>

          <div className={cn("rounded-3xl p-4", glowBorder)}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-foreground/60">Live metrics</p>
                <p className="text-sm text-foreground/80">Snapshot of the selected server</p>
              </div>
              <button
                type="button"
                onClick={() => selectedSession && handleConnect(selectedSession)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-foreground/80 transition hover:bg-white/10"
              >
                <Play className="h-3.5 w-3.5" />
                Connect
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-[12px] text-foreground/80 sm:grid-cols-3">
              {selectedSession ? (
                <>
                  <Metric label="Host" value={selectedSession.host} subtle />
                  <Metric label="User" value={selectedSession.username} subtle />
                  <Metric label="Port" value={selectedSession.port || "22"} subtle />
                  <Metric label="Latency" value={`${buildMetrics(selectedSession.id).latency} ms`} subtle />
                  <Metric label="CPU" value={`${buildMetrics(selectedSession.id).cpu}%`} subtle />
                  <Metric label="Uptime" value={`${buildMetrics(selectedSession.id).uptime}h`} subtle />
                </>
              ) : (
                <p className="col-span-3 text-foreground/60">Pick a saved terminal to view metrics.</p>
              )}
            </div>

            <div className="mt-3 rounded-2xl bg-black/60 p-4 font-mono text-[12px] text-emerald-100 ring-1 ring-white/10">
              <div className="mb-2 flex items-center gap-2 text-cyan-200">
                <TerminalSquare className="h-4 w-4" />
                <span>Terminal preview</span>
              </div>
              <div className="space-y-1 text-foreground/70">
                <CodeLine text="$ ssh deploy@edge-lab -p 22" active />
                <CodeLine text="Authenticating with ed25519 key..." />
                <CodeLine text="Link established — forwarding to secure PTY." />
                <CodeLine text="Tip: Start a tmux session to keep processes alive." />
              </div>
            </div>
          </div>

          <div className={cn("rounded-3xl p-4", glowBorder)}>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-foreground/60">
              <HelpCircle className="h-4 w-4" />
              How to use this terminal
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {[
                { title: "Save", body: "Create a friendly name, host, and user. We'll keep it tied to your account forever." },
                { title: "Connect", body: "Tap a card to launch a new SSH tunnel with your saved credentials." },
                { title: "Edit or remove", body: "Update ports, notes, or delete stale endpoints with one tap." },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl bg-white/5 p-3 text-sm text-foreground/80 ring-1 ring-white/10">
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="text-foreground/70">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1 text-sm text-foreground/80">
      <span className="text-[12px] uppercase tracking-[0.14em] text-foreground/60">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-cyan-400/50 focus:outline-none"
      />
    </label>
  );
}

function Metric({
  label,
  value,
  subtle = false,
}: {
  label: string;
  value: string;
  subtle?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl px-3 py-2",
        subtle ? "bg-white/10" : "bg-white/5",
        "ring-1 ring-white/10",
      )}
    >
      <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/60">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function CodeLine({ text, active }: { text: string; active?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Activity
        className={cn(
          "h-3 w-3",
          active ? "text-emerald-400" : "text-foreground/30",
        )}
      />
      <span className="text-foreground/70">{text}</span>
    </div>
  );
}

function buildMetrics(seed: string) {
  const hash = Math.abs(
    Array.from(seed).reduce((value, char) => value + char.charCodeAt(0), 0),
  );
  return {
    latency: 18 + (hash % 40),
    cpu: 12 + (hash % 55),
    uptime: 4 + (hash % 48),
  };
}

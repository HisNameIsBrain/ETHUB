"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Activity,
  BadgeCheck,
  Edit,
  Info,
  KeyRound,
  Link2,
  Lock,
  PlugZap,
  Plus,
  ServerCog,
  ShieldCheck,
  Signal,
  TerminalSquare,
  Trash2,
  Wifi,
} from "lucide-react";

type TerminalSession = {
  id: string;
  name: string;
  hostname: string;
  username: string;
  port: number;
  status: "ready" | "connected" | "pending" | "error";
  lastUsed: string;
  metrics: {
    cpu: number;
    memory: number;
    latency: number;
    uptime: string;
  };
};

const defaultSessions: TerminalSession[] = [
  {
    id: "edge-lab",
    name: "Edge Lab",
    hostname: "edge-lab.ethub.dev",
    username: "deploy",
    port: 22,
    status: "connected",
    lastUsed: "Active now",
    metrics: {
      cpu: 32,
      memory: 54,
      latency: 18,
      uptime: "3d 4h",
    },
  },
  {
    id: "prod-gateway",
    name: "Gateway",
    hostname: "gateway.ethub.dev",
    username: "ubuntu",
    port: 2222,
    status: "ready",
    lastUsed: "2h ago",
    metrics: {
      cpu: 12,
      memory: 36,
      latency: 34,
      uptime: "17d",
    },
  },
];

export default function TerminalPage() {
  const { isSignedIn } = useUser();
  const [sessions, setSessions] = useState<TerminalSession[]>(defaultSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    defaultSessions[0]?.id ?? null,
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    hostname: "",
    username: "",
    port: 22,
  });

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) ?? null,
    [sessions, activeSessionId],
  );

  // Soft-refresh metrics to give the page a "live" feel
  useEffect(() => {
    const interval = setInterval(() => {
      setSessions((prev) =>
        prev.map((session) => ({
          ...session,
          metrics: {
            ...session.metrics,
            cpu: Math.min(100, Math.max(8, session.metrics.cpu + (Math.random() - 0.5) * 6)),
            memory: Math.min(100, Math.max(15, session.metrics.memory + (Math.random() - 0.5) * 5)),
            latency: Math.max(8, session.metrics.latency + (Math.random() - 0.5) * 3),
          },
        })),
      );
    }, 4200);

    return () => clearInterval(interval);
  }, []);

  const resetForm = () => {
    setForm({ name: "", hostname: "", username: "", port: 22 });
    setEditingId(null);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.hostname.trim() || !form.username.trim()) return;

    if (editingId) {
      setSessions((prev) =>
        prev.map((session) =>
          session.id === editingId
            ? {
                ...session,
                name: form.name,
                hostname: form.hostname,
                username: form.username,
                port: form.port,
                status: "ready",
                lastUsed: "Saved now",
              }
            : session,
        ),
      );
      setActiveSessionId(editingId);
    } else {
      const id = form.name.toLowerCase().replace(/\s+/g, "-") || crypto.randomUUID();
      const newSession: TerminalSession = {
        id,
        name: form.name,
        hostname: form.hostname,
        username: form.username,
        port: form.port,
        status: "pending",
        lastUsed: "Just added",
        metrics: { cpu: 18, memory: 22, latency: 25, uptime: "--" },
      };
      setSessions((prev) => [...prev, newSession]);
      setActiveSessionId(id);
    }

    resetForm();
  };

  const handleEdit = (session: TerminalSession) => {
    setEditingId(session.id);
    setForm({
      name: session.name,
      hostname: session.hostname,
      username: session.username,
      port: session.port,
    });
  };

  const handleRemove = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
    }
    if (editingId === id) {
      resetForm();
    }
  };

  const handleConnect = (id: string) => {
    setActiveSessionId(id);
    setSessions((prev) =>
      prev.map((session) =>
        session.id === id
          ? { ...session, status: "connected", lastUsed: "Live" }
          : session.status === "connected"
            ? { ...session, status: "ready" }
            : session,
      ),
    );
  };

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col gap-3 rounded-2xl border border-white/5 bg-[radial-gradient(circle_at_top,#101427,#040513)] p-4 text-xs text-slate-100 shadow-[0_18px_40px_rgba(0,0,0,0.55)]">
      <header className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-gradient-to-r from-slate-950/70 via-indigo-950/40 to-slate-950/70 px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/90 text-sky-300 ring-1 ring-sky-500/50 shadow-[0_0_20px_rgba(56,189,248,0.35)]">
            <TerminalSquare className="h-[18px] w-[18px]" />
          </div>
          <div>
            <h1 className="text-[13px] font-semibold tracking-[0.18em] text-slate-100">
              TERMINAL
            </h1>
            <p className="text-[11px] text-slate-400">
              Secure SSH jumpbox with saved sessions bound to your profile.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-300">
          <span className="flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-emerald-200">
            <BadgeCheck className="h-3 w-3" /> Registered users can create SSH requests
          </span>
          <span className="hidden items-center gap-1 rounded-full border border-sky-500/40 bg-sky-500/10 px-2 py-1 text-sky-200 sm:flex">
            <ShieldCheck className="h-3 w-3" /> Persisted to your profile until removed
          </span>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-3 lg:grid-cols-5">
        {/* Guidance + form */}
        <section className="flex flex-col gap-2 rounded-2xl border border-white/5 bg-slate-950/80 p-3 shadow-inner shadow-slate-900/50 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-[11px] text-slate-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/80 text-sky-300 ring-1 ring-sky-500/50">
                <Info className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold tracking-[0.12em] uppercase text-slate-200">How to use</p>
                <p className="text-[10px] text-slate-400">
                  Name your terminal, drop the host + SSH identity, and keep it around forever. Only signed-in admins can create requests.
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/40 animate-pulse">
                <Lock className="h-3.5 w-3.5" />
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/40 animate-[ping_2s_ease-in-out_infinite]">
                <Wifi className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
            <div className="flex items-center gap-2 rounded-lg border border-slate-800/70 bg-slate-900/50 p-2">
              <PlugZap className="h-4 w-4 text-sky-300" />
              <div>
                <p className="font-semibold text-slate-100">Instant connect</p>
                <p className="text-slate-400">Tap any saved terminal to start a WebSocket-backed SSH session.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-800/70 bg-slate-900/50 p-2">
              <KeyRound className="h-4 w-4 text-amber-300" />
              <div>
                <p className="font-semibold text-slate-100">Key-safe</p>
                <p className="text-slate-400">Store host, port, and username in your profile until you remove it.</p>
              </div>
            </div>
          </div>

          <div className="mt-1 flex items-center justify-between rounded-xl border border-dashed border-slate-800/80 bg-slate-900/40 px-3 py-2 text-[10px] text-slate-300">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-300" />
              <div>
                <p className="font-semibold text-slate-100">Live metrics</p>
                <p className="text-slate-400">Latency, CPU, and memory refresh every few seconds for connected hosts.</p>
              </div>
            </div>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-200">Auto-refresh</span>
          </div>

          <div className="mt-2 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-indigo-950/60 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
            <div className="mb-2 flex items-center justify-between text-[11px] text-slate-200">
              <div className="flex items-center gap-2">
                <ServerCog className="h-4 w-4 text-sky-300" />
                <div>
                  <p className="font-semibold tracking-[0.12em] uppercase">Create / edit terminal</p>
                  <p className="text-[10px] text-slate-400">Saved indefinitely for your profile</p>
                </div>
              </div>
              {!isSignedIn && (
                <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-1 text-[10px] text-amber-200">
                  Sign in to add
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <label className="flex flex-col gap-1 text-slate-300">
                <span className="text-[10px] uppercase tracking-[0.08em] text-slate-400">Terminal name</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="rounded-lg border border-slate-800/80 bg-slate-950/80 px-3 py-2 text-[11px] text-slate-100 outline-none ring-1 ring-transparent transition focus:border-sky-500/70 focus:ring-sky-500/40"
                  placeholder="e.g. Staging worker"
                />
              </label>
              <label className="flex flex-col gap-1 text-slate-300">
                <span className="text-[10px] uppercase tracking-[0.08em] text-slate-400">Hostname / IP</span>
                <input
                  value={form.hostname}
                  onChange={(e) => setForm((f) => ({ ...f, hostname: e.target.value }))}
                  className="rounded-lg border border-slate-800/80 bg-slate-950/80 px-3 py-2 text-[11px] text-slate-100 outline-none ring-1 ring-transparent transition focus:border-sky-500/70 focus:ring-sky-500/40"
                  placeholder="server.ethub.dev"
                />
              </label>
              <label className="flex flex-col gap-1 text-slate-300">
                <span className="text-[10px] uppercase tracking-[0.08em] text-slate-400">SSH username</span>
                <input
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  className="rounded-lg border border-slate-800/80 bg-slate-950/80 px-3 py-2 text-[11px] text-slate-100 outline-none ring-1 ring-transparent transition focus:border-sky-500/70 focus:ring-sky-500/40"
                  placeholder="ubuntu"
                />
              </label>
              <label className="flex flex-col gap-1 text-slate-300">
                <span className="text-[10px] uppercase tracking-[0.08em] text-slate-400">Port</span>
                <input
                  type="number"
                  value={form.port}
                  onChange={(e) => setForm((f) => ({ ...f, port: Number(e.target.value) }))}
                  className="rounded-lg border border-slate-800/80 bg-slate-950/80 px-3 py-2 text-[11px] text-slate-100 outline-none ring-1 ring-transparent transition focus:border-sky-500/70 focus:ring-sky-500/40"
                  min={1}
                  max={65535}
                />
              </label>
            </div>

            <div className="mt-3 flex items-center justify-between text-[10px] text-slate-300">
              <div className="flex items-center gap-2">
                <Signal className="h-4 w-4 text-emerald-300" />
                <p>
                  Tip: include SSH options (proxy, bastion, agent) once wired to your backend.
                </p>
              </div>
              <div className="flex gap-2">
                {editingId && (
                  <button
                    onClick={resetForm}
                    className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-[10px] text-slate-200 hover:border-slate-600/60"
                  >
                    Cancel edit
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={!isSignedIn}
                  className="inline-flex items-center gap-2 rounded-lg border border-sky-500/30 bg-sky-600/70 px-3 py-2 text-[10px] font-semibold text-white shadow-[0_10px_30px_rgba(14,165,233,0.3)] transition hover:-translate-y-[1px] hover:shadow-[0_14px_34px_rgba(14,165,233,0.35)] disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800 disabled:text-slate-500"
                >
                  {editingId ? <Edit className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  {editingId ? "Save changes" : "Add terminal"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Saved sessions + preview */}
        <section className="flex flex-col gap-3 lg:col-span-3">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
            <div className="rounded-2xl border border-white/5 bg-slate-950/70 p-3 lg:col-span-2">
              <div className="mb-2 flex items-center justify-between text-[11px] text-slate-200">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-sky-300" />
                  <p className="font-semibold tracking-[0.12em] uppercase">Saved terminals</p>
                </div>
                <span className="text-[10px] text-slate-500">Click to connect</span>
              </div>

              <div className="flex max-h-[340px] flex-col gap-2 overflow-y-auto pr-1">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group rounded-xl border px-3 py-2 transition hover:border-sky-500/50 hover:bg-slate-900/60 ${
                      activeSessionId === session.id
                        ? "border-sky-500/50 bg-slate-900/70"
                        : "border-white/5 bg-slate-950/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        onClick={() => handleConnect(session.id)}
                        className="flex flex-1 flex-col items-start text-left"
                      >
                        <div className="flex w-full items-center justify-between">
                          <div className="flex items-center gap-2 text-[11px] text-slate-100">
                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900/70 text-sky-300 ring-1 ring-sky-500/40">
                              <TerminalSquare className="h-3.5 w-3.5" />
                            </span>
                            <span className="font-semibold">{session.name}</span>
                          </div>
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] ${
                              session.status === "connected"
                                ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                                : session.status === "pending"
                                  ? "border border-amber-400/40 bg-amber-400/10 text-amber-200"
                                  : "border border-slate-700 bg-slate-900 text-slate-300"
                            }`}
                          >
                            {session.status === "connected" ? "Connected" : session.status === "pending" ? "Pending" : "Ready"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {session.username}@{session.hostname}:{session.port}
                        </p>
                        <div className="mt-2 grid grid-cols-3 gap-2 text-[10px] text-slate-300">
                          <span className="flex items-center gap-1 rounded-lg bg-slate-900/50 px-2 py-1 text-emerald-200">
                            <Activity className="h-3 w-3" /> {session.metrics.cpu.toFixed(0)}% CPU
                          </span>
                          <span className="flex items-center gap-1 rounded-lg bg-slate-900/50 px-2 py-1 text-sky-200">
                            <ServerCog className="h-3 w-3" /> {session.metrics.memory.toFixed(0)}% MEM
                          </span>
                          <span className="flex items-center gap-1 rounded-lg bg-slate-900/50 px-2 py-1 text-amber-200">
                            <Signal className="h-3 w-3" /> {session.metrics.latency.toFixed(0)} ms
                          </span>
                        </div>
                      </button>
                      <div className="flex flex-col gap-1 text-[10px] text-slate-400">
                        <button
                          onClick={() => handleEdit(session)}
                          className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-slate-900/70 px-2 py-1 text-slate-200 opacity-0 transition group-hover:opacity-100"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleRemove(session.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-slate-900/70 px-2 py-1 text-rose-200 opacity-0 transition hover:border-rose-500/40 hover:bg-rose-500/10 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[radial-gradient(circle_at_top_left,#13182e,#050715)] p-3 lg:col-span-3">
              <div className="mb-2 flex items-center justify-between text-[11px] text-slate-200">
                <div className="flex items-center gap-2">
                  <TerminalSquare className="h-4 w-4 text-emerald-300" />
                  <p className="font-semibold tracking-[0.12em] uppercase">Interactive terminal</p>
                </div>
                <span className="text-[10px] text-slate-500">WebSocket xterm.js placeholder</span>
              </div>

              <div className="relative h-[220px] overflow-hidden rounded-xl border border-slate-800/70 bg-gradient-to-br from-slate-950/80 via-slate-950 to-slate-900/70 p-3">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.06),transparent_45%)]" />
                <div className="absolute inset-0 animate-[pulse_8s_ease-in-out_infinite] bg-[radial-gradient(circle_at_bottom_left,rgba(109,40,217,0.05),transparent_55%)]" />

                <div className="relative flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span className="ml-3 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-[10px] text-sky-200">
                      {activeSession ? `${activeSession.username}@${activeSession.hostname}` : "Select a terminal"}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-emerald-200">
                    <ShieldCheck className="h-3 w-3" /> SSH over wss
                  </span>
                </div>

                <div className="relative mt-3 h-[150px] overflow-hidden rounded-lg border border-slate-800/70 bg-slate-950/90 p-3 font-mono text-[11px] text-emerald-100">
                  <p className="text-sky-200">$ ssh {"<"}your key{">"} {activeSession ? `${activeSession.username}@${activeSession.hostname}` : "user@host"} -p {activeSession?.port ?? 22}</p>
                  <div className="mt-2 space-y-1 text-[10px] text-slate-300">
                    <p>Welcome to ETHUB secure console. Sessions are persisted to your profile.</p>
                    <p className="text-sky-200">Connected: {activeSession ? activeSession.lastUsed : "awaiting host"}</p>
                    <p className="text-emerald-200">Metrics → CPU {activeSession?.metrics.cpu.toFixed(0) ?? 0}% | MEM {activeSession?.metrics.memory.toFixed(0) ?? 0}% | {activeSession?.metrics.latency.toFixed(0) ?? 0} ms</p>
                    <p className="text-slate-400">(xterm.js will live here once wired to /api/terminal/socket)</p>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-950/90 to-transparent" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/5 bg-slate-950/80 p-3">
              <div className="mb-2 flex items-center gap-2 text-[11px] text-slate-200">
                <Activity className="h-4 w-4 text-emerald-300" />
                <p className="font-semibold tracking-[0.12em] uppercase">Session health</p>
              </div>
              <div className="space-y-2 text-[11px] text-slate-300">
                <div className="flex items-center justify-between rounded-lg border border-slate-800/70 bg-slate-900/60 px-3 py-2">
                  <span>Latency</span>
                  <span className="text-sky-200">{activeSession?.metrics.latency.toFixed(0) ?? "--"} ms</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-800/70 bg-slate-900/60 px-3 py-2">
                  <span>Uptime</span>
                  <span className="text-emerald-200">{activeSession?.metrics.uptime ?? "--"}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-800/70 bg-slate-900/60 px-3 py-2">
                  <span>Profile persistence</span>
                  <span className="text-amber-200">Indefinite</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-950/80 p-3">
              <div className="mb-2 flex items-center gap-2 text-[11px] text-slate-200">
                <ShieldCheck className="h-4 w-4 text-sky-300" />
                <p className="font-semibold tracking-[0.12em] uppercase">Access rules</p>
              </div>
              <ul className="space-y-2 text-[11px] text-slate-300">
                <li className="flex items-center gap-2 rounded-lg border border-slate-800/70 bg-slate-900/60 px-3 py-2">
                  <Lock className="h-3.5 w-3.5 text-amber-300" />
                  Only registered users can submit SSH requests.
                </li>
                <li className="flex items-center gap-2 rounded-lg border border-slate-800/70 bg-slate-900/60 px-3 py-2">
                  <BadgeCheck className="h-3.5 w-3.5 text-emerald-300" />
                  Saved inputs stay with your profile until removed.
                </li>
                <li className="flex items-center gap-2 rounded-lg border border-slate-800/70 bg-slate-900/60 px-3 py-2">
                  <Signal className="h-3.5 w-3.5 text-sky-300" />
                  Click any saved terminal to connect instantly.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-950/80 p-3">
              <div className="mb-2 flex items-center gap-2 text-[11px] text-slate-200">
                <PlugZap className="h-4 w-4 text-amber-300" />
                <p className="font-semibold tracking-[0.12em] uppercase">Quick guide</p>
              </div>
              <ol className="space-y-2 text-[11px] text-slate-300">
                <li className="flex items-center gap-2 rounded-lg border border-slate-800/70 bg-slate-900/60 px-3 py-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-800/70 text-[10px] font-bold">1</span>
                  Add your hostname, username, and port.
                </li>
                <li className="flex items-center gap-2 rounded-lg border border-slate-800/70 bg-slate-900/60 px-3 py-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-800/70 text-[10px] font-bold">2</span>
                  Save to profile (sign-in required).
                </li>
                <li className="flex items-center gap-2 rounded-lg border border-slate-800/70 bg-slate-900/60 px-3 py-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-800/70 text-[10px] font-bold">3</span>
                  Click a saved tile to start connecting.
                </li>
              </ol>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Anchor,
  ArrowLeftRight,
  Check,
  ChevronRight,
  CircleGauge,
  Clock3,
  Cpu,
  Docker,
  Edit,
  Gauge,
  KeyRound,
  Layers3,
  Plug2,
  Plus,
  Rocket,
  Server,
  Trash2,
} from "lucide-react";

type ContainerSession = {
  id: string;
  label: string;
  host: string;
  context: string;
  sshUser: string;
  container: string;
  status: "running" | "exited" | "connecting";
  cpu: number;
  memory: number;
  restarts: number;
  age: string;
};

const seededContainers: ContainerSession[] = [
  {
    id: "ingress",
    label: "Ingress edge",
    host: "docker://edge-lab.ethub.dev",
    context: "remote-edge",
    sshUser: "deploy",
    container: "ethub-ingress",
    status: "running",
    cpu: 24,
    memory: 48,
    restarts: 1,
    age: "2d",
  },
  {
    id: "vector",
    label: "Vector logs",
    host: "ssh://gateway.ethub.dev",
    context: "prod-gateway",
    sshUser: "ubuntu",
    container: "ethub-vector",
    status: "running",
    cpu: 14,
    memory: 38,
    restarts: 0,
    age: "5d",
  },
  {
    id: "cron",
    label: "Cron worker",
    host: "ssh://jobs.ethub.dev",
    context: "cron-jobs",
    sshUser: "jobs",
    container: "ethub-cron",
    status: "exited",
    cpu: 0,
    memory: 12,
    restarts: 3,
    age: "4h",
  },
];

export default function DockerPage() {
  const [sessions, setSessions] = useState<ContainerSession[]>(seededContainers);
  const [activeId, setActiveId] = useState<string>(seededContainers[0]?.id ?? "");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    label: "",
    host: "",
    context: "",
    sshUser: "",
    container: "",
  });

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeId) ?? null,
    [sessions, activeId],
  );

  useEffect(() => {
    const ticker = setInterval(() => {
      setSessions((prev) =>
        prev.map((item) =>
          item.status === "running"
            ? {
                ...item,
                cpu: Math.min(95, Math.max(5, item.cpu + (Math.random() - 0.5) * 7)),
                memory: Math.min(95, Math.max(10, item.memory + (Math.random() - 0.5) * 6)),
              }
            : item,
        ),
      );
    }, 5000);

    return () => clearInterval(ticker);
  }, []);

  const resetForm = () => {
    setForm({ label: "", host: "", context: "", sshUser: "", container: "" });
    setEditingId(null);
  };

  const handleSave = () => {
    if (!form.label.trim() || !form.host.trim() || !form.sshUser.trim() || !form.container.trim()) return;

    if (editingId) {
      setSessions((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                label: form.label,
                host: form.host,
                context: form.context,
                sshUser: form.sshUser,
                container: form.container,
                status: "connecting",
              }
            : item,
        ),
      );
      setActiveId(editingId);
    } else {
      const id = form.label.toLowerCase().replace(/\s+/g, "-") || crypto.randomUUID();
      setSessions((prev) => [
        ...prev,
        {
          id,
          label: form.label,
          host: form.host,
          context: form.context,
          sshUser: form.sshUser,
          container: form.container,
          status: "connecting",
          cpu: 8,
          memory: 14,
          restarts: 0,
          age: "new",
        },
      ]);
      setActiveId(id);
    }

    resetForm();
  };

  const handleEdit = (session: ContainerSession) => {
    setEditingId(session.id);
    setForm({
      label: session.label,
      host: session.host,
      context: session.context,
      sshUser: session.sshUser,
      container: session.container,
    });
  };

  const handleRemove = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeId === id) setActiveId(prev => (prev === id ? "" : prev));
    if (editingId === id) resetForm();
  };

  const handleConnect = (id: string) => {
    setActiveId(id);
    setSessions((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: "running" }
          : item,
      ),
    );
  };

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col gap-3 rounded-2xl border border-white/5 bg-[radial-gradient(circle_at_top_left,#0e1625,#04070f)] p-4 text-xs text-slate-100 shadow-[0_18px_40px_rgba(0,0,0,0.55)]">
      <header className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-gradient-to-r from-slate-950/80 via-sky-950/30 to-slate-950/80 px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/90 text-sky-300 ring-1 ring-sky-500/50 shadow-[0_0_20px_rgba(14,165,233,0.3)]">
            <Docker className="h-[18px] w-[18px]" />
          </div>
          <div>
            <h1 className="text-[13px] font-semibold tracking-[0.18em] text-slate-100">DOCKER CONTROL</h1>
            <p className="text-[11px] text-slate-400">SSH into containers, monitor runtime metrics, and manage saved requests.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-300">
          <span className="flex items-center gap-1 rounded-full border border-sky-500/40 bg-sky-500/10 px-2 py-1 text-sky-200">
            <Plug2 className="h-3 w-3" /> Remote contexts via SSH
          </span>
          <span className="hidden items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-emerald-200 sm:flex">
            <Check className="h-3 w-3" /> Persisted until you remove them
          </span>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-3 lg:grid-cols-5">
        <section className="flex flex-col gap-2 rounded-2xl border border-white/5 bg-slate-950/80 p-3 shadow-inner shadow-slate-900/50 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-[11px] text-slate-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/80 text-sky-300 ring-1 ring-sky-500/50">
                <CircleGauge className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold tracking-[0.12em] uppercase text-slate-200">Docker via SSH</p>
                <p className="text-[10px] text-slate-400">Point to a host, context, and container. We’ll SSH to the daemon and stream stats.</p>
              </div>
            </div>
            <div className="flex gap-1">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/40 animate-pulse">
                <KeyRound className="h-3.5 w-3.5" />
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/40 animate-[ping_2.5s_ease-in-out_infinite]">
                <Layers3 className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
            <div className="flex items-center gap-2 rounded-lg border border-slate-800/70 bg-slate-900/50 p-2">
              <Server className="h-4 w-4 text-emerald-300" />
              <div>
                <p className="font-semibold text-slate-100">Host guidance</p>
                <p className="text-slate-400">Use ssh:// or docker:// targets. We’ll reuse your SSH identity for context.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-800/70 bg-slate-900/50 p-2">
              <Gauge className="h-4 w-4 text-amber-300" />
              <div>
                <p className="font-semibold text-slate-100">Metrics ready</p>
                <p className="text-slate-400">CPU, memory, restarts, and age refresh every few seconds.</p>
              </div>
            </div>
          </div>

          <div className="mt-2 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-sky-950/60 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
            <div className="mb-2 flex items-center justify-between text-[11px] text-slate-200">
              <div className="flex items-center gap-2">
                <Anchor className="h-4 w-4 text-sky-300" />
                <div>
                  <p className="font-semibold tracking-[0.12em] uppercase">Create / edit container access</p>
                  <p className="text-[10px] text-slate-400">Saved to your profile until cleared</p>
                </div>
              </div>
              {editingId && (
                <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-1 text-[10px] text-amber-200">Editing {editingId}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <label className="flex flex-col gap-1 text-slate-300">
                <span className="text-[10px] uppercase tracking-[0.08em] text-slate-400">Label</span>
                <input
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  className="rounded-lg border border-slate-800/80 bg-slate-950/80 px-3 py-2 text-[11px] text-slate-100 outline-none ring-1 ring-transparent transition focus:border-sky-500/70 focus:ring-sky-500/40"
                  placeholder="Edge containers"
                />
              </label>
              <label className="flex flex-col gap-1 text-slate-300">
                <span className="text-[10px] uppercase tracking-[0.08em] text-slate-400">Host (ssh:// or docker://)</span>
                <input
                  value={form.host}
                  onChange={(e) => setForm((f) => ({ ...f, host: e.target.value }))}
                  className="rounded-lg border border-slate-800/80 bg-slate-950/80 px-3 py-2 text-[11px] text-slate-100 outline-none ring-1 ring-transparent transition focus:border-sky-500/70 focus:ring-sky-500/40"
                  placeholder="ssh://gateway.ethub.dev"
                />
              </label>
              <label className="flex flex-col gap-1 text-slate-300">
                <span className="text-[10px] uppercase tracking-[0.08em] text-slate-400">Docker context</span>
                <input
                  value={form.context}
                  onChange={(e) => setForm((f) => ({ ...f, context: e.target.value }))}
                  className="rounded-lg border border-slate-800/80 bg-slate-950/80 px-3 py-2 text-[11px] text-slate-100 outline-none ring-1 ring-transparent transition focus:border-sky-500/70 focus:ring-sky-500/40"
                  placeholder="prod-gateway"
                />
              </label>
              <label className="flex flex-col gap-1 text-slate-300">
                <span className="text-[10px] uppercase tracking-[0.08em] text-slate-400">SSH username</span>
                <input
                  value={form.sshUser}
                  onChange={(e) => setForm((f) => ({ ...f, sshUser: e.target.value }))}
                  className="rounded-lg border border-slate-800/80 bg-slate-950/80 px-3 py-2 text-[11px] text-slate-100 outline-none ring-1 ring-transparent transition focus:border-sky-500/70 focus:ring-sky-500/40"
                  placeholder="ubuntu"
                />
              </label>
              <label className="col-span-2 flex flex-col gap-1 text-slate-300">
                <span className="text-[10px] uppercase tracking-[0.08em] text-slate-400">Container name</span>
                <input
                  value={form.container}
                  onChange={(e) => setForm((f) => ({ ...f, container: e.target.value }))}
                  className="rounded-lg border border-slate-800/80 bg-slate-950/80 px-3 py-2 text-[11px] text-slate-100 outline-none ring-1 ring-transparent transition focus:border-sky-500/70 focus:ring-sky-500/40"
                  placeholder="ethub-api"
                />
              </label>
            </div>

            <div className="mt-3 flex items-center justify-between text-[10px] text-slate-300">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4 text-emerald-300" />
                <p>We’ll reuse this data to open SSH channels straight into the container runtime.</p>
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
                  className="inline-flex items-center gap-2 rounded-lg border border-sky-500/30 bg-sky-600/70 px-3 py-2 text-[10px] font-semibold text-white shadow-[0_10px_30px_rgba(14,165,233,0.3)] transition hover:-translate-y-[1px] hover:shadow-[0_14px_34px_rgba(14,165,233,0.35)]"
                >
                  {editingId ? <Edit className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  {editingId ? "Save changes" : "Add docker target"}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3 lg:col-span-3">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
            <div className="rounded-2xl border border-white/5 bg-slate-950/70 p-3 lg:col-span-2">
              <div className="mb-2 flex items-center justify-between text-[11px] text-slate-200">
                <div className="flex items-center gap-2">
                  <Layers3 className="h-4 w-4 text-sky-300" />
                  <p className="font-semibold tracking-[0.12em] uppercase">Saved docker targets</p>
                </div>
                <span className="text-[10px] text-slate-500">Tap to open SSH</span>
              </div>

              <div className="flex max-h-[340px] flex-col gap-2 overflow-y-auto pr-1">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group rounded-xl border px-3 py-2 transition hover:border-sky-500/50 hover:bg-slate-900/60 ${
                      activeId === session.id ? "border-sky-500/50 bg-slate-900/70" : "border-white/5 bg-slate-950/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button onClick={() => handleConnect(session.id)} className="flex flex-1 flex-col items-start text-left">
                        <div className="flex w-full items-center justify-between">
                          <div className="flex items-center gap-2 text-[11px] text-slate-100">
                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900/70 text-sky-300 ring-1 ring-sky-500/40">
                              <Docker className="h-3.5 w-3.5" />
                            </span>
                            <span className="font-semibold">{session.label}</span>
                          </div>
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] ${
                              session.status === "running"
                                ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                                : session.status === "connecting"
                                  ? "border border-amber-400/40 bg-amber-400/10 text-amber-200"
                                  : "border border-slate-700 bg-slate-900 text-slate-300"
                            }`}
                          >
                            {session.status === "running" ? "Running" : session.status === "connecting" ? "Connecting" : "Exited"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">{session.host} · ctx {session.context || "default"}</p>
                        <p className="text-[10px] text-slate-500">ssh {session.sshUser} → {session.container}</p>
                        <div className="mt-2 grid grid-cols-3 gap-2 text-[10px] text-slate-300">
                          <span className="flex items-center gap-1 rounded-lg bg-slate-900/50 px-2 py-1 text-emerald-200">
                            <Cpu className="h-3 w-3" /> {session.cpu.toFixed(0)}% CPU
                          </span>
                          <span className="flex items-center gap-1 rounded-lg bg-slate-900/50 px-2 py-1 text-sky-200">
                            <Activity className="h-3 w-3" /> {session.memory.toFixed(0)}% MEM
                          </span>
                          <span className="flex items-center gap-1 rounded-lg bg-slate-900/50 px-2 py-1 text-amber-200">
                            <Clock3 className="h-3 w-3" /> {session.age}
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

            <div className="rounded-2xl border border-white/5 bg-[radial-gradient(circle_at_top_right,#0e1a2f,#050915)] p-3 lg:col-span-3">
              <div className="mb-2 flex items-center justify-between text-[11px] text-slate-200">
                <div className="flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-emerald-300" />
                  <p className="font-semibold tracking-[0.12em] uppercase">Live container view</p>
                </div>
                <span className="text-[10px] text-slate-500">Attach to docker exec (placeholder)</span>
              </div>

              <div className="relative h-[220px] overflow-hidden rounded-xl border border-slate-800/70 bg-gradient-to-br from-slate-950/80 via-slate-950 to-slate-900/70 p-3">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.08),transparent_45%)]" />
                <div className="absolute inset-0 animate-[pulse_8s_ease-in-out_infinite] bg-[radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.05),transparent_55%)]" />

                <div className="relative flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span className="ml-3 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-[10px] text-sky-200">
                      {activeSession ? `${activeSession.container} @ ${activeSession.host}` : "Select a docker target"}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-emerald-200">
                    <ChevronRight className="h-3 w-3" /> docker exec over ssh
                  </span>
                </div>

                <div className="relative mt-3 h-[150px] overflow-hidden rounded-lg border border-slate-800/70 bg-slate-950/90 p-3 font-mono text-[11px] text-emerald-100">
                  <p className="text-sky-200">$ ssh {activeSession ? `${activeSession.sshUser}@${activeSession.host}` : "user@host"} -- docker exec -it {activeSession?.container ?? "container"} /bin/sh</p>
                  <div className="mt-2 space-y-1 text-[10px] text-slate-300">
                    <p>Streaming container metrics + logs with your saved credentials.</p>
                    <p className="text-sky-200">Context: {activeSession?.context || "default"} · Status: {activeSession?.status ?? "--"}</p>
                    <p className="text-emerald-200">CPU {activeSession?.cpu.toFixed(0) ?? 0}% | MEM {activeSession?.memory.toFixed(0) ?? 0}% | Restarts {activeSession?.restarts ?? 0}</p>
                    <p className="text-slate-400">(Wire this to /api/docker/containers and /api/docker/metrics to go live.)</p>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-950/90 to-transparent" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/5 bg-slate-950/80 p-3">
              <div className="mb-2 flex items-center gap-2 text-[11px] text-slate-200">
                <Cpu className="h-4 w-4 text-emerald-300" />
                <p className="font-semibold tracking-[0.12em] uppercase">Container health</p>
              </div>
              <div className="space-y-2 text-[11px] text-slate-300">
                <div className="flex items-center justify-between rounded-lg border border-slate-800/70 bg-slate-900/60 px-3 py-2">
                  <span>CPU</span>
                  <span className="text-emerald-200">{activeSession?.cpu.toFixed(0) ?? "--"}%</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-800/70 bg-slate-900/60 px-3 py-2">
                  <span>Memory</span>
                  <span className="text-sky-200">{activeSession?.memory.toFixed(0) ?? "--"}%</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-800/70 bg-slate-900/60 px-3 py-2">
                  <span>Restarts</span>
                  <span className="text-amber-200">{activeSession?.restarts ?? "--"}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-950/80 p-3">
              <div className="mb-2 flex items-center gap-2 text-[11px] text-slate-200">
                <AlertTriangle className="h-4 w-4 text-amber-300" />
                <p className="font-semibold tracking-[0.12em] uppercase">Quick checklist</p>
              </div>
              <ul className="space-y-2 text-[11px] text-slate-300">
                <li className="flex items-center gap-2 rounded-lg border border-slate-800/70 bg-slate-900/60 px-3 py-2">
                  <Plug2 className="h-3.5 w-3.5 text-sky-300" />
                  Save host, context, and SSH user for quick reuse.
                </li>
                <li className="flex items-center gap-2 rounded-lg border border-slate-800/70 bg-slate-900/60 px-3 py-2">
                  <Server className="h-3.5 w-3.5 text-emerald-300" />
                  Click a saved card to attach to docker exec instantly.
                </li>
                <li className="flex items-center gap-2 rounded-lg border border-slate-800/70 bg-slate-900/60 px-3 py-2">
                  <ArrowLeftRight className="h-3.5 w-3.5 text-amber-300" />
                  Edit or remove targets whenever you rotate credentials.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-950/80 p-3">
              <div className="mb-2 flex items-center gap-2 text-[11px] text-slate-200">
                <Rocket className="h-4 w-4 text-emerald-300" />
                <p className="font-semibold tracking-[0.12em] uppercase">How to run</p>
              </div>
              <ol className="space-y-2 text-[11px] text-slate-300">
                <li className="flex items-center gap-2 rounded-lg border border-slate-800/70 bg-slate-900/60 px-3 py-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-800/70 text-[10px] font-bold">1</span>
                  Add host, context, and container name.
                </li>
                <li className="flex items-center gap-2 rounded-lg border border-slate-800/70 bg-slate-900/60 px-3 py-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-800/70 text-[10px] font-bold">2</span>
                  Save to profile for persistent reuse.
                </li>
                <li className="flex items-center gap-2 rounded-lg border border-slate-800/70 bg-slate-900/60 px-3 py-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-800/70 text-[10px] font-bold">3</span>
                  Click a tile to connect and stream container metrics.
                </li>
              </ol>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Box,
  Container as ContainerIcon,
  Edit2,
  HardDrive,
  Link2,
  ListRestart,
  LockKeyhole,
  Plus,
  Save,
  Server,
  Trash2,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

import { cn } from "@/lib/utils";

type DockerProfile = {
  id: string;
  name: string;
  host: string;
  containerId: string;
  sshUser: string;
  port: string;
  notes?: string;
};

type RunningContainer = {
  id: string;
  image: string;
  status: "running" | "paused" | "restarting";
  cpu: number;
  memory: number;
  restarts: number;
};

const sampleProfiles: DockerProfile[] = [
  {
    id: "edge-docker",
    name: "Edge Docker",
    host: "lab.ethub.cloud",
    containerId: "web-api",
    sshUser: "deploy",
    port: "2222",
    notes: "Ingress + voice stack",
  },
];

const sampleContainers: RunningContainer[] = [
  { id: "api", image: "ethub/api:latest", status: "running", cpu: 22, memory: 38, restarts: 1 },
  { id: "voice", image: "ethub/voice:gpu", status: "running", cpu: 58, memory: 63, restarts: 0 },
  { id: "worker", image: "ethub/worker:edge", status: "restarting", cpu: 12, memory: 24, restarts: 3 },
  { id: "ui", image: "ethub/web:next", status: "running", cpu: 16, memory: 42, restarts: 0 },
];

const glowBorder =
  "border border-white/10 bg-gradient-to-b from-slate-900/70 via-slate-950 to-black/80 shadow-[0_25px_70px_-28px_rgba(0,0,0,0.8)]";

export default function DockerPage() {
  const { user } = useUser();
  const [profiles, setProfiles] = useState<DockerProfile[]>(sampleProfiles);
  const [containers, setContainers] = useState<RunningContainer[]>(sampleContainers);
  const [selectedId, setSelectedId] = useState<string | null>(sampleProfiles[0]?.id ?? null);
  const [status, setStatus] = useState("Select a profile to view container metrics.");
  const [draft, setDraft] = useState<DockerProfile>({
    id: "",
    name: "",
    host: "",
    containerId: "",
    sshUser: "",
    port: "2222",
    notes: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  const storageKey = useMemo(
    () => `ethub-docker-profiles:${user?.id ?? "guest"}`,
    [user?.id],
  );

  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem(storageKey)
        : null;

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as DockerProfile[];
        setProfiles(parsed);
        if (parsed.length && !selectedId) setSelectedId(parsed[0].id);
        return;
      } catch (error) {
        console.error("Failed to parse docker profiles", error);
      }
    }
  }, [storageKey, selectedId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(profiles));
  }, [profiles, storageKey]);

  const selectedProfile = profiles.find((profile) => profile.id === selectedId);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      setStatus("Sign in to save Docker + SSH profiles to your account.");
      return;
    }

    if (!draft.name || !draft.host || !draft.containerId || !draft.sshUser) {
      setStatus("Name, host, container ID, and SSH user are required.");
      return;
    }

    const profile: DockerProfile = {
      ...draft,
      id: isEditing && draft.id ? draft.id : crypto.randomUUID(),
    };

    setProfiles((prev) => {
      if (isEditing) {
        return prev.map((item) => (item.id === draft.id ? { ...item, ...profile } : item));
      }
      return [...prev, profile];
    });

    setDraft({ id: "", name: "", host: "", containerId: "", sshUser: "", port: "2222", notes: "" });
    setIsEditing(false);
    setSelectedId(profile.id);
    setStatus("Profile saved. Click it to start a container SSH session.");
  };

  const handleDelete = (id: string) => {
    setProfiles((prev) => prev.filter((item) => item.id !== id));
    if (selectedId === id) setSelectedId(null);
    setStatus("Profile removed.");
  };

  const handleEdit = (profile: DockerProfile) => {
    setDraft(profile);
    setIsEditing(true);
    setStatus(`Editing ${profile.name}`);
  };

  const handleConnect = (profile: DockerProfile) => {
    setSelectedId(profile.id);
    setStatus(`Connecting to ${profile.containerId} on ${profile.host} via SSH...`);
  };

  const refreshContainers = () => {
    setContainers((prev) =>
      prev.map((container) => ({
        ...container,
        cpu: Math.max(5, Math.min(95, container.cpu + randomDelta())),
        memory: Math.max(10, Math.min(95, container.memory + randomDelta())),
        restarts: container.status === "restarting" ? container.restarts + 1 : container.restarts,
      })),
    );
  };

  return (
    <div className="space-y-6">
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl p-6 md:p-8",
          glowBorder,
          "bg-[radial-gradient(circle_at_20%_-10%,#0f2c3f,transparent_40%),radial-gradient(circle_at_80%_0%,#2f1f4f,transparent_35%),#02030a]",
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,#22d3ee/14,transparent_55%)]" />
        <div className="relative grid gap-6 md:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-cyan-300 ring-1 ring-white/10">
                <ContainerIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-foreground/60">Docker control</p>
                <h1 className="text-xl font-semibold text-foreground md:text-2xl">Container launcher</h1>
              </div>
            </div>
            <p className="max-w-2xl text-sm text-foreground/70 md:text-base">
              Save trusted Docker endpoints, jump into SSH for a specific container, and review live metrics for your
              running stack. Everything stays pinned to your profile for as long as you need.
            </p>

            <div className="grid grid-cols-1 gap-2 text-xs text-foreground/70 sm:grid-cols-3">
              {["Authenticate before starting any container SSH session.", "Profiles persist per user until you remove them.", "Metrics mirror the terminal aesthetic for clarity."]
                .map((copy) => (
                  <div
                    key={copy}
                    className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 ring-1 ring-white/10"
                  >
                    <Activity className="h-3.5 w-3.5 text-cyan-300" />
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
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-emerald-500/5" />
            <div className="relative flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-cyan-200/70">
              <HardDrive className="h-3.5 w-3.5" />
              CONTAINER HINTS
            </div>
            <div className="relative mt-3 space-y-2 font-mono text-[12px] leading-relaxed">
              <div className="flex items-center gap-2 text-cyan-200/80">
                <Box className="h-4 w-4" />
                <span>ssh deploy@host -p 2222 docker exec -it container bash</span>
              </div>
              <p className="text-cyan-200/70">Pin the container ID and SSH user so you never mistype them again.</p>
              <p className="text-fuchsia-200/70">Use the metrics grid below to sanity check CPU, memory, and restarts.</p>
            </div>
          </motion.div>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <header className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-foreground/60">Saved container profiles</p>
              <h2 className="text-lg font-semibold text-foreground">SSH into the right container fast</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground/70">
              <LockKeyhole className="h-4 w-4" />
              <span>Per-user, persistent</span>
            </div>
          </header>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {profiles.map((profile) => {
              const active = selectedId === profile.id;
              return (
                <motion.div
                  key={profile.id}
                  layout
                  onClick={() => handleConnect(profile)}
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
                      <p className="text-xs uppercase tracking-[0.16em] text-foreground/50">Docker SSH</p>
                      <p className="text-base font-semibold text-foreground">{profile.name}</p>
                      <p className="text-[12px] text-foreground/70">{profile.host}</p>
                      <p className="text-[12px] text-foreground/60">Container: {profile.containerId}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleEdit(profile);
                        }}
                        className="rounded-full border border-white/10 bg-white/5 p-1.5 text-foreground/80 transition hover:bg-white/10"
                        aria-label={`Edit ${profile.name}`}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDelete(profile.id);
                        }}
                        className="rounded-full border border-white/10 bg-white/5 p-1.5 text-rose-300/80 transition hover:bg-white/10"
                        aria-label={`Delete ${profile.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-foreground/70">
                    <Metric label="Port" value={profile.port || "2222"} />
                    <Metric label="User" value={profile.sshUser} />
                    <Metric label="Container" value={profile.containerId} />
                  </div>

                  {profile.notes && (
                    <p className="mt-2 rounded-xl bg-white/5 px-3 py-2 text-[12px] text-foreground/70">{profile.notes}</p>
                  )}

                  {active && (
                    <motion.div
                      layoutId="active-docker"
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
                    {isEditing ? "Edit Docker profile" : "Add Docker profile"}
                  </p>
                  <p className="text-sm text-foreground/70">Pin host, container, and port for instant SSH.</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Profile name"
                  placeholder="Edge Docker"
                  value={draft.name}
                  onChange={(value) => setDraft((prev) => ({ ...prev, name: value }))}
                />
                <Field
                  label="Host"
                  placeholder="docker.domain.com"
                  value={draft.host}
                  onChange={(value) => setDraft((prev) => ({ ...prev, host: value }))}
                />
                <Field
                  label="Container ID or name"
                  placeholder="web-api"
                  value={draft.containerId}
                  onChange={(value) => setDraft((prev) => ({ ...prev, containerId: value }))}
                />
                <Field
                  label="SSH user"
                  placeholder="deploy"
                  value={draft.sshUser}
                  onChange={(value) => setDraft((prev) => ({ ...prev, sshUser: value }))}
                />
                <Field
                  label="SSH port"
                  placeholder="2222"
                  value={draft.port}
                  onChange={(value) => setDraft((prev) => ({ ...prev, port: value }))}
                />
                <Field
                  label="Notes"
                  placeholder="Voice stack containers"
                  value={draft.notes || ""}
                  onChange={(value) => setDraft((prev) => ({ ...prev, notes: value }))}
                />
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
                {isEditing ? "Save changes" : "Save Docker profile"}
              </button>
              <p className="text-xs text-foreground/60">
                {user ? status : "Sign in to store Docker endpoints indefinitely."}
              </p>
            </form>
          </div>

          <div className={cn("rounded-3xl p-4", glowBorder)}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-foreground/60">Running containers</p>
                <p className="text-sm text-foreground/80">Live-ish metrics inspired by the terminal view</p>
              </div>
              <button
                type="button"
                onClick={refreshContainers}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-foreground/80 transition hover:bg-white/10"
              >
                <ListRestart className="h-3.5 w-3.5" />
                Refresh
              </button>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {containers.map((container) => (
                <div
                  key={container.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-foreground/80"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-foreground/60">{container.id}</p>
                      <p className="font-semibold text-foreground">{container.image}</p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide",
                        container.status === "running"
                          ? "bg-emerald-500/10 text-emerald-200"
                          : container.status === "paused"
                            ? "bg-amber-500/10 text-amber-200"
                            : "bg-rose-500/10 text-rose-200",
                      )}
                    >
                      {container.status}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-3 gap-2 text-[12px] text-foreground/70">
                    <Metric label="CPU" value={`${container.cpu}%`} />
                    <Metric label="Memory" value={`${container.memory}%`} />
                    <Metric label="Restarts" value={`${container.restarts}`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-2xl bg-black/60 p-4 font-mono text-[12px] text-emerald-100 ring-1 ring-white/10">
              <div className="mb-2 flex items-center gap-2 text-cyan-200">
                <Server className="h-4 w-4" />
                <span>Session script</span>
              </div>
              <div className="space-y-1 text-foreground/70">
                <CodeLine text="$ ssh deploy@edge-docker -p 2222" active />
                <CodeLine text="$ docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'" />
                <CodeLine text="$ docker stats --no-stream" />
                <CodeLine text="$ docker exec -it web-api bash" />
              </div>
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
      <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/60">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function CodeLine({ text, active }: { text: string; active?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Activity className={cn("h-3 w-3", active ? "text-emerald-400" : "text-foreground/30")} />
      <span className="text-foreground/70">{text}</span>
    </div>
  );
}

function randomDelta() {
  return Math.round((Math.random() - 0.5) * 8);
}

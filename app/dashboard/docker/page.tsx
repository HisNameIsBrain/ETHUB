const dockerIdeas = [
  "Start and stop dev containers with resource badges for CPU, memory, and network usage.",
  "Expose Compose stacks as cards so you can launch databases or queues with a tap.",
  "Stream logs inline and let AI summarize errors for the video audience.",
  "Offer quick port-forward toggles for local previews while tethered or on Wi‑Fi.",
];

export default function DockerPage() {
  return (
    <div className="col-span-3 space-y-4 rounded-2xl border border-white/10 bg-slate-950/70 p-6 shadow-lg">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200">MobileCodex Docker</p>
        <h1 className="mt-1 text-2xl font-bold text-white">Containers without the clamshell</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-200">
          Describe how the Docker tile can manage services right from the Nord N20. Emphasize portability: you can reboot a container, inspect logs, or redeploy while walking between meetings.
        </p>
      </header>
      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-200">
        <h2 className="text-base font-semibold text-white">Demo-friendly capabilities</h2>
        <ul className="mt-2 space-y-2">
          {dockerIdeas.map((idea) => (
            <li key={idea} className="flex gap-2">
              <span className="text-indigo-300">•</span>
              <span>{idea}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

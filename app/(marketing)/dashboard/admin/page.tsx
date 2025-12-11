const controls = [
  "Organization overview with active sessions, storage usage, and device mix (mobile vs. desktop).",
  "Access rules that toggle MFA requirements, SSH key policies, and container resource limits for mobile users.",
  "Audit feed that highlights which actions were performed from phones—perfect for showcasing MobileCodex accountability.",
  "Billing and plan controls that emphasize the value of coding on lightweight hardware.",
];

export default function AdminPage() {
  return (
    <div className="col-span-3 space-y-4 rounded-2xl border border-white/10 bg-slate-950/70 p-6 shadow-lg">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200">MobileCodex Admin</p>
        <h1 className="mt-1 text-2xl font-bold text-white">Guide the platform vision</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-200">
          Use this page to narrate how ETHUB administrators can empower mobile engineers while keeping compliance and reliability in check. It rounds out the story that phones can be first-class coding devices.
        </p>
      </header>
      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-200">
        <h2 className="text-base font-semibold text-white">Controls to emphasize</h2>
        <ul className="mt-2 space-y-2">
          {controls.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-indigo-300">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

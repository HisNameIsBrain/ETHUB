const highlights = [
  "Biometric unlock before opening saved keys to keep remote sessions secure on mobile.",
  "Session recorder to capture the exact commands you demo for viewers.",
  "Latency indicator so you can narrate network quality while roaming.",
  "Preflight checks that confirm DNS, VPN, and firewall rules before connecting.",
];

export default function SSHPage() {
  return (
    <div className="col-span-3 space-y-4 rounded-2xl border border-white/10 bg-slate-950/70 p-6 shadow-lg">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200">MobileCodex SSH</p>
        <h1 className="mt-1 text-2xl font-bold text-white">Reliable remote access on a phone</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-200">
          Outline how ETHUB keeps SSH sessions smooth from a OnePlus Nord N20—no bulky hardware needed. Use this narrative in the video to prove production fixes are possible from a pocket device.
        </p>
      </header>
      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-200">
        <h2 className="text-base font-semibold text-white">What to demo</h2>
        <ul className="mt-2 space-y-2">
          {highlights.map((item) => (
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

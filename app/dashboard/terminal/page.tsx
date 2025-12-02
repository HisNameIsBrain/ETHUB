const tips = [
  "Generate SSH keys once and store them securely; sync public keys to servers so sessions from the phone are frictionless.",
  "Preload common aliases (yarn, pnpm, git) and use command history search to speed up thumb-typing.",
  "Pair the terminal card with AI prompts that explain logs or propose one-liner fixes before you rerun scripts.",
  "Use tmux or a split-pane view so long-running processes stay visible while you explore the file tree.",
];

export default function TerminalPage() {
  return (
    <div className="col-span-3 space-y-4 rounded-2xl border border-white/10 bg-slate-950/70 p-6 shadow-lg">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200">MobileCodex Terminal</p>
        <h1 className="mt-1 text-2xl font-bold text-white">Command-line control from your phone</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-200">
          This page describes how the terminal tile should feel: quick SSH, saved environments, and AI sidekick support so you can manage services, run tests, and deploy without opening a laptop.
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-200">
          <h2 className="text-base font-semibold text-white">Guided session flow</h2>
          <ul className="mt-2 space-y-2">
            <li>Launch with saved profiles for dev, staging, and production shells.</li>
            <li>Surface context chips (branch, path, container) above the prompt.</li>
            <li>Offer one-tap snippets for git status, npm scripts, and docker compose up.</li>
            <li>Auto-copy command outputs to share progress in the YouTube demo.</li>
          </ul>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-200">
          <h2 className="text-base font-semibold text-white">Tips for faster mobile typing</h2>
          <ul className="mt-2 space-y-2">
            {tips.map((tip) => (
              <li key={tip} className="flex gap-2">
                <span className="text-indigo-300">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

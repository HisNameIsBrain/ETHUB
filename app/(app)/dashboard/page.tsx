import { CheckCircle2, Lightbulb, Smartphone, Sparkles, Workflow } from "lucide-react";

const setupSteps = [
  "Unbox the OnePlus Nord N20 128GB and enable developer options so USB debugging and local testing are easy.",
  "Install the core apps: a code-friendly text editor (like VS Code Server via a PWA), a terminal (Termux or Blink Shell), a Git client, and a secure file manager with FTP/SFTP support.",
  "Sign in to your version control provider so repository access, pulls, and pushes work on mobile.",
  "Add your AI sidekick for quick prompts, code reviews, and research right beside the terminal.",
  "Enable a VPN or trusted Wi‑Fi for secure syncing when working in cafés, on transit, or while walking.",
];

const quickWorkflow = [
  "Clone or pull the repo in the terminal, then open the workspace in your editor tab.",
  "Use the AI panel to summarize tasks, generate snippets, or draft commits while you type with your thumbs.",
  "Run scripts in the terminal card; stream logs in a split view so you can bounce between commands and notes.",
  "Preview UI changes with a live-embed card; reload without leaving the dashboard.",
  "Ship: commit, push, and share from the same grid—no laptop bag required.",
];

const laptopFacts = [
  "The first clamshell laptop, the GRiD Compass (1982), flew on Space Shuttle missions because its magnesium case and folding design made it space-efficient.",
  "Early trackpads appeared in the 1990s PowerBooks, replacing trackballs and defining the modern portable pointing device.",
  "Ultrabooks pushed thin-and-light standards in the 2010s, spawning CNC aluminum shells and high-density batteries that set today’s aesthetic baseline.",
  "Manufacturers differentiate with 2-in-1 hinges, haptic trackpads, and ARM-based efficiency chips to balance battery life with performance.",
];

const phoneFacts = [
  "Modern mid-range phones like the Nord N20 pack octa-core CPUs and GPUs rivaling entry laptops from just a few years ago.",
  "5G and Wi‑Fi 6/6E radios let phones sustain repo pulls, container downloads, and CI monitoring on the go.",
  "USB-C plus DisplayPort support means a single cable can drive an external monitor while keeping the device charged during coding sessions.",
];

const binaryPrinciples = [
  "Binary encodes data using two states—0 and 1—making it resilient to noise and easy for digital circuits to distinguish voltage thresholds.",
  "Bits group into bytes (8 bits), which represent characters, colors, instructions, and everything rendered on-screen.",
  "Logic gates (AND, OR, NOT, XOR) combine bits into arithmetic and control flows; every language ultimately compiles to these operations.",
  "Binary’s universality lets hardware, firmware, and software agree on a single, minimal alphabet, enabling interoperability across devices.",
];

const binarySteps = [
  "Teach fundamentals early: booleans, truth tables, and how binary maps to text (ASCII/Unicode).",
  "Expose toggles in the UI that visualize how a high-level script becomes opcodes and bits when deployed.",
  "Standardize on portable tooling (WebAssembly, containers) that compiles to efficient binaries for any form factor.",
];

const mockupFeatures = [
  { title: "Search", detail: "Unified search across repos, docs, and commands with inline previews." },
  { title: "AI Copilot", detail: "Context-aware prompts for code generation, refactors, and video script drafting." },
  { title: "Terminal", detail: "Tabbable shell with SSH keys, environment presets, and log streaming." },
  { title: "Repositories", detail: "Git UI for branching, reviewing diffs, and committing from your phone." },
  { title: "FTP/SFTP", detail: "One-tap secure transfers to servers or edge devices with saved profiles." },
  { title: "Docker", detail: "Start, stop, and monitor containers with resource gauges and quick compose actions." },
  { title: "Live Preview", detail: "In-app iframe to reload frontends without leaving the dashboard." },
  { title: "Settings", detail: "Device-friendly toggles for themes, keyboard layouts, and performance caps." },
];

export default function DashboardPage() {
  return (
    <div className="col-span-3 grid gap-6">
      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-900/60 via-slate-900 to-black p-6 shadow-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200">MobileCodex Overview</p>
            <h1 className="mt-1 text-2xl font-bold text-white md:text-3xl">Build anywhere with ETHUB on your phone</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-200">
              This script powers a YouTube walkthrough showing how to code directly from a OnePlus Nord N20. We highlight the apps, setup, and the MobileCodex vision: search, AI, terminal, repositories, FTP, Docker, and settings inside one dashboard.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-indigo-100">
            <Smartphone className="h-4 w-4" />
            <span className="text-xs font-semibold">Ultra-portable workflow</span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 shadow-lg">
        <header className="flex items-center gap-2 text-indigo-100">
          <Workflow className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Step-by-step setup for the video</h2>
        </header>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white">Prepare the phone</h3>
            <ul className="space-y-2 text-sm text-slate-200">
              {setupSteps.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white">Quick mobile workflow</h3>
            <ol className="space-y-2 text-sm text-slate-200">
              {quickWorkflow.map((item, idx) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-[11px] font-semibold text-indigo-100">{idx + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-lg">
        <header className="flex items-center gap-2 text-indigo-100">
          <Sparkles className="h-5 w-5" />
          <h2 className="text-lg font-semibold">MobileCodex product mockup</h2>
        </header>
        <p className="mt-2 text-sm text-slate-200">
          Imagine one ETHUB app that merges search, AI, terminal access, repositories, FTP, Docker, and settings. Each tile below mirrors a dashboard card you can demo in the video.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {mockupFeatures.map(({ title, detail }) => (
            <div key={title} className="rounded-xl border border-white/10 bg-slate-950/70 p-3 text-sm text-slate-200">
              <h3 className="text-base font-semibold text-white">{title}</h3>
              <p className="mt-1 text-xs text-slate-300">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 shadow-lg">
        <header className="flex items-center gap-2 text-indigo-100">
          <Lightbulb className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Fun facts to narrate</h2>
        </header>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <h3 className="text-sm font-semibold text-white">How laptops evolved</h3>
            <ul className="mt-2 space-y-2 text-sm text-slate-200">
              {laptopFacts.map((fact) => (
                <li key={fact} className="flex gap-2">
                  <span className="text-indigo-300">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <h3 className="text-sm font-semibold text-white">Phone power unlocked</h3>
            <ul className="mt-2 space-y-2 text-sm text-slate-200">
              {phoneFacts.map((fact) => (
                <li key={fact} className="flex gap-2">
                  <span className="text-indigo-300">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-black p-6 shadow-lg">
        <header className="flex items-center gap-2 text-indigo-100">
          <Sparkles className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Binary: the universal language</h2>
        </header>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div className="space-y-2 text-sm text-slate-200">
            <h3 className="text-sm font-semibold text-white">Fundamentals</h3>
            <ul className="space-y-2">
              {binaryPrinciples.map((fact) => (
                <li key={fact} className="flex gap-2">
                  <span className="text-indigo-300">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2 text-sm text-slate-200">
            <h3 className="text-sm font-semibold text-white">Steps toward a binary-first future</h3>
            <ol className="space-y-2">
              {binarySteps.map((step, idx) => (
                <li key={step} className="flex gap-2">
                  <span className="text-indigo-300">{idx + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-2 text-xs text-slate-300">
              Pitch the idea that coding literacy—and even light binary literacy—turns everyday phone users into builders, architects, and technicians who can ship ideas without heavy hardware.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

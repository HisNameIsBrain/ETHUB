// app/dashboard/page.tsx

import { TerminalPanel } from "@/components/terminal-panel";   // adjust imports
import { WorkspaceBar } from "@/components/workspace-bar";
import { ServicesBar } from "@/components/services-bar";
import { BuildOpsBar } from "@/components/build-ops-bar";
import { PortalBar } from "@/components/portal-bar";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#050509] text-slate-50">
      {/* Top nav / header (if you have one already, keep it here) */}
      {/* <Header /> */}

      {/* Top strip with WORKSPACE / SERVICES / BUILD & OPS / PORTAL */}
      <div className="w-full border-b border-white/5 bg-black/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl gap-4 px-4 py-4">
          <WorkspaceBar className="flex-1" />
          <ServicesBar className="flex-1" />
          <BuildOpsBar className="flex-1" />
          <PortalBar className="flex-1" />
        </div>
      </div>

      {/* Main content area */}
      <main className="px-4 py-8">
        {/* This container centers everything and limits width */}
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[340px,minmax(0,1fr)]">
          {/* Left column: Terminal */}
          <section className="rounded-3xl border border-white/10 bg-black/40 p-4">
            <TerminalPanel />
          </section>

          {/* Right column: whatever you want next to terminal */}
          <section className="rounded-3xl border border-white/10 bg-black/20 p-4">
            {/* Put preview, metrics, cards, etc. here */}
            <div className="h-full flex items-center justify-center text-sm text-slate-400">
              Main dashboard content
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

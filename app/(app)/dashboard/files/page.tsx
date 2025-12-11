const checklist = [
  "Mount Git repositories and cloud drives so code, assets, and briefs live together.",
  "Expose breadcrumb navigation optimized for thumbs with large tap targets.",
  "Enable offline drafts with a clear sync queue for pushes when you regain connectivity.",
  "Bundle quick actions: rename, move, share link, toggle executable bits, and edit metadata.",
];

export default function FilesPage() {
  return (
    <div className="col-span-3 space-y-4 rounded-2xl border border-white/10 bg-slate-950/70 p-6 shadow-lg">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200">MobileCodex File Manager</p>
        <h1 className="mt-1 text-2xl font-bold text-white">Files, repos, and assets in one place</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-200">
          Showcase how ETHUB keeps repositories, documents, and media in a single mobile-friendly file view. Ideal talking points for the video: frictionless browsing, safe edits, and rapid uploads from the Nord N20 camera or downloads folder.
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-200">
          <h2 className="text-base font-semibold text-white">Repository-aware UI</h2>
          <ul className="mt-2 space-y-2">
            <li>Diff view inline so you can narrate changes without leaving the browser.</li>
            <li>Show file badges for LFS assets, config files, and environment secrets.</li>
            <li>
              One-tap &ldquo;open in editor&rdquo; to jump between browsing and coding.
            </li>
          </ul>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-200">
          <h2 className="text-base font-semibold text-white">Ship-ready checklist</h2>
          <ul className="mt-2 space-y-2">
            {checklist.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-indigo-300">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

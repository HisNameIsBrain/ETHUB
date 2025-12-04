// app/admin/dashboard/services/import/page.tsx
"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

function ImportFromFiles() {
  const ingest = useAction(api.scrape_iosfiles.ingestIosFiles);
  const [log, setLog] = useState<any>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const payload = await Promise.all(
      files.map(async (f) => ({
        name: f.name,
        text: await f.text(),
        mime: f.type || undefined,
      }))
    );
    const res = await ingest({ files: payload });
    setLog(res);
  }

  return (
    <div className="space-y-3">
      <input type="file" accept=".csv,.json" multiple onChange={onPick} />
      <pre className="text-xs whitespace-pre-wrap">
        {JSON.stringify(log, null, 2)}
      </pre>
    </div>
  );
}

export default function Page() {
  return (
    <main className="mx-auto max-w-xl p-6 space-y-4">
      <h1 className="text-xl font-semibold">Import Services</h1>
      <p className="text-sm text-gray-600">
        Choose one or more <code>.csv</code> or <code>.json</code> files from Files.
      </p>
      <ImportFromFiles />
    </main>
  );
}

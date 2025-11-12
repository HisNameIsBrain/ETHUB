#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
mkdir -p "$ROOT/app/dashboard/services"

cat > "$ROOT/app/dashboard/services/page.tsx" << 'EOF'
"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const plans = [
  { slug: "starter-realm", name: "Starter Realm", shortTag: "For first-time hosts", monthlyPriceUsd: 5, maxPlayers: 10, ramGb: 2, storageGb: 20, specs: "Perfect for learning the basics.", sortIndex: 1 },
  { slug: "creator-realm", name: "Creator Realm", shortTag: "For communities & content", monthlyPriceUsd: 18, maxPlayers: 40, ramGb: 6, storageGb: 80, specs: "More CPU headroom, SSD storage, plugin-heavy support.", isFeatured: true, sortIndex: 2 },
  { slug: "dream-realm", name: "Dream Realm", shortTag: "For big visions & events", monthlyPriceUsd: 40, maxPlayers: 100, ramGb: 12, storageGb: 200, specs: "High concurrency, snapshot backups, long-term support.", sortIndex: 3 },
];

const timeline = [
  { year: "2013", title: "Found safety in a Minecraft server", body: "Logged in as a quiet kid and realized a blocky world could feel safer than the real one.", sortIndex: 1 },
  { year: "2014", title: "Launched my first server", body: "Rented cheap hosting and learned about configs and downtime.", sortIndex: 2 },
  { year: "2016", title: "Started helping other servers", body: "Went from asking questions to answering them.", sortIndex: 3 },
  { year: "2025", title: "eRealms inside ETHUB", body: "Turning teenage chaos into structured learning for new creators.", sortIndex: 4 },
];

function Plans() {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Server Plans</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {plans.sort((a,b)=>a.sortIndex-b.sortIndex).map(p=>(
          <Card key={p.slug} className={p.isFeatured ? "border-primary shadow-md" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {p.name}
                {p.isFeatured && <Badge>Featured</Badge>}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{p.shortTag}</p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><b>\${p.monthlyPriceUsd}</b> / month</p>
              <p className="text-xs">{p.specs}</p>
              <Button asChild size="sm" className="w-full mt-2"><Link href={"/mc/servers/"+p.slug}>View Details</Link></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Timeline() {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Journey Timeline</h2>
      <div className="space-y-3">
        {timeline.sort((a,b)=>a.sortIndex-b.sortIndex).map(t=>(
          <Card key={t.sortIndex}>
            <CardContent className="py-3">
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-muted-foreground">{t.year}</span>
                <span className="font-medium">{t.title}</span>
              </div>
              {t.body && <p className="text-xs text-muted-foreground mt-1">{t.body}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default function ServicesDashboard() {
  return (
    <div className="p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Services Dashboard</h1>
        <p className="text-sm text-muted-foreground max-w-prose">
          This page displays eRealms plans and ETHUB’s journey timeline for quick visual overview.
        </p>
      </header>
      <Plans />
      <Timeline />
    </div>
  );
}

echo "✅ Created app/dashboard/services/page.tsx successfully."

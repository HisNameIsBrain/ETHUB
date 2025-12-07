"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export default function McJourneyListPage() {
  const journeys = useQuery(api.mcJourneys.getPublishedList, {}) ?? [];

  return (
    <div className="min-h-screen bg-[#050811] text-slate-50">
      <main className="mx-auto flex max-w-4xl flex-col gap-10 px-4 pb-24 pt-20 md:px-8">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            MC Hub · Journey
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            The log of how a random server turned into a real career
          </h1>
          <p className="max-w-2xl text-sm text-slate-300 md:text-base">
            These entries track the actual steps: the DMs sent while shaking,
            the first config you broke, the first player you helped. It&apos;s
            not inspirational quotes; it&apos;s an audit trail.
          </p>
        </header>

        <section className="space-y-4">
          {journeys.length === 0 && (
            <p className="text-sm text-slate-400">
              No entries published yet. When you&apos;re ready, start with the
              moment you joined that first Minecraft community and why it felt
              different.
            </p>
          )}

          <ul className="space-y-4">
            {journeys.map((j) => (
              <li
                key={j._id}
                className="group rounded-xl border border-slate-800 bg-black/40 p-4 transition hover:border-emerald-500/60 hover:bg-black/70"
              >
                <Link href={`/mc/journey/${j.slug}`} className="block">
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="text-base font-semibold md:text-lg">
                      {j.title}
                    </h2>
                    {j.year && (
                      <span className="text-xs text-emerald-300">
                        {j.year}
                      </span>
                    )}
                  </div>
                  {j.excerpt && (
                    <p className="mt-2 text-sm text-slate-300">{j.excerpt}</p>
                  )}
                  <p className="mt-2 text-xs text-emerald-300 opacity-0 transition group-hover:opacity-100">
                    Read entry →
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

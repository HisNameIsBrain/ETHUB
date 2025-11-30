"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { motion } from "framer-motion";

type JourneyPageProps = {
  params: { slug: string };
};

export default function JourneyPage({ params }: JourneyPageProps) {
  const journey = useQuery(api.mcJourneys.getBySlug, { slug: params.slug });

  if (journey === undefined) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-50">
        <main className="mx-auto max-w-2xl px-4 pb-24 pt-20 md:px-8">
          <p className="text-sm text-slate-400">Loading…</p>
        </main>
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-50">
        <main className="mx-auto max-w-2xl px-4 pb-24 pt-20 md:px-8">
          <p className="text-sm text-slate-400">Entry not found.</p>
          <Link
            href="/mc/erealms/journey"
            className="mt-4 inline-block text-sm text-emerald-300"
          >
            ← Back to journal
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50">
      <main className="relative mx-auto max-w-2xl px-4 pb-24 pt-20 md:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#22c55e22,_transparent_55%),radial-gradient(circle_at_bottom,_#0ea5e922,_transparent_55%)]" />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-20 bg-gradient-to-b from-emerald-500/20 via-sky-500/10 to-transparent blur-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        <Link
          href="/mc/erealms/journey"
          className="mb-4 inline-block text-xs text-emerald-300"
        >
          ← Back to journal
        </Link>

        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            eRealms Journal
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {journey.title}
          </h1>
          {journey.year && (
            <p className="text-xs text-slate-400">Year: {journey.year}</p>
          )}
        </header>

        <motion.article
          className="prose prose-invert mt-6 max-w-none prose-p:text-sm prose-p:text-slate-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {journey.content ? (
            journey.content.split("\n").map((line, idx) => (
              <p key={idx}>{line}</p>
            ))
          ) : (
            <p className="text-sm text-slate-300">
              No content yet. Add this in the dashboard when you’re ready.
            </p>
          )}
        </motion.article>
      </main>
    </div>
  );
}

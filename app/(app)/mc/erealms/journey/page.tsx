"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { motion } from "framer-motion";

export default function JourneyListPage() {
  const journeys = (useQuery(api.mcJourneys.getPublishedList, {}) ?? []) as any[];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50">
      <main className="relative mx-auto flex max-w-4xl flex-col gap-10 px-4 pb-24 pt-20 md:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#22c55e22,_transparent_55%),radial-gradient(circle_at_bottom,_#0ea5e922,_transparent_55%)]" />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-20 bg-gradient-to-b from-emerald-500/20 via-sky-500/10 to-transparent blur-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            eRealms Journal
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            From shy player to server host
          </h1>
          <p className="max-w-2xl text-sm text-slate-300 md:text-base">
            This journal tracks my climb from “I hope this server stays up”
            to “I know how to build, host, and support worlds for other
            people.” No hype, just honest checkpoints from the bottom up.
          </p>
        </header>

        <section className="space-y-4">
          {journeys.length === 0 && (
            <p className="text-sm text-slate-400">
              No entries published yet. The first entry goes here when I’m
              ready to write it and connect all the dots from Minecraft to
              infrastructure, ETHUB, and everything in between.
            </p>
          )}

          {journeys.length > 0 && (
            <ul className="space-y-4">
              {journeys.map((journey, index) => {
                const slug = journey.slug ?? journey._id ?? String(index);
                const title = journey.title ?? "Untitled entry";
                const intro =
                  journey.intro ??
                  journey.excerpt ??
                  "A checkpoint in my journey from scared kid with a crashing server to someone who can keep worlds online for others.";
                const createdAt =
                  journey.createdAt ?? journey._creationTime ?? null;

                return (
                  <motion.li
                    key={slug}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.25 }}
                    className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 hover:border-emerald-500/60"
                  >
                    <Link
                      href={`/mc/erealms/journey/${slug}`}
                      className="block space-y-1"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="text-sm font-semibold md:text-base">
                          {title}
                        </h2>
                        {createdAt && (
                          <span className="text-xs text-slate-400">
                            {new Date(createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 md:text-sm">
                        {intro}
                      </p>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="mt-2 rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 text-xs text-slate-300 md:text-sm">
          <p>
            This journal is where I connect the dots: the first DM I sent to a
            Minecraft community, the nights I thought the server was gone for
            good, the first time I felt like I belonged in tech, and how all of
            that turned into ETHUB and eRealms. It’s here so the next shy kid
            doesn’t have to guess whether their “game phase” matters. It does.
          </p>
        </section>
      </main>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const heroBlocks = [
  { x: "-20%", delay: 0 },
  { x: "10%", delay: 0.15 },
  { x: "40%", delay: 0.3 },
];

const timelineStatic = [
  {
    year: "Age 14",
    title: "First Minecraft Community",
    body: "Shy, anxious, but reaching out anyway. Found safety and belonging in a small server community instead of school hallways.",
  },
  {
    year: "First Host",
    title: "Learning Servers by Breaking Them",
    body: "Taught yourself FTP, configs, plugins, and backups by trial, error, and late-night panic.",
  },
  {
    year: "From Player to Builder",
    title: "Helping Others Get Online",
    body: "Started helping friends and strangers get their own servers running. Learned support, patience, and communication.",
  },
  {
    year: "ETHUB Era",
    title: "Turning Curiosity Into Infrastructure",
    body: "Built ETHUB to give open access to skills and tools you didn’t have as a kid. eRealms is the gaming wing of that mission.",
  },
];

const serverCardsStatic = [
  {
    name: "Starter Realm",
    tag: "For first-time hosts",
    desc: "Perfect for friends-and-family worlds, SMPs, and cozy builds.",
    specs: "Up to 10 players · 2–3 GB RAM",
    href: "/erealms/servers/starter",
  },
  {
    name: "Creator Realm",
    tag: "For content & communities",
    desc: "For creators who want stable worlds, events, and recordings.",
    specs: "20–40 players · 4–8 GB RAM",
    href: "/erealms/servers/creator",
  },
  {
    name: "Dream Realm",
    tag: "For ambitious projects",
    desc: "Custom configs, modpacks, and long-term worlds with room to grow.",
    specs: "50+ players · 8+ GB RAM",
    href: "/erealms/servers/dream",
  },
];

export default function ERealmsPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-50">
      <main className="relative mx-auto flex max-w-6xl flex-col gap-16 px-4 pb-24 pt-20 md:px-8">
        {/* softer pine + amber background glow */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#064e3b33,_transparent_55%),radial-gradient(circle_at_bottom,_#f9731630,_transparent_60%)]" />

        {/* HERO */}
        <section className="grid gap-10 md:grid-cols-[1.4fr,1fr] md:items-center">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-black/40 px-3 py-1 text-xs font-medium text-emerald-200"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              eRealms by ETHUB · Minecraft & Game Servers
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="text-balance text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl"
            >
              Make impossible{" "}
              <span className="bg-gradient-to-br from-emerald-200 via-emerald-300 to-amber-200 bg-clip-text text-transparent">
                kid dreams
              </span>{" "}
              real, one block at a time.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="max-w-xl text-sm text-slate-300 md:text-base"
            >
              eRealms is where your 14-year-old self finally gets the tools,
              support, and access you didn’t. Built on ETHUB’s mission to open
              up tech education, this page journals the journey from shy player
              to server host to builder of other people’s worlds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="flex flex-wrap gap-3"
            >
              <Button
                asChild
                size="lg"
                className="rounded-xl px-6 text-sm font-semibold bg-emerald-500/90 hover:bg-emerald-500 text-slate-950"
              >
                <Link href="/erealms/servers">Launch a Realm</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-xl border-emerald-500/25 bg-black/50 px-6 text-sm text-emerald-100 hover:bg-emerald-500/5"
              >
                <Link href="/erealms/journey">Read the Origin Story</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="mt-4 rounded-2xl border border-emerald-500/20 bg-black/60 p-4 text-xs text-slate-300 md:text-sm"
            >
              <p className="font-semibold text-emerald-200">ETHUB Mission</p>
              <p className="mt-1">
                ETHUB exists to open up technical training and certification for
                people who never got a fair shot at it. eRealms applies that
                same mission to game servers: lowering the barrier so anyone can
                learn, build, and host their own worlds.
              </p>
            </motion.div>
          </div>

          {/* MC blocks, darker + softer glow */}
          <div className="relative h-64 md:h-[320px]">
            {heroBlocks.map((block, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 + block.delay }}
                className="absolute"
                style={{ left: block.x }}
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: block.delay }}
                  className="h-24 w-24 rotate-3 rounded-xl border border-emerald-700/50 bg-gradient-to-br from-emerald-700 to-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.35)]"
                >
                  <div className="h-1/4 w-full bg-emerald-900/80" />
                  <div className="h-2/4 w-full bg-emerald-700" />
                  <div className="h-1/4 w-full bg-[#4a3320]" />
                </motion.div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute inset-x-4 bottom-0 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 backdrop-blur"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-200/90">
                Journal from the bottom up
              </p>
              <p className="mt-1 text-xs text-slate-300">
                From the first DM to a Minecraft community to deploying your own
                hosting stack, this space exists to track every step – the wins,
                the wipeouts, and the restarts.
              </p>
            </motion.div>
          </div>
        </section>

        {/* TIMELINE */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold md:text-2xl">
            From one player’s story to a blueprint for others
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {timelineStatic.map((item) => (
              <Card
                key={item.title}
                className="border-slate-800 bg-slate-950/70 backdrop-blur"
              >
                <CardHeader className="pb-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-emerald-200/90">
                    {item.year}
                  </div>
                  <CardTitle className="text-base md:text-lg">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* PLANS */}
        <section className="space-y-6">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <h2 className="text-xl font-semibold md:text-2xl">
                Choose how big you want your world to be
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                Start tiny, grow later. Every plan is designed for learning,
                not lock-in.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="rounded-xl text-xs md:text-sm border-slate-700 hover:bg-slate-800/60"
            >
              <Link href="/erealms/servers">Compare all plans</Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {serverCardsStatic.map((card) => (
              <Card
                key={card.name}
                className="flex flex-col border-slate-800 bg-slate-950/70 backdrop-blur"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base md:text-lg">
                    {card.name}
                  </CardTitle>
                  <p className="text-xs font-medium text-emerald-200/90">
                    {card.tag}
                  </p>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between gap-3">
                  <div className="space-y-2 text-sm text-slate-300">
                    <p>{card.desc}</p>
                    <p className="text-xs text-slate-400">{card.specs}</p>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className="mt-2 rounded-xl text-xs bg-slate-800 hover:bg-slate-700"
                  >
                    <Link href={card.href}>View details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FOOTER CALLOUT */}
        <section className="mt-4 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-emerald-600/5 to-slate-900 p-5 text-sm text-slate-100">
          <h2 className="text-base font-semibold md:text-lg">
            A space to archive the version of you that refused to quit
          </h2>
          <p className="mt-1 text-sm text-slate-100/90">
            This project isn’t just about servers. It’s an evidence log that
            you got back up after every downfall, even when nobody believed a
            shy 14-year-old could do any of this. Each new realm you launch is
            proof for the next kid that their “impossible” idea is just an
            underfunded prototype.
          </p>
        </section>
      </main>
    </div>
  );
}

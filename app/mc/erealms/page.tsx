"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const heroBlocks = [
  { x: "-6%", delay: 0 },
  { x: "26%", delay: 0.18 },
  { x: "58%", delay: 0.32 },
];

const timelineStatic = [
  {
    year: "Age 14",
    title: "Sending the first DM",
    body: "I was too shy to unmute in class, but brave enough to message a Minecraft community and ask for help. That DM was my real on-ramp into tech, not a textbook.",
  },
  {
    year: "First Server",
    title: "Learning by breaking everything",
    body: "Cheap host, plugin chaos, constant crashes. I learned uptime, backups, and configs the hard way – by fixing what I broke, one restart at a time.",
  },
  {
    year: "Helping Others",
    title: "From player to host",
    body: "I shifted from “can someone help?” to “I can fix that for you.” Friends and strangers started trusting my worlds to stay online.",
  },
  {
    year: "ETHUB & eRealms",
    title: "Turning survival mode into infrastructure",
    body: "ETHUB exists so I can open access to the tools I never had. eRealms is the Minecraft wing of that mission – a place to turn one kid’s coping mechanism into a blueprint for others.",
  },
];

const serverCardsStatic = [
  {
    name: "Starter Realm",
    tag: "For first-time hosts",
    desc: "A safe first world for a few friends. Exactly how my journey started: small, personal, and full of possibility.",
    specs: "Up to 10 players · 2–3 GB RAM",
    href: "/mc/erealms/servers/starter",
  },
  {
    name: "Creator Realm",
    tag: "For communities & content",
    desc: "For the stage where I’m running events, recording clips, and trying ideas that actually need stability.",
    specs: "20–40 players · 4–8 GB RAM",
    href: "/mc/erealms/servers/creator",
  },
  {
    name: "Dream Realm",
    tag: "For impossible projects",
    desc: "For the worlds nobody thought were realistic: modpacks, long-term survival, and ambitious builds that scare old hardware.",
    specs: "50+ players · 8+ GB RAM",
    href: "/mc/erealms/servers/dream",
  },
];

export default function ERealmsPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-50">
      <main className="relative mx-auto flex max-w-6xl flex-col gap-16 px-4 pb-24 pt-20 md:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#22c55e33,_transparent_55%),radial-gradient(circle_at_bottom,_#0ea5e933,_transparent_55%)]" />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-emerald-500/18 via-sky-500/12 to-transparent blur-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9 }}
        />

        {/* HERO */}
        <section className="grid gap-10 md:grid-cols-[1.4fr,1fr] md:items-center">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-slate-900/80 px-3 py-1 text-xs font-medium text-emerald-200 shadow-sm"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
              eRealms by ETHUB · Minecraft & Game Servers
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="text-balance text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl"
            >
              Make my{" "}
              <span className="bg-gradient-to-br from-emerald-300 via-lime-300 to-amber-300 bg-clip-text text-transparent">
                impossible kid dreams
              </span>{" "}
              real, one block at a time.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="max-w-xl text-sm text-slate-300 md:text-base"
            >
              eRealms exists for the version of me who was 14, shy, and
              quietly DM’ing a Minecraft community for help. I had no funding,
              no credentials – just curiosity, fear, and a cheap server that
              kept crashing. This space turns that story into structure: a
              place to host worlds, learn the stack, and document how I climbed
              out of the deep end one restart at a time.
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
                className="rounded-xl px-6 text-sm font-semibold shadow-md shadow-emerald-500/25"
              >
                <Link href="/mc/erealms/servers">Launch a Realm</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-xl border-emerald-500/40 bg-slate-900/80 px-6 text-sm text-emerald-200 hover:bg-emerald-500/10"
              >
                <Link href="/mc/erealms/journey">Read My Origin Story</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="mt-4 rounded-2xl border border-emerald-500/25 bg-slate-950/80 p-4 text-xs text-slate-300 shadow-sm md:text-sm"
            >
              <p className="font-semibold text-emerald-200">ETHUB Mission</p>
              <p className="mt-1">
                ETHUB exists to open technical training and certification to
                people who never got a fair shot, including me. eRealms applies
                that same mission to game servers: turning late-night
                experiments, confusing panels, and support tickets into a
                guided path anyone can follow – a block at a time.
              </p>
            </motion.div>
          </div>

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
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    delay: block.delay,
                    ease: "easeInOut",
                  }}
                  className="h-24 w-24 rotate-3 rounded-xl border border-emerald-400/60 bg-gradient-to-br from-emerald-500 to-lime-400 shadow-[0_0_40px_rgba(34,197,94,0.45)]"
                >
                  <div className="h-1/4 w-full bg-emerald-700/90" />
                  <div className="h-2/4 w-full bg-emerald-500" />
                  <div className="h-1/4 w-full bg-[#5a3a23]" />
                </motion.div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute inset-x-4 bottom-0 rounded-2xl border border-slate-700/70 bg-slate-950/85 p-4 backdrop-blur"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-300">
                JOURNAL FROM THE BOTTOM UP
              </p>
              <p className="mt-1 text-xs text-slate-300">
                This isn’t a glossy “about” page. It’s my running log: from
                the first DM to a Minecraft community to the first time my
                server paid a bill, to the moment I realised other people felt
                safe in the worlds I hosted.
              </p>
            </motion.div>
          </div>
        </section>

        {/* TIMELINE */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold md:text-2xl">
            From scared kid to repeatable blueprint
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {timelineStatic.map((item) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35 }}
              >
                <Card className="border-slate-800/80 bg-slate-950/80 backdrop-blur">
                  <CardHeader className="pb-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
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
              </motion.div>
            ))}
          </div>
        </section>

        {/* PLANS */}
        <section className="space-y-6">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <h2 className="text-xl font-semibold md:text-2xl">
                Choose how big I want my world to be
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                I start with the server I wish I had. I grow into the one I
                didn’t think I was allowed to ask for.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="rounded-xl text-xs md:text-sm"
            >
              <Link href="/mc/erealms/servers">Compare all plans</Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {serverCardsStatic.map((card, index) => (
              <motion.div
                key={card.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
              >
                <Card className="flex h-full flex-col border-slate-800/80 bg-slate-950/80 backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base md:text-lg">
                      {card.name}
                    </CardTitle>
                    <p className="text-xs font-medium text-emerald-300">
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
                      className="mt-2 rounded-xl text-xs"
                    >
                      <Link href={card.href}>View details</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CLOSING STORY BLOCK */}
        <section className="mt-4 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/12 via-emerald-500/10 to-sky-500/10 p-5 text-sm text-slate-100 shadow-sm">
          <h2 className="text-base font-semibold md:text-lg">
            Proof I was never “just playing games”
          </h2>
          <p className="mt-1 text-sm text-slate-100/90">
            Every crash, rollback, and panicked config change trained me to
            think like an engineer before anyone gave me that title. eRealms is
            where that history gets written down and scaled: from “I kept my
            world online somehow” to “I know how to design, host, and support
            worlds for other people.” One shy kid’s persistence becomes
            someone else’s starting point.
          </p>
        </section>
      </main>
    </div>
  );
}

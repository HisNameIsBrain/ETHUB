"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const heroBlocks = [
  { x: "-20%", delay: 0 },
  { x: "10%", delay: 0.15 },
  { x: "40%", delay: 0.3 },
];

export default function McHomePage() {
  const journeys = useQuery(api.mcJourneys.getPublishedList, {}) ?? [];
  const plans = useQuery(api.mcServerPlans.getAllPublic, {}) ?? [];

  const topJourney = journeys[0];
  const featuredPlans = plans.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#050811] text-slate-50">
      <main className="relative mx-auto flex max-w-6xl flex-col gap-16 px-4 pb-24 pt-20 md:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#22c55e33,_transparent_55%),radial-gradient(circle_at_bottom,_#facc1533,_transparent_55%)]" />

        {/* Hero – younger self / impossible dreams */}
        <section className="grid gap-10 md:grid-cols-[1.4fr,1fr] md:items-center">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-black/40 px-3 py-1 text-xs font-medium text-emerald-300"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              MC Hub · Worlds for the kid who refused to quit
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="text-balance text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl"
            >
              From{" "}
              <span className="bg-gradient-to-br from-emerald-300 via-lime-300 to-amber-300 bg-clip-text text-transparent">
                shy player
              </span>{" "}
              to the person who builds{" "}
              <span className="underline decoration-emerald-400 decoration-wavy underline-offset-4">
                other people&apos;s worlds
              </span>
              .
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="max-w-xl text-sm text-slate-300 md:text-base"
            >
              Minecraft was the door: a shy 14-year-old reaching out to a random
              community, finding safety on a tiny server, and slowly learning
              that configs, RAM, and backups were just other ways of saying
              “this world matters.” MC Hub journals that climb and turns it into
              a blueprint for anyone who needs it.
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
                className="rounded-xl px-6 text-sm font-semibold"
              >
                <Link href="/mc/servers">Launch a Server</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-xl border-emerald-500/40 bg-black/40 px-6 text-sm text-emerald-200 hover:bg-emerald-500/10"
              >
                <Link href="/mc/journey">Read the Journey</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="mt-4 rounded-2xl border border-emerald-500/25 bg-black/40 p-4 text-xs text-slate-300 md:text-sm"
            >
              <p className="font-semibold text-emerald-200">
                Why this exists
              </p>
              <p className="mt-1">
                This is an open-access corner of ETHUB dedicated to the
                Minecraft kid you used to be and the kids who are there right
                now: no corporate jargon, just tools, servers, and receipts that
                say, “You built this yourself.”
              </p>
            </motion.div>
          </div>

          {/* Floating blocks + journal hook */}
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
                    duration: 4,
                    repeat: Infinity,
                    delay: block.delay,
                  }}
                  className="h-24 w-24 rotate-3 rounded-xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500 to-lime-400 shadow-[0_0_40px_rgba(34,197,94,0.5)]"
                >
                  <div className="h-1/4 w-full bg-emerald-700/80" />
                  <div className="h-2/4 w-full bg-emerald-500" />
                  <div className="h-1/4 w-full bg-[#5a3a23]" />
                </motion.div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute inset-x-4 bottom-0 rounded-2xl border border-slate-700/60 bg-black/60 p-4 backdrop-blur"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-300">
                Journal from the bottom up
              </p>
              {topJourney ? (
                <Link href={`/mc/journey/${topJourney.slug}`}>
                  <p className="mt-1 text-xs text-slate-300">
                    Latest entry:{" "}
                    <span className="font-medium text-emerald-200">
                      {topJourney.title}
                    </span>
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400 line-clamp-3">
                    {topJourney.excerpt ??
                      "Follow the thread from the first DM to a server admin panel and beyond."}
                  </p>
                </Link>
              ) : (
                <p className="mt-1 text-xs text-slate-300">
                  Start writing your story in the journal. First entry is the
                  moment you realized “maybe I can actually do this.”
                </p>
              )}
            </motion.div>
          </div>
        </section>

        {/* Journey explanation */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold md:text-2xl">
            The long climb: how one server changed everything
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-slate-700/70 bg-black/50 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">
                  You at 14: scared, curious, still logging in
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">
                  You reached out to a Minecraft community half out of panic,
                  half out of hope. That one server became the first place you
                  felt safe enough to experiment, fail, and reboot without
                  being laughed out of the room.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-700/70 bg-black/50 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">
                  MC Hub: receipts that you got back up
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">
                  Every server you stand up, every backup you test, every kid
                  you help host their first world is proof you kept going. This
                  hub records the climb so the next shy kid has a map instead of
                  a guess.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Plans preview */}
        <section className="space-y-6">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <h2 className="text-xl font-semibold md:text-2xl">
                Choose how big you want your world to be
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                Start with a tiny survival world, grow into events and
                communities. The hardware scales; the intention stays the same.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="rounded-xl text-xs md:text-sm"
            >
              <Link href="/mc/servers">View all plans</Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {featuredPlans.length === 0 && (
              <p className="text-sm text-slate-400 md:col-span-3">
                No plans yet. Add entries to{" "}
                <code className="rounded bg-slate-900 px-1.5 py-0.5 text-xs">
                  mcServerPlans
                </code>{" "}
                to light this section up.
              </p>
            )}
            {featuredPlans.map((plan) => (
              <Card
                key={plan._id}
                className="flex flex-col border-slate-700/70 bg-black/50 backdrop-blur"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base md:text-lg">
                    {plan.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between gap-3">
                  <div className="space-y-2 text-sm text-slate-300">
                    {plan.description && <p>{plan.description}</p>}
                    <p className="text-xs text-slate-400">
                      {plan.maxPlayers != null && `Up to ${plan.maxPlayers} players · `}
                      {plan.ramGb != null && `${plan.ramGb} GB RAM`}
                    </p>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className="mt-2 rounded-xl text-xs"
                  >
                    <Link href={`/mc/servers/${plan.slug}`}>View details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer story */}
        <section className="mt-4 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-emerald-500/10 to-sky-500/10 p-5 text-sm text-slate-100">
          <h2 className="text-base font-semibold md:text-lg">
            A world-log for the version of you nobody believed
          </h2>
          <p className="mt-1 text-sm text-slate-100/90">
            This isn&apos;t nostalgia. It&apos;s infrastructure. MC Hub is where you
            document every leap from “impossible” to “done,” so the next kid
            doesn&apos;t have to white-knuckle through it with no guidance
            and a dying laptop.
          </p>
        </section>
      </main>
    </div>
  );
}

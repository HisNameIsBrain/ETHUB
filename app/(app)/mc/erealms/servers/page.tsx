"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function ServersPage() {
  const plans = useQuery(api.mcServerPlans.getAllPublic, {}) ?? [];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50">
      <main className="relative mx-auto flex max-w-5xl flex-col gap-10 px-4 pb-24 pt-20 md:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#22c55e22,_transparent_55%),radial-gradient(circle_at_bottom,_#0ea5e922,_transparent_55%)]" />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-20 bg-gradient-to-b from-emerald-500/20 via-sky-500/10 to-transparent blur-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            eRealms Plans
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Pick the realm size that matches your courage
          </h1>
          <p className="max-w-2xl text-sm text-slate-300 md:text-base">
            These plans are designed for learning first, scaling second. Clear
            specs, no gimmicks, and room to grow as your worlds – and your
            skills – get bigger.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {plans.length === 0 && (
            <p className="text-sm text-slate-400 md:col-span-3">
              No plans configured yet. Seed{" "}
              <code className="rounded bg-slate-900 px-1.5 py-0.5 text-xs">
                mcServerPlans
              </code>{" "}
              in Convex to display options.
            </p>
          )}

          {plans.map((plan, i) => (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <Card className="flex h-full flex-col border-slate-800/80 bg-slate-950/80 backdrop-blur">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base md:text-lg">
                    {plan.name}
                  </CardTitle>
                  {plan.shortTag && (
                    <p className="text-xs font-medium text-emerald-300">
                      {plan.shortTag}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between gap-3 text-sm text-slate-300">
                  {plan.description && <p>{plan.description}</p>}
                  <div className="space-y-0.5 text-xs text-slate-400">
                    {plan.maxPlayers != null && (
                      <p>Players: up to {plan.maxPlayers}</p>
                    )}
                    {plan.ramGb != null && <p>RAM: {plan.ramGb} GB</p>}
                    {plan.storageGb != null && (
                      <p>Storage: {plan.storageGb} GB</p>
                    )}
                    {plan.monthlyPriceUsd != null && (
                      <p>From ${plan.monthlyPriceUsd.toFixed(2)}/month</p>
                    )}
                    {plan.specs && <p>{plan.specs}</p>}
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className="mt-2 rounded-xl text-xs"
                  >
                    <Link href={`/mc/erealms/servers/${plan.slug}`}>
                      View details
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </section>

        {plans.length > 0 && (
          <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-300 md:text-sm">
            <p>
              When you pick a plan here, you’re not just spinning up hardware.
              You’re backing the version of you who had to guess at everything –
              and building clearer paths for the next shy kid who wants to host
              something of their own.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

type ServerDetailProps = {
  params: { slug: string };
};

export default function ServerDetailPage({ params }: ServerDetailProps) {
  const plan = useQuery(api.mcServerPlans.getBySlug, { slug: params.slug });
  const logClick = useMutation(api.mcButtonClicks.logClick);

  const handleLaunchClick = async () => {
    await logClick({
      buttonKey: "launch_realm",
      path: `/mc/erealms/servers/${params.slug}`,
      metadata: { planSlug: params.slug },
    });
  };

  if (plan === undefined) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-50">
        <main className="mx-auto max-w-3xl px-4 pb-24 pt-20 md:px-8">
          <p className="text-sm text-slate-400">Loading…</p>
        </main>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-50">
        <main className="mx-auto max-w-3xl px-4 pb-24 pt-20 md:px-8">
          <p className="text-sm text-slate-400">Plan not found.</p>
          <Link
            href="/mc/erealms/servers"
            className="mt-4 inline-block text-sm text-emerald-300"
          >
            ← Back to plans
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50">
      <main className="relative mx-auto max-w-3xl space-y-8 px-4 pb-24 pt-20 md:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#22c55e22,_transparent_55%),radial-gradient(circle_at_bottom,_#0ea5e922,_transparent_55%)]" />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-20 bg-gradient-to-b from-emerald-500/20 via-sky-500/10 to-transparent blur-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        <div>
          <Link
            href="/mc/erealms/servers"
            className="mb-4 inline-block text-xs text-emerald-300"
          >
            ← Back to plans
          </Link>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            eRealms Plan
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
            {plan.name}
          </h1>
          {plan.shortTag && (
            <p className="mt-1 text-sm text-slate-300">{plan.shortTag}</p>
          )}
        </div>

        <section className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-200 md:grid-cols-[2fr,1fr] md:p-6">
          <div className="space-y-3">
            {plan.description && <p>{plan.description}</p>}
            {plan.specs && (
              <p className="text-xs text-slate-400">{plan.specs}</p>
            )}
          </div>
          <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/90 p-4 text-xs text-slate-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Specs
            </p>
            {plan.maxPlayers != null && (
              <p>Players: up to {plan.maxPlayers}</p>
            )}
            {plan.ramGb != null && <p>RAM: {plan.ramGb} GB</p>}
            {plan.storageGb != null && <p>Storage: {plan.storageGb} GB</p>}
            {plan.monthlyPriceUsd != null && (
              <p>From ${plan.monthlyPriceUsd.toFixed(2)}/month</p>
            )}
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/15 via-emerald-500/10 to-sky-500/10 p-4 text-sm text-slate-100 md:p-6">
          <p>
            This plan is meant to feel like that first server you joined: safe,
            stable, and yours. We route it into your ETHUB stack so you can
            manage it alongside repairs, invoices, and anything else you’re
            building.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-2 rounded-xl px-6 text-sm font-semibold shadow-md shadow-emerald-500/30"
            onClick={handleLaunchClick}
          >
            <Link href="/portal">Launch this realm through ETHUB</Link>
          </Button>
          <p className="text-xs text-emerald-200/80">
            The assistant handles specs, pricing, and setup. Your job is to
            bring the world you wish you had at 14.
          </p>
        </section>
      </main>
    </div>
  );
}

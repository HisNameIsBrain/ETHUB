"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type ServerDetailProps = {
  params: { slug: string };
};

export default function ServerDetailPage({ params }: ServerDetailProps) {
  const plan = useQuery(api.mcServerPlans.getBySlug, { slug: params.slug });
  const logClick = useAction(api.mcButtonClicks.logClick);

  const handleLaunchClick = async () => {
    await logClick({
      buttonKey: "launch_realm",
      path: `/erealms/servers/${params.slug}`,
      metadata: { planSlug: params.slug },
    });
  };

  if (plan === undefined) {
    return (
      <div className="min-h-screen bg-[#050811] text-slate-50">
        <main className="mx-auto max-w-3xl px-4 pb-24 pt-20 md:px-8">
          <p className="text-sm text-slate-400">Loading...</p>
        </main>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#050811] text-slate-50">
        <main className="mx-auto max-w-3xl px-4 pb-24 pt-20 md:px-8">
          <p className="text-sm text-slate-400">Plan not found.</p>
          <Link
            href="/erealms/servers"
            className="mt-4 inline-block text-sm text-emerald-300"
          >
            ← Back to plans
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050811] text-slate-50">
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-20 md:px-8 space-y-8">
        <div>
          <Link
            href="/erealms/servers"
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

        <section className="grid gap-4 rounded-2xl border border-slate-800 bg-black/40 p-4 text-sm text-slate-200 md:grid-cols-[2fr,1fr] md:p-6">
          <div className="space-y-3">
            {plan.description && <p>{plan.description}</p>}
            {plan.specs && (
              <p className="text-xs text-slate-400">
                {plan.specs}
              </p>
            )}
          </div>
          <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-200">
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

        <section className="space-y-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-slate-100 md:p-6">
          <p>
            This plan is meant to feel like that first server you joined: safe,
            stable, and yours. We route it into your ETHUB stack so you can
            manage it alongside repairs, invoices, and everything else you’re
            building.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-2 rounded-xl px-6 text-sm font-semibold"
            onClick={handleLaunchClick}
          >
            <Link href="/portal">
              Launch this realm through ETHUB
            </Link>
          </Button>
          <p className="text-xs text-emerald-200/80">
            The assistant can handle specs, pricing, and setup. Your job is to
            bring the world you wish you had at 14.
          </p>
        </section>
      </main>
    </div>
  );
}

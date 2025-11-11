"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ServersPage() {
  const plans = useQuery(api.mcServerPlans.getAllPublic, {}) ?? [];

  return (
    <div className="min-h-screen bg-[#050811] text-slate-50">
      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-4 pb-24 pt-20 md:px-8">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            eRealms Plans
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Pick the realm size that matches your courage
          </h1>
          <p className="max-w-2xl text-sm text-slate-300 md:text-base">
            All plans are designed to be learnable. No hidden fine print, no
            lock-in – just clear specs and room to grow.
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

          {plans.map((plan) => (
            <Card
              key={plan._id}
              className="flex flex-col border-slate-700/70 bg-black/50 backdrop-blur"
            >
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
                  {plan.storageGb != null && <p>Storage: {plan.storageGb} GB</p>}
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
                  <Link href={`/erealms/servers/${plan.slug}`}>
                    View details
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        {plans.length > 0 && (
          <section className="rounded-2xl border border-slate-800 bg-black/40 p-4 text-xs text-slate-300 md:text-sm">
            <p>
              When you choose a plan, you’re not just renting RAM. You’re
              investing in the kid who needed a safe server to breathe in, and
              in the next kid who will learn from the story you’re writing now.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

// convex/mcSeed.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seed = mutation({
  args: {
    reset: v.optional(v.boolean()),
  },
  handler: async (ctx, { reset = false }) => {
    const now = Date.now();

    if (reset) {
      const tables = [
        "mcJourneys",
        "mcServerPlans",
        "mcButtons",
        "mcTimelineEvents",
      ] as const;

      for (const table of tables) {
        const docs = await ctx.db.query(table).collect();
        for (const doc of docs) {
          await ctx.db.delete(doc._id);
        }
      }
    }

    // -------- mcJourneys --------
    const journeys = [
      {
        userId: "brain-demo-user",
        slug: "minecraft-safety",
        title: "Found safety in a Minecraft server",
        year: "2013",
        excerpt:
          "Logged in as a quiet kid and realized a blocky world could feel safer than the real one.",
        content:
          "Minecraft gave me an escape — an early sense of belonging in digital space.",
        tweetUrl: "https://x.com/hisnameisbrain/status/1",
        isPublished: true,
        sortIndex: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        userId: "brain-demo-user",
        slug: "first-server-launch",
        title: "Launched my first server",
        year: "2014",
        excerpt:
          "Rented cheap hosting, learned about configs, crashes, and backups.",
        content:
          "Every crash was a lesson. Every plugin was an experiment in persistence.",
        tweetUrl: "https://x.com/hisnameisbrain/status/2",
        isPublished: true,
        sortIndex: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        userId: "brain-demo-user",
        slug: "helping-others",
        title: "Started helping other servers",
        year: "2016",
        excerpt: "From asking questions to answering them.",
        content:
          "By this point, I was fixing friends’ lag, debugging plugins, and migrating worlds.",
        tweetUrl: "https://x.com/hisnameisbrain/status/3",
        isPublished: true,
        sortIndex: 3,
        createdAt: now,
        updatedAt: now,
      },
      {
        userId: "brain-demo-user",
        slug: "erealms-ethub",
        title: "eRealms joins ETHUB",
        year: "2025",
        excerpt:
          "Turning childhood chaos into structure — a platform for the next generation of builders.",
        content:
          "What started as a survival realm is now part of ETHUB’s ecosystem.",
        tweetUrl: "https://x.com/hisnameisbrain/status/4",
        isPublished: true,
        sortIndex: 4,
        createdAt: now,
        updatedAt: now,
      },
    ];

    for (const j of journeys) {
      await ctx.db.insert("mcJourneys", j);
    }

    // -------- mcServerPlans --------
    const plans = [
      {
        slug: "starter-realm",
        name: "Starter Realm",
        shortTag: "For first-time hosts",
        monthlyPriceUsd: 5,
        ramGb: 2,
        storageGb: 20,
        maxPlayers: 10,
        specs:
          "Perfect for learning the basics, testing plugins, and small cozy worlds.",
        isFeatured: false,
        isPublic: true,
        sortIndex: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        slug: "creator-realm",
        name: "Creator Realm",
        shortTag: "For communities & content",
        monthlyPriceUsd: 18,
        ramGb: 6,
        storageGb: 80,
        maxPlayers: 40,
        specs:
          "More CPU headroom, SSD storage, plugin-heavy support, snapshot backups.",
        isFeatured: true,
        isPublic: true,
        sortIndex: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        slug: "dream-realm",
        name: "Dream Realm",
        shortTag: "For big visions & events",
        monthlyPriceUsd: 40,
        ramGb: 12,
        storageGb: 200,
        maxPlayers: 100,
        specs:
          "High concurrency events, creators, and long-term survival worlds.",
        isFeatured: false,
        isPublic: true,
        sortIndex: 3,
        createdAt: now,
        updatedAt: now,
      },
    ];

    for (const p of plans) {
      await ctx.db.insert("mcServerPlans", p);
    }

    // -------- mcButtons --------
    const buttons = [
      {
        key: "erealms_back_to_journal",
        label: "Back to journal",
        group: "erealms_journal",
        href: "/mc/erealms/journey",
        icon: "ArrowLeft",
        variant: "ghost",
        sortIndex: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        key: "erealms_open_dashboard",
        label: "Open services dashboard",
        group: "erealms_admin",
        href: "/dashboard/services",
        icon: "Server",
        variant: "default",
        sortIndex: 2,
        createdAt: now,
        updatedAt: now,
      },
    ];

    for (const b of buttons) {
      await ctx.db.insert("mcButtons", b);
    }

    // -------- mcTimelineEvents --------
    const timeline = [
      {
        userId: "brain-demo-user",
        year: "2013",
        title: "Found safety in a Minecraft server",
        body: "A safe haven online during uncertain times. Digital space became emotional space.",
        sortIndex: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        userId: "brain-demo-user",
        year: "2014",
        title: "Launched my first server",
        body: "Learned about uptime, configs, and community management from scratch.",
        sortIndex: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        userId: "brain-demo-user",
        year: "2016",
        title: "Started helping others",
        body: "Supported other admins and players; found purpose in building, not just playing.",
        tweetUrl: "https://x.com/hisnameisbrain/status/5",
        sortIndex: 3,
        createdAt: now,
        updatedAt: now,
      },
      {
        userId: "brain-demo-user",
        year: "2025",
        title: "Launched eRealms",
        body: "ETHUB and eRealms merge — a creative tech playground for learners.",
        sortIndex: 4,
        createdAt: now,
        updatedAt: now,
      },
    ];

    for (const t of timeline) {
      await ctx.db.insert("mcTimelineEvents", t);
    }

    return {
      ok: true,
      counts: {
        journeys: journeys.length,
        plans: plans.length,
        buttons: buttons.length,
        timeline: timeline.length,
      },
      reset,
    };
  },
});

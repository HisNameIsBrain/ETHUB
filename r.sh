#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONVEX_DIR="$ROOT/convex"

mkdir -p "$CONVEX_DIR"

cat > "$CONVEX_DIR/mcJourneys.ts" <<'EOF'
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getPublishedList = query({
  args: {},
  handler: async (ctx) => {
    const journeys = await ctx.db
      .query("mcJourneys")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .order("asc")
      .collect();

    return journeys;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const [journey] = await ctx.db
      .query("mcJourneys")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .take(1);

    return journey ?? null;
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    slug: v.string(),
    title: v.string(),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    year: v.optional(v.string()),
    sortIndex: v.optional(v.number()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("mcJourneys", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("mcJourneys"),
    title: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    year: v.optional(v.string()),
    sortIndex: v.optional(v.number()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const existing = await ctx.db.get(id);
    if (!existing) return;
    await ctx.db.patch(id, { ...patch, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("mcJourneys") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
EOF

cat > "$CONVEX_DIR/mcServerPlans.ts" <<'EOF'
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAllPublic = query({
  args: {},
  handler: async (ctx) => {
    const plans = await ctx.db
      .query("mcServerPlans")
      .order("asc")
      .collect();

    return plans;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const [plan] = await ctx.db
      .query("mcServerPlans")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .take(1);

    return plan ?? null;
  },
});

export const create = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    shortTag: v.optional(v.string()),
    description: v.optional(v.string()),
    specs: v.optional(v.string()),
    maxPlayers: v.optional(v.number()),
    ramGb: v.optional(v.number()),
    storageGb: v.optional(v.number()),
    monthlyPriceUsd: v.optional(v.number()),
    isFeatured: v.optional(v.boolean()),
    sortIndex: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("mcServerPlans", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("mcServerPlans"),
    name: v.optional(v.string()),
    shortTag: v.optional(v.string()),
    description: v.optional(v.string()),
    specs: v.optional(v.string()),
    maxPlayers: v.optional(v.number()),
    ramGb: v.optional(v.number()),
    storageGb: v.optional(v.number()),
    monthlyPriceUsd: v.optional(v.number()),
    isFeatured: v.optional(v.boolean()),
    sortIndex: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const existing = await ctx.db.get(id);
    if (!existing) return;
    await ctx.db.patch(id, { ...patch, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("mcServerPlans") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
EOF

cat > "$CONVEX_DIR/mcButtons.ts" <<'EOF'
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByGroup = query({
  args: { group: v.string() },
  handler: async (ctx, { group }) => {
    const buttons = await ctx.db
      .query("mcButtons")
      .withIndex("by_group", (q) => q.eq("group", group))
      .order("asc")
      .collect();

    return buttons;
  },
});

export const create = mutation({
  args: {
    key: v.string(),
    label: v.string(),
    href: v.string(),
    variant: v.optional(v.string()),
    icon: v.optional(v.string()),
    group: v.optional(v.string()),
    sortIndex: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("mcButtons", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("mcButtons"),
    label: v.optional(v.string()),
    href: v.optional(v.string()),
    variant: v.optional(v.string()),
    icon: v.optional(v.string()),
    group: v.optional(v.string()),
    sortIndex: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const existing = await ctx.db.get(id);
    if (!existing) return;
    await ctx.db.patch(id, { ...patch, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("mcButtons") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
EOF

cat > "$CONVEX_DIR/mcButtonClicks.ts" <<'EOF'
import { action } from "./_generated/server";
import { v } from "convex/values";

export const logClick = action({
  args: {
    buttonKey: v.string(),
    path: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    userId: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.insert("mcButtonClicks", {
      ...args,
      createdAt: now,
    });
  },
});
EOF

cat > "$CONVEX_DIR/mcTimelineEvents.ts" <<'EOF'
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getPublicTimeline = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const events = await ctx.db
      .query("mcTimelineEvents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("asc")
      .collect();

    return events;
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    year: v.string(),
    title: v.string(),
    body: v.string(),
    tweetUrl: v.optional(v.string()),
    sortIndex: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("mcTimelineEvents", {
      ...args,
      createdAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("mcTimelineEvents"),
    year: v.optional(v.string()),
    title: v.optional(v.string()),
    body: v.optional(v.string()),
    tweetUrl: v.optional(v.string()),
    sortIndex: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const existing = await ctx.db.get(id);
    if (!existing) return;
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("mcTimelineEvents") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
EOF

echo "mc* Convex function files created in $CONVEX_DIR"

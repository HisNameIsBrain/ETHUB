import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./authz";

export const create = mutation({
  args: {
    customerId: v.id("customers"), deviceModel: v.string(), serial: v.optional(v.string()), issue: v.string(), orderNumber: v.string(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin","staff"]);
    const now = Date.now();
    const id = await ctx.db.insert("jobs", { ...args, status: "received", createdBy: (await ctx.auth.getUserIdentity())!.subject, createdAt: now, updatedAt: now });
    await ctx.db.insert("jobEvents", { jobId: id, type: "received", message: "Device received", createdBy: (await ctx.auth.getUserIdentity())!.subject, createdAt: now });
    return id;
  }
});

export const updateStatus = mutation({
  args: { jobId: v.id("jobs"), status: v.string(), message: v.optional(v.string()) },
  handler: async (ctx, { jobId, status, message }) => {
    await requireRole(ctx, ["admin","staff"]);
    const now = Date.now();
    await ctx.db.patch(jobId, { status, updatedAt: now });
    await ctx.db.insert("jobEvents", { jobId, type: statusMap(status), message, createdBy: (await ctx.auth.getUserIdentity())!.subject, createdAt: now });
  }
});

function statusMap(s: string) {
  switch (s) {
    case "diagnosis": return "diagnosis_started";
    case "awaiting_parts": return "parts_ordered";
    case "repair": return "repair_started";
    case "qa": return "qa_started";
    case "ready": return "ready";
    case "delivered": return "delivered";
    default: return "note";
  }
}

export const addEvent = mutation({
  args: { jobId: v.id("jobs"), type: v.string(), message: v.optional(v.string()), mediaUrls: v.optional(v.array(v.string())) },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin","staff"]);
    await ctx.db.insert("jobEvents", { ...args, createdBy: (await ctx.auth.getUserIdentity())!.subject, createdAt: Date.now() });
  }
});

export const listForStaff = query({
  args: { search: v.optional(v.string()) },
  handler: async (ctx, { search }) => {
    await requireRole(ctx, ["admin","staff"]);
    const all = await ctx.db.query("jobs").collect();
    if (!search) return all;
    const s = search.toLowerCase();
    return all.filter(j => j.orderNumber.toLowerCase().includes(s) || (j.serial ?? "").toLowerCase().includes(s));
  }
});

export const getPublic = query({
  args: { orderNumber: v.string(), token: v.string() },
  handler: async (ctx, { orderNumber, token }) => {
    const job = await ctx.db.query("jobs").withIndex("by_orderNumber", q => q.eq("orderNumber", orderNumber)).first();
    if (!job) throw new Error("Not found");
    if (!job.publicAccessToken || job.publicAccessToken !== token) throw new Error("Forbidden");
    if (!job.publicAccessTokenExp || job.publicAccessTokenExp < Date.now()) throw new Error("Expired");
    const events = await ctx.db.query("jobEvents").withIndex("by_job_createdAt", q => q.eq("jobId", job._id)).collect();
    return { job, events };
  }
});

export const issuePublicLink = mutation({
  args: { jobId: v.id("jobs"), ttlMinutes: v.number() },
  handler: async (ctx, { jobId, ttlMinutes }) => {
    await requireRole(ctx, ["admin","staff"]);
    const token = cryptoRandom();
    const exp = Date.now() + ttlMinutes * 60 * 1000;
    await ctx.db.patch(jobId, { publicAccessToken: token, publicAccessTokenExp: exp });
    const job = await ctx.db.get(jobId);
    return { orderNumber: job!.orderNumber, token, exp };
  }
});

function cryptoRandom() {
  const a = globalThis.crypto?.getRandomValues?.(new Uint8Array(16));
  if (a) return Array.from(a).map(x => x.toString(16).padStart(2, "0")).join("");
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

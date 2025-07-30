import { v } from "convex/values";

export const schema = {
  users: {
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  documents: {
    title: v.string(),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isArchived: v.boolean(),
    isPublished: v.optional(v.boolean()),
    parentDocument: v.optional(v.id("documents")),
    orgId: v.optional(v.id("organizations")),
    userId: v.string(),
  },
  organizations: {
    name: v.string(),
  },
  services: {
    name: v.string(),
    description: v.optional(v.string()),
    type: v.optional(v.string()),
    price: v.number(),
    deliveryTime: v.string(),
    createdAt: v.number(),
    isArchived: v.boolean(),
    orgId: v.optional(v.id("organizations")),
  },
  orders: {
    userId: v.string(),
    serviceId: v.id("services"),
    imei: v.string(),
    serial: v.optional(v.string()),
    status: v.string(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  },
};
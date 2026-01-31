import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    profiles: defineTable({
        userId: v.string(), // Link to external auth ID (Supabase or Clerk)
        username: v.optional(v.string()),
        fullName: v.optional(v.string()),
        avatarUrl: v.optional(v.string()),
    }).index("by_userId", ["userId"]),

    items: defineTable({
        userId: v.string(),
        type: v.union(v.literal("code"), v.literal("prompt"), v.literal("file")),
        title: v.string(),
        description: v.optional(v.string()),
        content: v.optional(v.string()),
        language: v.optional(v.string()),
        category: v.optional(v.string()),
        fileUrl: v.optional(v.string()),
        storageId: v.optional(v.string()),
        fileType: v.optional(v.string()),
        fileSize: v.optional(v.number()),
        metadata: v.any(),
        isFavorite: v.boolean(),
    })
        .index("by_userId", ["userId"])
        .index("by_type", ["type"])
        .index("by_userId_type", ["userId", "type"]),

    tags: defineTable({
        userId: v.string(),
        name: v.string(),
        color: v.string(),
    }).index("by_userId", ["userId"]),

    itemTags: defineTable({
        itemId: v.id("items"),
        tagId: v.id("tags"),
    })
        .index("by_itemId", ["itemId"])
        .index("by_tagId", ["tagId"]),

    projects: defineTable({
        userId: v.string(),
        title: v.string(),
        description: v.optional(v.string()),
        status: v.union(
            v.literal("ideation"),
            v.literal("planning"),
            v.literal("in_progress"),
            v.literal("completed")
        ),
        progress: v.number(),
        dueDate: v.optional(v.string()),
        priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
        color: v.string(),
        isArchived: v.boolean(),
        notes: v.optional(v.string()),
    }).index("by_userId", ["userId"]),
});

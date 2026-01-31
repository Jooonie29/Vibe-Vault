import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getItems = query({
    args: {
        userId: v.string(),
        type: v.optional(v.union(v.literal("code"), v.literal("prompt"), v.literal("file")))
    },
    handler: async (ctx, args) => {
        let q = ctx.db
            .query("items")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId));

        if (args.type) {
            q = ctx.db
                .query("items")
                .withIndex("by_userId_type", (q) =>
                    q.eq("userId", args.userId).eq("type", args.type!)
                );
        }

        const items = await q.order("desc").collect();
        return items;
    },
});

export const getItem = query({
    args: { id: v.id("items"), userId: v.string() },
    handler: async (ctx, args) => {
        const item = await ctx.db.get(args.id);
        if (!item || item.userId !== args.userId) return null;
        return item;
    },
});

export const createItem = mutation({
    args: {
        userId: v.string(),
        type: v.union(v.literal("code"), v.literal("prompt"), v.literal("file")),
        title: v.string(),
        description: v.optional(v.string()),
        content: v.optional(v.string()),
        language: v.optional(v.string()),
        category: v.optional(v.string()),
        fileUrl: v.optional(v.string()),
        fileType: v.optional(v.string()),
        fileSize: v.optional(v.number()),
        metadata: v.any(),
        isFavorite: v.boolean(),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("items", args);
        return id;
    },
});

export const updateItem = mutation({
    args: {
        id: v.id("items"),
        userId: v.string(),
        updates: v.object({
            title: v.optional(v.string()),
            description: v.optional(v.string()),
            content: v.optional(v.string()),
            language: v.optional(v.string()),
            category: v.optional(v.string()),
            fileUrl: v.optional(v.string()),
            fileType: v.optional(v.string()),
            fileSize: v.optional(v.number()),
            metadata: v.optional(v.any()),
            isFavorite: v.optional(v.boolean()),
        }),
    },
    handler: async (ctx, args) => {
        const item = await ctx.db.get(args.id);
        if (!item || item.userId !== args.userId) {
            throw new Error("Item not found or unauthorized");
        }
        await ctx.db.patch(args.id, args.updates);
        return args.id;
    },
});

export const deleteItem = mutation({
    args: { id: v.id("items"), userId: v.string() },
    handler: async (ctx, args) => {
        const item = await ctx.db.get(args.id);
        if (!item || item.userId !== args.userId) {
            throw new Error("Item not found or unauthorized");
        }
        await ctx.db.delete(args.id);
        return args.id;
    },
});

export const getStats = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const snippets = await ctx.db
            .query("items")
            .withIndex("by_userId_type", (q) => q.eq("userId", args.userId).eq("type", "code"))
            .collect();

        const prompts = await ctx.db
            .query("items")
            .withIndex("by_userId_type", (q) => q.eq("userId", args.userId).eq("type", "prompt"))
            .collect();

        const files = await ctx.db
            .query("items")
            .withIndex("by_userId_type", (q) => q.eq("userId", args.userId).eq("type", "file"))
            .collect();

        const projects = await ctx.db
            .query("projects")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("isArchived"), false))
            .collect();

        return {
            snippets: snippets.length,
            prompts: prompts.length,
            files: files.length,
            projects: projects.length,
        };
    },
});

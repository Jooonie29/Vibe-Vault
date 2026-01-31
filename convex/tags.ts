import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getTags = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("tags")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .collect();
    },
});

export const createTag = mutation({
    args: {
        userId: v.string(),
        name: v.string(),
        color: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("tags", args);
    },
});

export const deleteTag = mutation({
    args: { id: v.id("tags"), userId: v.string() },
    handler: async (ctx, args) => {
        const tag = await ctx.db.get(args.id);
        if (!tag || tag.userId !== args.userId) {
            throw new Error("Tag not found or unauthorized");
        }
        await ctx.db.delete(args.id);
        return args.id;
    },
});

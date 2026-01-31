import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getProfile = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();
    },
});

export const updateProfile = mutation({
    args: {
        userId: v.string(),
        updates: v.object({
            username: v.optional(v.string()),
            fullName: v.optional(v.string()),
            avatarUrl: v.optional(v.string()),
        }),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, args.updates);
            return existing._id;
        } else {
            return await ctx.db.insert("profiles", {
                userId: args.userId,
                ...args.updates,
            });
        }
    },
});

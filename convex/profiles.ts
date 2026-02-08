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
            email: v.optional(v.string()),
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

export const syncUser = mutation({
    args: {
        userId: v.string(),
        email: v.string(),
        fullName: v.optional(v.string()),
        avatarUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();

        if (existing) {
            if (existing.email !== args.email || existing.fullName !== args.fullName || existing.avatarUrl !== args.avatarUrl) {
                await ctx.db.patch(existing._id, {
                    email: args.email,
                    fullName: args.fullName || existing.fullName,
                    avatarUrl: args.avatarUrl || existing.avatarUrl,
                });
            }
            return existing._id;
        } else {
            return await ctx.db.insert("profiles", {
                userId: args.userId,
                email: args.email,
                fullName: args.fullName,
                avatarUrl: args.avatarUrl,
            });
        }
    },
});

export const searchUsers = query({
    args: { query: v.string() },
    handler: async (ctx, args) => {
        if (!args.query) return [];
        
        // Search by email using search index
        let users = await ctx.db
            .query("profiles")
            .withSearchIndex("search_email", (q) => q.search("email", args.query))
            .take(5);

        // Fallback: If no results, try prefix match (better for partial emails like "joh")
        if (users.length === 0) {
            users = await ctx.db
                .query("profiles")
                .withIndex("by_email")
                .filter((q) => q.gte(q.field("email"), args.query) && q.lt(q.field("email"), args.query + "\uffff"))
                .take(5);
        }

        return users.map(u => ({
            userId: u.userId,
            email: u.email,
            fullName: u.fullName,
            avatarUrl: u.avatarUrl,
            username: u.username
        }));
    },
});

export const getProfilesByUserIds = query({
    args: { userIds: v.array(v.string()) },
    handler: async (ctx, args) => {
        if (args.userIds.length === 0) {
            return [];
        }
        const profiles = await ctx.db.query("profiles").collect();
        const lookup = new Set(args.userIds);
        return profiles.filter((profile) => lookup.has(profile.userId));
    },
});

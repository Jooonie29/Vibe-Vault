import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getTags = query({
    args: { userId: v.string(), teamId: v.optional(v.id("teams")) },
    handler: async (ctx, args) => {
        if (args.teamId) {
            const member = await ctx.db
                .query("teamMembers")
                .withIndex("by_teamId_userId", (q) => q.eq("teamId", args.teamId!).eq("userId", args.userId))
                .first();
            if (!member) return [];

            const team = await ctx.db.get(args.teamId);

            const teamTags = await ctx.db
                .query("tags")
                .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId!))
                .collect();

            if (team?.isPersonal) {
                const legacyTags = await ctx.db
                    .query("tags")
                    .withIndex("by_userId", (q) => q.eq("userId", args.userId))
                    .filter((q) => q.eq(q.field("teamId"), undefined))
                    .collect();
                return [...teamTags, ...legacyTags];
            }

            return teamTags;
        }

        return await ctx.db
            .query("tags")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("teamId"), undefined))
            .collect();
    },
});

export const createTag = mutation({
    args: {
        userId: v.string(),
        teamId: v.optional(v.id("teams")),
        name: v.string(),
        color: v.string(),
    },
    handler: async (ctx, args) => {
        if (args.teamId) {
            const member = await ctx.db
                .query("teamMembers")
                .withIndex("by_teamId_userId", (q) => q.eq("teamId", args.teamId!).eq("userId", args.userId))
                .first();
            if (!member) throw new Error("Not a member of this team");
        }
        return await ctx.db.insert("tags", args);
    },
});

export const deleteTag = mutation({
    args: { id: v.id("tags"), userId: v.string() },
    handler: async (ctx, args) => {
        const tag = await ctx.db.get(args.id);
        if (!tag) throw new Error("Tag not found or unauthorized");
        if (tag.teamId) {
            const member = await ctx.db
                .query("teamMembers")
                .withIndex("by_teamId_userId", (q) => q.eq("teamId", tag.teamId!).eq("userId", args.userId))
                .first();
            if (!member) throw new Error("Tag not found or unauthorized");
        } else if (tag.userId !== args.userId) {
            throw new Error("Tag not found or unauthorized");
        }
        await ctx.db.delete(args.id);
        return args.id;
    },
});

export const migrateLegacyOwnerTagsToTeam = mutation({
    args: { userId: v.string(), teamId: v.id("teams") },
    handler: async (ctx, args) => {
        const membership = await ctx.db
            .query("teamMembers")
            .withIndex("by_teamId_userId", (q) => q.eq("teamId", args.teamId).eq("userId", args.userId))
            .first();
        if (!membership || membership.role !== "admin") return 0;

        const team = await ctx.db.get(args.teamId);
        if (!team || team.isPersonal) return 0;

        const ownerId = team.createdBy;

        const legacyTags = await ctx.db
            .query("tags")
            .withIndex("by_userId", (q) => q.eq("userId", ownerId))
            .filter((q) => q.eq(q.field("teamId"), undefined))
            .collect();

        await Promise.all(legacyTags.map((tag) => ctx.db.patch(tag._id, { teamId: args.teamId })));
        return legacyTags.length;
    },
});

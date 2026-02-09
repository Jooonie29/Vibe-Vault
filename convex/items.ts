import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getItems = query({
    args: {
        userId: v.string(),
        teamId: v.optional(v.id("teams")),
        type: v.optional(v.union(v.literal("code"), v.literal("prompt"), v.literal("file")))
    },
    handler: async (ctx, args) => {
        const enrichItemsWithUrls = async (items: any[]) => {
            return await Promise.all(items.map(async (item) => {
                if (item.type === "file" && item.metadata?.storageId) {
                    const url = await ctx.storage.getUrl(item.metadata.storageId);
                    return { ...item, fileUrl: url || undefined };
                }
                return item;
            }));
        };

        if (args.teamId) {
            const member = await ctx.db
                .query("teamMembers")
                .withIndex("by_teamId_userId", (q) => q.eq("teamId", args.teamId!).eq("userId", args.userId))
                .first();
            if (!member) return [];

            const team = await ctx.db.get(args.teamId);

            let teamQ = ctx.db.query("items").withIndex("by_teamId", (q) => q.eq("teamId", args.teamId!));
            if (args.type) {
                teamQ = ctx.db
                    .query("items")
                    .withIndex("by_teamId_type", (q) => q.eq("teamId", args.teamId!).eq("type", args.type!));
            }

            const teamItems = await teamQ.order("desc").collect();

            if (team?.isPersonal) {
                let legacyQ = ctx.db
                    .query("items")
                    .withIndex("by_userId", (q) => q.eq("userId", args.userId))
                    .filter((q) => q.eq(q.field("teamId"), undefined));

                if (args.type) {
                    legacyQ = ctx.db
                        .query("items")
                        .withIndex("by_userId_type", (q) =>
                            q.eq("userId", args.userId).eq("type", args.type!)
                        )
                        .filter((q) => q.eq(q.field("teamId"), undefined));
                }

                const legacyItems = await legacyQ.order("desc").collect();
                const allItems = [...teamItems, ...legacyItems].sort((a, b) => b._creationTime - a._creationTime);
                return await enrichItemsWithUrls(allItems);
            }

            return await enrichItemsWithUrls(teamItems);
        }

        let q = ctx.db
            .query("items")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("teamId"), undefined));

        if (args.type) {
            q = ctx.db
                .query("items")
                .withIndex("by_userId_type", (q) =>
                    q.eq("userId", args.userId).eq("type", args.type!)
                );
            q = q.filter((q) => q.eq(q.field("teamId"), undefined));
        }

        const items = await q.order("desc").collect();
        return await enrichItemsWithUrls(items);
    },
});

export const getItem = query({
    args: { id: v.id("items"), userId: v.string() },
    handler: async (ctx, args) => {
        const item = await ctx.db.get(args.id);
        if (!item) return null;
        if (item.teamId) {
            const member = await ctx.db
                .query("teamMembers")
                .withIndex("by_teamId_userId", (q) => q.eq("teamId", item.teamId!).eq("userId", args.userId))
                .first();
            if (!member) return null;
            return item;
        }
        if (item.userId !== args.userId) return null;
        return item;
    },
});

export const createItem = mutation({
    args: {
        userId: v.string(),
        teamId: v.optional(v.id("teams")),
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
        if (args.teamId) {
            const member = await ctx.db
                .query("teamMembers")
                .withIndex("by_teamId_userId", (q) => q.eq("teamId", args.teamId!).eq("userId", args.userId))
                .first();
            if (!member) {
                throw new Error("Not a member of this team");
            }
        }
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
        if (!item) throw new Error("Item not found or unauthorized");
        if (item.teamId) {
            const member = await ctx.db
                .query("teamMembers")
                .withIndex("by_teamId_userId", (q) => q.eq("teamId", item.teamId!).eq("userId", args.userId))
                .first();
            if (!member) throw new Error("Item not found or unauthorized");
        } else if (item.userId !== args.userId) {
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
        if (!item) throw new Error("Item not found or unauthorized");
        if (item.teamId) {
            const member = await ctx.db
                .query("teamMembers")
                .withIndex("by_teamId_userId", (q) => q.eq("teamId", item.teamId!).eq("userId", args.userId))
                .first();
            if (!member) throw new Error("Item not found or unauthorized");
        } else if (item.userId !== args.userId) {
            throw new Error("Item not found or unauthorized");
        }
        await ctx.db.delete(args.id);
        return args.id;
    },
});

export const getStats = query({
    args: { userId: v.string(), teamId: v.optional(v.id("teams")) },
    handler: async (ctx, args) => {
        if (args.teamId) {
            const member = await ctx.db
                .query("teamMembers")
                .withIndex("by_teamId_userId", (q) => q.eq("teamId", args.teamId!).eq("userId", args.userId))
                .first();
            if (!member) {
                return { snippets: 0, prompts: 0, files: 0, projects: 0 };
            }

            const team = await ctx.db.get(args.teamId);

            const snippets = await ctx.db
                .query("items")
                .withIndex("by_teamId_type", (q) => q.eq("teamId", args.teamId!).eq("type", "code"))
                .collect();

            const prompts = await ctx.db
                .query("items")
                .withIndex("by_teamId_type", (q) => q.eq("teamId", args.teamId!).eq("type", "prompt"))
                .collect();

            const files = await ctx.db
                .query("items")
                .withIndex("by_teamId_type", (q) => q.eq("teamId", args.teamId!).eq("type", "file"))
                .collect();

            const projects = await ctx.db
                .query("projects")
                .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId!))
                .filter((q) => q.eq(q.field("isArchived"), false))
                .collect();

            if (team?.isPersonal) {
                const legacySnippets = await ctx.db
                    .query("items")
                    .withIndex("by_userId_type", (q) => q.eq("userId", args.userId).eq("type", "code"))
                    .filter((q) => q.eq(q.field("teamId"), undefined))
                    .collect();

                const legacyPrompts = await ctx.db
                    .query("items")
                    .withIndex("by_userId_type", (q) => q.eq("userId", args.userId).eq("type", "prompt"))
                    .filter((q) => q.eq(q.field("teamId"), undefined))
                    .collect();

                const legacyFiles = await ctx.db
                    .query("items")
                    .withIndex("by_userId_type", (q) => q.eq("userId", args.userId).eq("type", "file"))
                    .filter((q) => q.eq(q.field("teamId"), undefined))
                    .collect();

                return {
                    snippets: snippets.length + legacySnippets.length,
                    prompts: prompts.length + legacyPrompts.length,
                    files: files.length + legacyFiles.length,
                    projects: projects.length,
                };
            }

            return {
                snippets: snippets.length,
                prompts: prompts.length,
                files: files.length,
                projects: projects.length,
            };
        }

        const snippets = await ctx.db
            .query("items")
            .withIndex("by_userId_type", (q) => q.eq("userId", args.userId).eq("type", "code"))
            .filter((q) => q.eq(q.field("teamId"), undefined))
            .collect();

        const prompts = await ctx.db
            .query("items")
            .withIndex("by_userId_type", (q) => q.eq("userId", args.userId).eq("type", "prompt"))
            .filter((q) => q.eq(q.field("teamId"), undefined))
            .collect();

        const files = await ctx.db
            .query("items")
            .withIndex("by_userId_type", (q) => q.eq("userId", args.userId).eq("type", "file"))
            .filter((q) => q.eq(q.field("teamId"), undefined))
            .collect();

        const projects = await ctx.db
            .query("projects")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("isArchived"), false))
            .filter((q) => q.eq(q.field("teamId"), undefined))
            .collect();

        return {
            snippets: snippets.length,
            prompts: prompts.length,
            files: files.length,
            projects: projects.length,
        };
    },
});

export const migrateLegacyOwnerItemsToTeam = mutation({
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

        const legacyItems = await ctx.db
            .query("items")
            .withIndex("by_userId", (q) => q.eq("userId", ownerId))
            .filter((q) => q.eq(q.field("teamId"), undefined))
            .collect();

        await Promise.all(legacyItems.map((item) => ctx.db.patch(item._id, { teamId: args.teamId })));
        return legacyItems.length;
    },
});

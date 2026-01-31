import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getProjects = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("projects")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .order("desc")
            .collect();
    },
});

export const createProject = mutation({
    args: {
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
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("projects", args);
    },
});

export const updateProject = mutation({
    args: {
        id: v.id("projects"),
        userId: v.string(),
        updates: v.object({
            title: v.optional(v.string()),
            description: v.optional(v.string()),
            status: v.optional(
                v.union(
                    v.literal("ideation"),
                    v.literal("planning"),
                    v.literal("in_progress"),
                    v.literal("completed")
                )
            ),
            progress: v.optional(v.number()),
            dueDate: v.optional(v.string()),
            priority: v.optional(
                v.union(v.literal("low"), v.literal("medium"), v.literal("high"))
            ),
            color: v.optional(v.string()),
            isArchived: v.optional(v.boolean()),
            notes: v.optional(v.string()),
        }),
    },
    handler: async (ctx, args) => {
        const project = await ctx.db.get(args.id);
        if (!project || project.userId !== args.userId) {
            throw new Error("Project not found or unauthorized");
        }
        await ctx.db.patch(args.id, args.updates);
        return args.id;
    },
});

export const deleteProject = mutation({
    args: { id: v.id("projects"), userId: v.string() },
    handler: async (ctx, args) => {
        const project = await ctx.db.get(args.id);
        if (!project || project.userId !== args.userId) {
            throw new Error("Project not found or unauthorized");
        }
        await ctx.db.delete(args.id);
        return args.id;
    },
});

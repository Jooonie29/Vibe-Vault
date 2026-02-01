import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getProjects = query({
    args: {
        userId: v.string(),
        teamId: v.optional(v.id("teams")),
    },
    handler: async (ctx, args) => {
        if (args.teamId) {
            return await ctx.db
                .query("projects")
                .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
                .order("desc")
                .collect();
        }

        const projects = await ctx.db
            .query("projects")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .order("desc")
            .collect();

        return projects.filter((p) => !p.teamId);
    },
});

export const createProject = mutation({
    args: {
        userId: v.string(),
        teamId: v.optional(v.id("teams")),
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
        const projectId = await ctx.db.insert("projects", args);
        await ctx.db.insert("projectUpdates", {
            teamId: args.teamId,
            projectId,
            authorId: args.userId,
            type: "created",
            summary: `Created project "${args.title}"`,
            changes: { title: args.title },
        });
        return projectId;
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

        const changes: Record<string, { from: any; to: any }> = {};
        for (const [key, value] of Object.entries(args.updates)) {
            if (value === undefined) continue;
            const previous = (project as any)[key];
            if (previous !== value) {
                changes[key] = { from: previous, to: value };
            }
        }

        await ctx.db.patch(args.id, args.updates);

        if (Object.keys(changes).length > 0) {
            const isNoteUpdate = Object.prototype.hasOwnProperty.call(changes, "notes");
            await ctx.db.insert("projectUpdates", {
                teamId: project.teamId,
                projectId: args.id,
                authorId: args.userId,
                type: isNoteUpdate ? "note" : "updated",
                summary: isNoteUpdate
                    ? `Updated progress note for "${project.title}"`
                    : `Updated project "${project.title}"`,
                changes,
            });
        }

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
        await ctx.db.insert("projectUpdates", {
            teamId: project.teamId,
            projectId: args.id,
            authorId: args.userId,
            type: "deleted",
            summary: `Deleted project "${project.title}"`,
        });
        await ctx.db.delete(args.id);
        return args.id;
    },
});

export const getProjectUpdates = query({
    args: {
        userId: v.string(),
        projectId: v.optional(v.id("projects")),
        teamId: v.optional(v.id("teams")),
        authorId: v.optional(v.string()),
        type: v.optional(
            v.union(
                v.literal("created"),
                v.literal("updated"),
                v.literal("deleted"),
                v.literal("note")
            )
        ),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const projectId = args.projectId;
        if (projectId) {
            const project = await ctx.db.get(projectId);
            if (!project || project.userId !== args.userId) {
                throw new Error("Project not found or unauthorized");
            }
            const query = ctx.db
                .query("projectUpdates")
                .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
                .order("desc");
            let updates = await query.collect();
            if (args.authorId) {
                updates = updates.filter((update) => update.authorId === args.authorId);
            }
            if (args.type) {
                updates = updates.filter((update) => update.type === args.type);
            }
            if (args.teamId) {
                updates = updates.filter((update) => update.teamId === args.teamId);
            }
            if (args.limit) {
                updates = updates.slice(0, args.limit);
            }
            return updates;
        }

        const projects = await ctx.db
            .query("projects")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .collect();
        const projectIds = new Set(projects.map((project) => project._id));

        let updates;
        if (args.teamId) {
            updates = await ctx.db
                .query("projectUpdates")
                .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
                .order("desc")
                .collect();
        } else {
            updates = await ctx.db.query("projectUpdates").order("desc").collect();
        }

        // Filter: Keep updates if the project is created by the user OR the update is authored by the user
        // Only apply this restriction if we are NOT in a team context (Personal view)
        if (!args.teamId) {
            updates = updates.filter((update) => 
                projectIds.has(update.projectId) || update.authorId === args.userId
            );
        }

        if (!args.teamId) {
             // If no team specified (Personal view), filter out team updates? 
             // Or keep logic consistent with "All Updates"?
             // The previous implementation didn't filter teamId if not provided.
             // But existing getProjects logic filters OUT team projects if teamId is not provided.
             // To match "Personal" workspace behavior, we should probably filter out updates that HAVE a teamId.
             // But let's stick to the previous behavior of "Global" unless specific instruction.
             // However, passing teamId filter is safer for filtering.
             
             // Wait, if I use the code above, the `if (args.teamId)` block handles the fetching.
             // The subsequent filter handles ownership.
             
             // What about the existing logic below?
             /*
             updates = updates.filter((update) => projectIds.has(update.projectId));
             if (args.teamId) {
                updates = updates.filter((update) => update.teamId === args.teamId);
             }
             */
             // My new code replaces this.
        }

        if (args.authorId) {
            updates = updates.filter((update) => update.authorId === args.authorId);
        }
        if (args.type) {
            updates = updates.filter((update) => update.type === args.type);
        }
        if (args.limit) {
            updates = updates.slice(0, args.limit);
        }
        return updates;
    },
});

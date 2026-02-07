import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

function isExpired(expiresAt?: string) {
  if (!expiresAt) return false;
  return Date.parse(expiresAt) <= Date.now();
}

async function ensureProjectOwner(ctx: any, projectId: any, userId: string) {
  const project = await ctx.db.get(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  // If project belongs to a team, check if user is a member
  if (project.teamId) {
    const member = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_userId", (q: any) =>
        q.eq("teamId", project.teamId).eq("userId", userId)
      )
      .first();

    if (!member) {
      throw new Error("Unauthorized: Not a team member");
    }
    // Optionally check for specific roles if needed (e.g. viewers can't share)
    if (member.role === "viewer") {
      throw new Error("Unauthorized: Viewers cannot manage shares");
    }
  } else {
    // Personal project
    if (project.userId !== userId) {
      throw new Error("Unauthorized: Not the project owner");
    }
  }

  return project;
}

export const getShareForProject = query({
  args: { userId: v.string(), projectId: v.id("projects") },
  handler: async (ctx, args) => {
    await ensureProjectOwner(ctx, args.projectId, args.userId);
    return await ctx.db
      .query("publicShares")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .first();
  },
});

export const createShare = mutation({
  args: {
    userId: v.string(),
    projectId: v.id("projects"),
    expiresAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ensureProjectOwner(ctx, args.projectId, args.userId);
    const existing = await ctx.db
      .query("publicShares")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        enabled: true,
        expiresAt: args.expiresAt,
      });
      return await ctx.db.get(existing._id);
    }

    const token = crypto.randomUUID().replace(/-/g, "");
    const shareId = await ctx.db.insert("publicShares", {
      projectId: args.projectId,
      teamId: undefined,
      token,
      enabled: true,
      expiresAt: args.expiresAt,
      createdBy: args.userId,
    });
    return await ctx.db.get(shareId);
  },
});

export const updateShare = mutation({
  args: {
    userId: v.string(),
    shareId: v.id("publicShares"),
    enabled: v.optional(v.boolean()),
    expiresAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const share = await ctx.db.get(args.shareId);
    if (!share) throw new Error("Share not found");
    await ensureProjectOwner(ctx, share.projectId, args.userId);
    const updates: any = {};
    if (args.enabled !== undefined) updates.enabled = args.enabled;
    if (args.expiresAt !== undefined) updates.expiresAt = args.expiresAt;
    await ctx.db.patch(args.shareId, updates);
    return await ctx.db.get(args.shareId);
  },
});

export const getShareAnalytics = query({
  args: { userId: v.string(), shareId: v.id("publicShares") },
  handler: async (ctx, args) => {
    const share = await ctx.db.get(args.shareId);
    if (!share) throw new Error("Share not found");
    await ensureProjectOwner(ctx, share.projectId, args.userId);
    const logs = await ctx.db
      .query("accessLogs")
      .withIndex("by_shareId", (q) => q.eq("shareId", args.shareId))
      .order("desc")
      .collect();
    return { total: logs.length, recent: logs.slice(0, 10) };
  },
});

export const getPublicShareByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const share = await ctx.db
      .query("publicShares")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!share || !share.enabled || isExpired(share.expiresAt)) {
      return null;
    }

    const project = await ctx.db.get(share.projectId);
    if (!project) return null;

    const updates = await ctx.db
      .query("projectUpdates")
      .withIndex("by_projectId", (q) => q.eq("projectId", project._id))
      .order("desc")
      .collect();

    const authorIds = Array.from(new Set(updates.map((update: any) => update.authorId)));
    const authors = await Promise.all(
      authorIds.map(async (authorId) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", authorId))
          .first();
        return { userId: authorId, profile };
      })
    );

    return { share, project, updates, authors };
  },
});

export const logPublicShareAccess = mutation({
  args: { token: v.string(), viewerLabel: v.optional(v.string()), referrer: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const share = await ctx.db
      .query("publicShares")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!share || !share.enabled || isExpired(share.expiresAt)) {
      return null;
    }

    await ctx.db.insert("accessLogs", {
      shareId: share._id,
      accessedAt: new Date().toISOString(),
      viewerLabel: args.viewerLabel,
      referrer: args.referrer,
    });

    return share._id;
  },
});

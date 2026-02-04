import { v } from "convex/values";
import { query } from "./_generated/server";

export const getPlanUsage = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        // 1. Calculate Workspaces (Teams created by user)
        // Note: The schema for teams has `by_createdBy` index.
        const personalTeam = await ctx.db
            .query("teams")
            .withIndex("by_createdBy", (q) => q.eq("createdBy", args.userId))
            .filter((q) => q.eq(q.field("isPersonal"), true))
            .first();

        const teamsCreated = await ctx.db
            .query("teams")
            .withIndex("by_createdBy", (q) => q.eq("createdBy", args.userId))
            .collect();

        // We count all teams created by user, excluding the Personal Team
        const workspaces = teamsCreated.filter(
            (t) => t.isPersonal === false
        );

        // 2. Calculate Storage (Sum of file sizes)
        // We sum the fileSize of all items of type "file" for this user
        const files = await ctx.db
            .query("items")
            .withIndex("by_userId_type", (q) => q.eq("userId", args.userId).eq("type", "file"))
            .collect();

        const totalStorageBytes = files.reduce((acc, file) => acc + (file.fileSize || 0), 0);

        // Convert to readable format logic can happen on frontend, here return raw stats
        const usedStorageMB = Math.round(totalStorageBytes / (1024 * 1024) * 100) / 100; // 2 decimal places

        return {
            workspaces: {
                used: workspaces.length,
                limit: 3 // Hardcoded free plan limit
            },
            storage: {
                usedMB: usedStorageMB,
                limitMB: 200 // Hardcoded free plan limit
            }
        };
    },
});

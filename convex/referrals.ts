import { v } from "convex/values";
import { query } from "./_generated/server";

export const getReferralsForUser = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("referrals")
            .withIndex("by_referrerUserId", (q) => q.eq("referrerUserId", args.userId))
            .order("desc")
            .collect();
    },
});

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { api } from "./_generated/api";

const TRIAL_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

const buildReferralCode = (userId: string, seed?: string) => {
    const base = (seed || "user")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "")
        .slice(0, 16);
    const suffix = userId.slice(-6).toLowerCase();
    return `${base || "user"}-${suffix}`;
};

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
            referralCode: v.optional(v.string()),
            referredBy: v.optional(v.string()),
            proTrialEndsAt: v.optional(v.number()),
        }),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();

        if (existing) {
            const referralCode =
                existing.referralCode ||
                args.updates.referralCode ||
                buildReferralCode(
                    args.userId,
                    args.updates.username || args.updates.email || existing.username || existing.email
                );
            await ctx.db.patch(existing._id, {
                ...args.updates,
                referralCode,
            });
            return existing._id;
        } else {
            const referralCode =
                args.updates.referralCode ||
                buildReferralCode(args.userId, args.updates.username || args.updates.email);
            return await ctx.db.insert("profiles", {
                userId: args.userId,
                ...args.updates,
                referralCode,
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
            const referralCode =
                existing.referralCode ||
                buildReferralCode(args.userId, existing.username || args.email);
            if (existing.email !== args.email || existing.fullName !== args.fullName || existing.avatarUrl !== args.avatarUrl) {
                await ctx.db.patch(existing._id, {
                    email: args.email,
                    fullName: args.fullName || existing.fullName,
                    avatarUrl: args.avatarUrl || existing.avatarUrl,
                    referralCode,
                });
            } else if (!existing.referralCode) {
                await ctx.db.patch(existing._id, { referralCode });
            }
            return existing._id;
        } else {
            const referralCode = buildReferralCode(args.userId, args.email);
            const newUserId = await ctx.db.insert("profiles", {
                userId: args.userId,
                email: args.email,
                fullName: args.fullName,
                avatarUrl: args.avatarUrl,
                referralCode,
            });

            // Schedule welcome email via Resend
            await ctx.scheduler.runAfter(0, api.resend.sendWelcomeEmail, {
                email: args.email,
                name: args.fullName || args.email.split("@")[0],
            });

            return newUserId;
        }
    },
});

export const applyReferral = mutation({
    args: {
        userId: v.string(),
        referralCode: v.string(),
    },
    handler: async (ctx, args) => {
        const normalizedCode = args.referralCode.trim().toLowerCase();
        let referrer = await ctx.db
            .query("profiles")
            .withIndex("by_referralCode", (q) => q.eq("referralCode", normalizedCode))
            .unique();

        if (!referrer) {
            const legacyMatch = await ctx.db.query("profiles").collect();
            referrer = legacyMatch.find((profile) => {
                if (profile.username && profile.username.toLowerCase() === normalizedCode) {
                    return true;
                }
                if (profile.email) {
                    const localPart = profile.email.split("@")[0]?.toLowerCase();
                    return localPart === normalizedCode;
                }
                return false;
            }) || null;
        }

        if (!referrer || referrer.userId === args.userId) {
            return { applied: false, reason: "invalid" };
        }

        let profile = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();

        if (!profile) {
            const referralCode = buildReferralCode(args.userId, args.userId);
            const profileId = await ctx.db.insert("profiles", {
                userId: args.userId,
                referralCode,
            });
            profile = await ctx.db.get(profileId);
        }

        const now = Date.now();
        if (profile?.referredBy || (profile?.proTrialEndsAt && profile.proTrialEndsAt > now)) {
            return { applied: false, reason: "already_applied" };
        }

        const newTrialEndsAt = now + TRIAL_DURATION_MS;
        await ctx.db.patch(profile!._id, {
            referredBy: referrer.userId,
            proTrialEndsAt: newTrialEndsAt,
        });

        const existingReferral = await ctx.db
            .query("referrals")
            .withIndex("by_referredUserId", (q) => q.eq("referredUserId", args.userId))
            .first();

        if (!existingReferral) {
            await ctx.db.insert("referrals", {
                referrerUserId: referrer.userId,
                referredUserId: args.userId,
                referralCode: normalizedCode,
                createdAt: now,
            });
        }

        const referrerTrialBase =
            referrer.proTrialEndsAt && referrer.proTrialEndsAt > now
                ? referrer.proTrialEndsAt
                : now;
        const referrerMaxEndsAt = now + TRIAL_DURATION_MS;
        const extendedReferrerEndsAt = Math.min(
            referrerTrialBase + TRIAL_DURATION_MS,
            referrerMaxEndsAt
        );
        await ctx.db.patch(referrer._id, {
            proTrialEndsAt: extendedReferrerEndsAt,
        });

        return { applied: true };
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

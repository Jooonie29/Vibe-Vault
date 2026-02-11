import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const deleteAccountData = mutation({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const { userId } = args;

        const items = await ctx.db
            .query("items")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .collect();

        const itemIds = new Set(items.map((item) => item._id));

        const itemTags = await ctx.db.query("itemTags").collect();
        await Promise.all(
            itemTags
                .filter((tag) => itemIds.has(tag.itemId))
                .map((tag) => ctx.db.delete(tag._id))
        );

        await Promise.all(items.map((item) => ctx.db.delete(item._id)));

        const tags = await ctx.db
            .query("tags")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .collect();
        await Promise.all(tags.map((tag) => ctx.db.delete(tag._id)));

        const projects = await ctx.db
            .query("projects")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .collect();
        await Promise.all(projects.map((project) => ctx.db.delete(project._id)));

        const projectUpdates = await ctx.db
            .query("projectUpdates")
            .withIndex("by_authorId", (q) => q.eq("authorId", userId))
            .collect();
        await Promise.all(projectUpdates.map((update) => ctx.db.delete(update._id)));

        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .collect();
        await Promise.all(notifications.map((n) => ctx.db.delete(n._id)));

        const boardShares = await ctx.db
            .query("boardShares")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .collect();
        await Promise.all(boardShares.map((share) => ctx.db.delete(share._id)));

        const publicShares = await ctx.db.query("publicShares").collect();
        const publicSharesToDelete = publicShares.filter((share) => share.createdBy === userId);
        for (const share of publicSharesToDelete) {
            const accessLogs = await ctx.db
                .query("accessLogs")
                .withIndex("by_shareId", (q) => q.eq("shareId", share._id))
                .collect();
            await Promise.all(accessLogs.map((log) => ctx.db.delete(log._id)));
            await ctx.db.delete(share._id);
        }

        const referralsByReferrer = await ctx.db
            .query("referrals")
            .withIndex("by_referrerUserId", (q) => q.eq("referrerUserId", userId))
            .collect();
        const referralsByReferred = await ctx.db
            .query("referrals")
            .withIndex("by_referredUserId", (q) => q.eq("referredUserId", userId))
            .collect();
        await Promise.all([...referralsByReferrer, ...referralsByReferred].map((r) => ctx.db.delete(r._id)));

        const messages = await ctx.db.query("messages").collect();
        await Promise.all(
            messages
                .filter((message) => message.senderId === userId)
                .map((message) => ctx.db.delete(message._id))
        );

        const conversations = await ctx.db.query("conversations").collect();
        for (const conversation of conversations) {
            if (!conversation.participantIds.includes(userId)) continue;
            const convoMessages = await ctx.db
                .query("messages")
                .withIndex("by_conversationId", (q) => q.eq("conversationId", conversation._id))
                .collect();
            await Promise.all(convoMessages.map((message) => ctx.db.delete(message._id)));
            await ctx.db.delete(conversation._id);
        }

        const teamMembers = await ctx.db
            .query("teamMembers")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .collect();
        await Promise.all(teamMembers.map((member) => ctx.db.delete(member._id)));

        const teamInvites = await ctx.db.query("teamInvites").collect();
        await Promise.all(
            teamInvites
                .filter((invite) => invite.invitedBy === userId)
                .map((invite) => ctx.db.delete(invite._id))
        );

        const teams = await ctx.db
            .query("teams")
            .withIndex("by_createdBy", (q) => q.eq("createdBy", userId))
            .collect();
        for (const team of teams) {
            const teamMembersToDelete = await ctx.db
                .query("teamMembers")
                .withIndex("by_teamId", (q) => q.eq("teamId", team._id))
                .collect();
            await Promise.all(teamMembersToDelete.map((member) => ctx.db.delete(member._id)));

            const invitesToDelete = await ctx.db
                .query("teamInvites")
                .withIndex("by_teamId", (q) => q.eq("teamId", team._id))
                .collect();
            await Promise.all(invitesToDelete.map((invite) => ctx.db.delete(invite._id)));

            const teamProjects = await ctx.db
                .query("projects")
                .withIndex("by_teamId", (q) => q.eq("teamId", team._id))
                .collect();
            await Promise.all(teamProjects.map((project) => ctx.db.delete(project._id)));

            const teamItems = await ctx.db
                .query("items")
                .withIndex("by_teamId", (q) => q.eq("teamId", team._id))
                .collect();
            await Promise.all(teamItems.map((item) => ctx.db.delete(item._id)));

            await ctx.db.delete(team._id);
        }

        const profile = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .unique();
        if (profile) {
            await ctx.db.delete(profile._id);
        }

        return { deleted: true };
    },
});

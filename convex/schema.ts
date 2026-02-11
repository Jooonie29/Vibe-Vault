import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    profiles: defineTable({
        userId: v.string(), // Link to external auth ID (Supabase or Clerk)
        username: v.optional(v.string()),
        fullName: v.optional(v.string()),
        avatarUrl: v.optional(v.string()),
        email: v.optional(v.string()),
        referralCode: v.optional(v.string()),
        referredBy: v.optional(v.string()),
        proTrialEndsAt: v.optional(v.number()),
    })
        .index("by_userId", ["userId"])
        .index("by_email", ["email"])
        .index("by_referralCode", ["referralCode"])
        .searchIndex("search_email", { searchField: "email" }),

    referrals: defineTable({
        referrerUserId: v.string(),
        referredUserId: v.string(),
        referralCode: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("by_referrerUserId", ["referrerUserId"])
        .index("by_referredUserId", ["referredUserId"]),

    items: defineTable({
        userId: v.string(),
        teamId: v.optional(v.id("teams")),
        type: v.union(v.literal("code"), v.literal("prompt"), v.literal("file")),
        title: v.string(),
        description: v.optional(v.string()),
        content: v.optional(v.string()),
        language: v.optional(v.string()),
        category: v.optional(v.string()),
        fileUrl: v.optional(v.string()),
        storageId: v.optional(v.string()),
        fileType: v.optional(v.string()),
        fileSize: v.optional(v.number()),
        metadata: v.any(),
        isFavorite: v.boolean(),
    })
        .index("by_userId", ["userId"])
        .index("by_teamId", ["teamId"])
        .index("by_type", ["type"])
        .index("by_userId_type", ["userId", "type"])
        .index("by_teamId_type", ["teamId", "type"]),

    tags: defineTable({
        userId: v.string(),
        teamId: v.optional(v.id("teams")),
        name: v.string(),
        color: v.string(),
    })
        .index("by_userId", ["userId"])
        .index("by_teamId", ["teamId"]),

    itemTags: defineTable({
        itemId: v.id("items"),
        tagId: v.id("tags"),
    })
        .index("by_itemId", ["itemId"])
        .index("by_tagId", ["tagId"]),

    projects: defineTable({
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
        noteUpdatedAt: v.optional(v.number()),
    })
        .index("by_userId", ["userId"])
        .index("by_teamId", ["teamId"]),

    teams: defineTable({
        name: v.string(),
        description: v.optional(v.string()),
        createdBy: v.string(),
        isPersonal: v.boolean(),
        inviteCode: v.optional(v.string()),
        coverId: v.optional(v.id("_storage")),
    })
        .index("by_createdBy", ["createdBy"])
        .index("by_inviteCode", ["inviteCode"]),

    teamMembers: defineTable({
        teamId: v.id("teams"),
        userId: v.string(),
        role: v.union(v.literal("admin"), v.literal("member"), v.literal("viewer")),
        joinedAt: v.string(),
    })
        .index("by_teamId", ["teamId"])
        .index("by_userId", ["userId"])
        .index("by_teamId_userId", ["teamId", "userId"]),

    teamInvites: defineTable({
        teamId: v.id("teams"),
        email: v.string(),
        code: v.string(),
        token: v.string(),
        role: v.union(v.literal("admin"), v.literal("member"), v.literal("viewer")),
        status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("revoked"), v.literal("expired")),
        invitedBy: v.string(),
        expiresAt: v.optional(v.string()),
    })
        .index("by_teamId", ["teamId"])
        .index("by_email", ["email"])
        .index("by_code", ["code"])
        .index("by_token", ["token"]),

    projectUpdates: defineTable({
        teamId: v.optional(v.id("teams")),
        projectId: v.id("projects"),
        authorId: v.string(),
        type: v.union(v.literal("created"), v.literal("updated"), v.literal("deleted"), v.literal("note")),
        summary: v.string(),
        changes: v.optional(v.any()),
    })
        .index("by_teamId", ["teamId"])
        .index("by_projectId", ["projectId"])
        .index("by_authorId", ["authorId"]),

    boardShares: defineTable({
        teamId: v.optional(v.id("teams")),
        userId: v.string(), // Creator/Owner
        token: v.string(),
        enabled: v.boolean(),
        expiresAt: v.optional(v.string()),
    })
        .index("by_token", ["token"])
        .index("by_userId", ["userId"])
        .index("by_teamId", ["teamId"]),

    publicShares: defineTable({
        projectId: v.id("projects"),
        teamId: v.optional(v.id("teams")),
        token: v.string(),
        enabled: v.boolean(),
        expiresAt: v.optional(v.string()),
        createdBy: v.string(),
    })
        .index("by_projectId", ["projectId"])
        .index("by_token", ["token"]),

    accessLogs: defineTable({
        shareId: v.id("publicShares"),
        accessedAt: v.string(),
        viewerLabel: v.optional(v.string()),
        referrer: v.optional(v.string()),
    })
        .index("by_shareId", ["shareId"]),

    notifications: defineTable({
        userId: v.string(),
        teamId: v.optional(v.id("teams")),
        type: v.union(
            v.literal("invite"),
            v.literal("team"),
            v.literal("project"),
            v.literal("share")
        ),
        title: v.string(),
        message: v.string(),
        read: v.boolean(),
        metadata: v.optional(v.any()),
    })
        .index("by_userId", ["userId"])
        .index("by_teamId", ["teamId"]),

    // Workspace Messaging System (Twitter/X-style DMs)
    conversations: defineTable({
        teamId: v.id("teams"),
        participantIds: v.array(v.string()), // Array of userIds
        isGroup: v.boolean(),
        groupName: v.optional(v.string()),
        groupAvatar: v.optional(v.string()),
        lastMessageAt: v.number(),
        lastMessageText: v.optional(v.string()),
        lastMessageSenderId: v.optional(v.string()),
        unreadCount: v.optional(v.record(v.string(), v.number())), // userId -> unread count
    })
        .index("by_teamId", ["teamId"])
        .index("by_teamId_lastMessageAt", ["teamId", "lastMessageAt"]),

    messages: defineTable({
        conversationId: v.id("conversations"),
        senderId: v.string(),
        text: v.string(),
        attachments: v.optional(v.array(v.object({
            type: v.string(), // 'image', 'file'
            storageId: v.string(),
            name: v.optional(v.string()),
            url: v.optional(v.string()), // For backward compatibility or if we want to store public URL? No, let's rely on storageId
        }))),
        // Legacy fields for backward compatibility
        attachmentId: v.optional(v.string()),
        attachmentType: v.optional(v.string()),
        
        replyToId: v.optional(v.id("messages")),
        editedAt: v.optional(v.number()),
        deletedAt: v.optional(v.number()),
    })
        .index("by_conversationId", ["conversationId"]),
});

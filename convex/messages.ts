import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all conversations for a user in a team
export const getConversations = query({
  args: {
    teamId: v.id("teams"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_teamId_lastMessageAt", (q) =>
        q.eq("teamId", args.teamId)
      )
      .order("desc")
      .take(50);

    // Filter conversations where user is a participant
    const userConversations = conversations.filter((conv) =>
      conv.participantIds.includes(args.userId)
    );

    // Get participant profiles for each conversation
    const conversationsWithProfiles = await Promise.all(
      userConversations.map(async (conv) => {
        const participantProfiles = await Promise.all(
          conv.participantIds
            .filter((pid) => pid !== args.userId) // Exclude current user
            .map(async (pid) => {
              const profile = await ctx.db
                .query("profiles")
                .withIndex("by_userId", (q) => q.eq("userId", pid))
                .unique();
              return {
                userId: pid,
                username: profile?.username,
                fullName: profile?.fullName,
                avatarUrl: profile?.avatarUrl,
              };
            })
        );

        return {
          ...conv,
          participants: participantProfiles,
          unreadCount: conv.unreadCount?.[args.userId] || 0,
        };
      })
    );

    return conversationsWithProfiles;
  },
});

// Get messages for a conversation
export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify user is participant in conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");
    if (!conversation.participantIds.includes(args.userId)) {
      throw new Error("Not authorized");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .take(args.limit || 50);

    // Get sender profiles for each message
    const messagesWithProfiles = await Promise.all(
      messages.map(async (msg) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", msg.senderId))
          .unique();

        let attachmentsWithUrls = undefined;
        if (msg.attachments) {
          attachmentsWithUrls = await Promise.all(
            msg.attachments.map(async (att) => ({
              ...att,
              url: (await ctx.storage.getUrl(att.storageId)) || "",
            }))
          );
        } else if (msg.attachmentId) {
          // Backward compatibility for messages created with attachmentId
          const url = await ctx.storage.getUrl(msg.attachmentId);
          if (url) {
            attachmentsWithUrls = [{
              type: msg.attachmentType || "file",
              storageId: msg.attachmentId,
              url,
              name: "Attachment"
            }];
          }
        }

        return {
          ...msg,
          attachments: attachmentsWithUrls,
          sender: {
            userId: msg.senderId,
            username: profile?.username,
            fullName: profile?.fullName,
            avatarUrl: profile?.avatarUrl,
          },
        };
      })
    );

    return messagesWithProfiles.reverse();
  },
});

// Create or get a direct message conversation
export const getOrCreateDirectConversation = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.string(),
    otherUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if conversation already exists
    const existingConversations = await ctx.db
      .query("conversations")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();

    const participantIds = [args.userId, args.otherUserId].sort();
    const existingConversation = existingConversations.find(
      (conv) =>
        !conv.isGroup &&
        conv.participantIds.length === 2 &&
        conv.participantIds.includes(args.userId) &&
        conv.participantIds.includes(args.otherUserId)
    );

    if (existingConversation) {
      return existingConversation._id;
    }

    // Create new conversation
    const conversationId = await ctx.db.insert("conversations", {
      teamId: args.teamId,
      participantIds: participantIds,
      isGroup: false,
      lastMessageAt: Date.now(),
      unreadCount: {},
    });

    return conversationId;
  },
});

// Create a group conversation
export const createGroupConversation = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.string(),
    participantIds: v.array(v.string()),
    groupName: v.string(),
  },
  handler: async (ctx, args) => {
    // Ensure creator is included
    const allParticipantIds = [...new Set([args.userId, ...args.participantIds])];

    const conversationId = await ctx.db.insert("conversations", {
      teamId: args.teamId,
      participantIds: allParticipantIds,
      isGroup: true,
      groupName: args.groupName,
      lastMessageAt: Date.now(),
      unreadCount: {},
    });

    return conversationId;
  },
});

// Send a message
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.string(),
    text: v.string(),
    replyToId: v.optional(v.id("messages")),
    attachments: v.optional(v.array(v.object({
      type: v.string(),
      storageId: v.string(),
      name: v.optional(v.string()),
    }))),
  },
  handler: async (ctx, args) => {
    // Verify user is participant
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");
    if (!conversation.participantIds.includes(args.userId)) {
      throw new Error("Not authorized");
    }

    // Create message
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.userId,
      text: args.text,
      replyToId: args.replyToId,
      attachments: args.attachments,
    });

    // Update conversation with last message info and increment unread counts
    const unreadCount = { ...conversation.unreadCount };
    conversation.participantIds.forEach((pid) => {
      if (pid !== args.userId) {
        unreadCount[pid] = (unreadCount[pid] || 0) + 1;
      }
    });

    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
      lastMessageText: args.text,
      lastMessageSenderId: args.userId,
      unreadCount,
    });

    return messageId;
  },
});

// Mark conversation as read
export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    const unreadCount = { ...conversation.unreadCount };
    unreadCount[args.userId] = 0;

    await ctx.db.patch(args.conversationId, {
      unreadCount,
    });
  },
});

// Edit a message
export const editMessage = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.string(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");
    if (message.senderId !== args.userId) throw new Error("Not authorized");

    await ctx.db.patch(args.messageId, {
      text: args.text,
      editedAt: Date.now(),
    });
  },
});

// Delete a message (soft delete)
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");
    if (message.senderId !== args.userId) throw new Error("Not authorized");

    await ctx.db.patch(args.messageId, {
      deletedAt: Date.now(),
      text: "This message was deleted",
    });
  },
});

// Delete a conversation
export const deleteConversation = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");
    
    // Verify user is a participant
    if (!conversation.participantIds.includes(args.userId)) {
      throw new Error("Not authorized");
    }

    // If it's a group, only admin/creator might delete? 
    // For simplicity, allow any participant to "leave/delete" for themselves
    // We'll remove the user from participants
    const newParticipants = conversation.participantIds.filter(id => id !== args.userId);
    
    if (newParticipants.length === 0) {
      // If no one left, delete the conversation and messages
      await ctx.db.delete(args.conversationId);
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
        .collect();
      
      for (const msg of messages) {
        await ctx.db.delete(msg._id);
      }
    } else {
      // Just remove the user
      await ctx.db.patch(args.conversationId, {
        participantIds: newParticipants
      });
    }
  },
});

// Get available team members for starting conversations
export const getAvailableTeamMembers = query({
  args: {
    teamId: v.id("teams"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get team members
    const teamMembers = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();

    // Get profiles for members (excluding current user)
    const membersWithProfiles = await Promise.all(
      teamMembers
        .filter((member) => member.userId !== args.userId)
        .map(async (member) => {
          const profile = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", member.userId))
            .unique();

          return {
            userId: member.userId,
            role: member.role,
            username: profile?.username,
            fullName: profile?.fullName,
            avatarUrl: profile?.avatarUrl,
          };
        })
    );

    return membersWithProfiles;
  },
});

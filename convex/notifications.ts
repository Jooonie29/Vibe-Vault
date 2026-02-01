import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getNotifications = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const markNotificationRead = mutation({
  args: { id: v.id("notifications"), userId: v.string() },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.id);
    if (!notification || notification.userId !== args.userId) {
      throw new Error("Notification not found");
    }
    await ctx.db.patch(args.id, { read: true });
    return args.id;
  },
});

export const markAllNotificationsRead = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    await Promise.all(
      notifications.map((notification) => ctx.db.patch(notification._id, { read: true }))
    );
    return notifications.length;
  },
});

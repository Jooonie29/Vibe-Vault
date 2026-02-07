import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const roles = ["admin", "member", "viewer"] as const;

function isExpired(expiresAt?: string) {
  if (!expiresAt) return false;
  return Date.parse(expiresAt) <= Date.now();
}

async function getMemberRole(ctx: any, teamId: any, userId: string) {
  const membership = await ctx.db
    .query("teamMembers")
    .withIndex("by_teamId_userId", (q: any) => q.eq("teamId", teamId).eq("userId", userId))
    .first();
  return membership?.role ?? null;
}

async function ensureAdmin(ctx: any, teamId: any, userId: string) {
  const role = await getMemberRole(ctx, teamId, userId);
  if (role !== "admin") {
    throw new Error("Unauthorized");
  }
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function createInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function createInviteToken() {
  return crypto.randomUUID();
}

export const getTeamsForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const teams = await Promise.all(
      memberships.map(async (membership) => {
        const team = await ctx.db.get(membership.teamId);
        if (!team) return null;
        const members = await ctx.db
          .query("teamMembers")
          .withIndex("by_teamId", (q) => q.eq("teamId", membership.teamId))
          .collect();

        const memberCount = members.length;

        // Fetch profiles for the first 5 members for the avatar stack
        const memberDetails = await Promise.all(
          members.slice(0, 5).map(async (m) => {
            const profile = await ctx.db
              .query("profiles")
              .withIndex("by_userId", (q) => q.eq("userId", m.userId))
              .first();
            return {
              userId: m.userId,
              role: m.role,
              username: profile?.username,
              fullName: profile?.fullName,
              avatarUrl: profile?.avatarUrl,
            };
          })
        );

        return {
          ...team,
          role: membership.role,
          memberCount,
          members: memberDetails,
          coverUrl: team.coverId ? await ctx.storage.getUrl(team.coverId) : null,
        };
      })
    );

    return teams.filter(Boolean);
  },
});

export const ensurePersonalTeam = mutation({
  args: { userId: v.string(), name: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("teams")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", args.userId))
      .filter((q) => q.eq(q.field("isPersonal"), true))
      .first();

    if (existing) {
      const membership = await ctx.db
        .query("teamMembers")
        .withIndex("by_teamId_userId", (q) => q.eq("teamId", existing._id).eq("userId", args.userId))
        .first();
      if (!membership) {
        await ctx.db.insert("teamMembers", {
          teamId: existing._id,
          userId: args.userId,
          role: "admin",
          joinedAt: new Date().toISOString(),
        });
      }
      return existing;
    }

    const teamName = normalizeText(args.name || "Personal Team");
    const teamId = await ctx.db.insert("teams", {
      name: teamName,
      description: "Personal workspace",
      createdBy: args.userId,
      isPersonal: true,
      inviteCode: createInviteCode(),
    });

    await ctx.db.insert("teamMembers", {
      teamId,
      userId: args.userId,
      role: "admin",
      joinedAt: new Date().toISOString(),
    });

    return await ctx.db.get(teamId);
  },
});

export const createTeam = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    coverId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const name = normalizeText(args.name);
    if (!name) throw new Error("Team name is required");

    const teamId = await ctx.db.insert("teams", {
      name,
      description: args.description ? normalizeText(args.description) : undefined,
      createdBy: args.userId,
      isPersonal: false,
      inviteCode: createInviteCode(),
      coverId: args.coverId,
    });

    await ctx.db.insert("teamMembers", {
      teamId,
      userId: args.userId,
      role: "admin",
      joinedAt: new Date().toISOString(),
    });

    return teamId;
  },
});

// Workspace management mutations
export const updateTeam = mutation({
  args: {
    userId: v.string(),
    teamId: v.id("teams"),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      coverId: v.optional(v.id("_storage")),
    }),
  },
  handler: async (ctx, args) => {
    await ensureAdmin(ctx, args.teamId, args.userId);
    const updates: any = {};
    if (args.updates.name !== undefined) {
      updates.name = normalizeText(args.updates.name);
    }
    if (args.updates.description !== undefined) {
      updates.description = args.updates.description ? normalizeText(args.updates.description) : undefined;
    }
    if (args.updates.coverId !== undefined) {
      updates.coverId = args.updates.coverId;
    }
    await ctx.db.patch(args.teamId, updates);
    return args.teamId;
  },
});

export const deleteTeam = mutation({
  args: {
    userId: v.string(),
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    await ensureAdmin(ctx, args.teamId, args.userId);

    // 1. Delete all team members
    const members = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();

    await Promise.all(members.map(member => ctx.db.delete(member._id)));

    // 2. Delete the team itself
    const team = await ctx.db.get(args.teamId);
    if (team?.coverId) {
      // Optional: cleanup storage
      await ctx.storage.delete(team.coverId);
    }

    await ctx.db.delete(args.teamId);
    return args.teamId;
  },
});

export const getTeamMembers = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();

    const profiles = await Promise.all(
      members.map(async (member) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", member.userId))
          .first();
        return {
          ...member,
          profile,
        };
      })
    );

    return profiles;
  },
});

export const inviteMember = mutation({
  args: {
    userId: v.string(),
    teamId: v.id("teams"),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("member"), v.literal("viewer")),
    expiresAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ensureAdmin(ctx, args.teamId, args.userId);
    const email = normalizeText(args.email).toLowerCase();
    if (!email.includes("@")) throw new Error("Invalid email");

    const code = createInviteCode();
    const token = createInviteToken();

    const inviteId = await ctx.db.insert("teamInvites", {
      teamId: args.teamId,
      email,
      code,
      token,
      role: args.role,
      status: "pending",
      invitedBy: args.userId,
      expiresAt: args.expiresAt,
    });

    const members = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();

    await Promise.all(
      members.map((member) =>
        ctx.db.insert("notifications", {
          userId: member.userId,
          teamId: args.teamId,
          type: "invite",
          title: "New team invite",
          message: `${email} was invited to the team.`,
          read: false,
          metadata: { inviteId, email },
        })
      )
    );

    return { inviteId, code, token };
  },
});

export const listTeamInvites = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("teamInvites")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .order("desc")
      .collect();
  },
});

export const listInvitesForEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = normalizeText(args.email).toLowerCase();
    return await ctx.db
      .query("teamInvites")
      .withIndex("by_email", (q) => q.eq("email", email))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
  },
});

export const acceptInviteByToken = mutation({
  args: { userId: v.string(), token: v.string() },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("teamInvites")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!invite || invite.status !== "pending" || isExpired(invite.expiresAt)) {
      throw new Error("Invite not valid");
    }

    const existing = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_userId", (q) => q.eq("teamId", invite.teamId).eq("userId", args.userId))
      .first();

    if (!existing) {
      await ctx.db.insert("teamMembers", {
        teamId: invite.teamId,
        userId: args.userId,
        role: invite.role,
        joinedAt: new Date().toISOString(),
      });
    }

    await ctx.db.patch(invite._id, { status: "accepted" });

    const members = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId", (q) => q.eq("teamId", invite.teamId))
      .collect();

    await Promise.all(
      members.map((member) =>
        ctx.db.insert("notifications", {
          userId: member.userId,
          teamId: invite.teamId,
          type: "team",
          title: "New team member",
          message: "A new member joined the team.",
          read: false,
          metadata: { inviteId: invite._id, userId: args.userId },
        })
      )
    );

    return invite.teamId;
  },
});

export const getOrCreateInviteCode = mutation({
  args: { userId: v.string(), teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await ensureAdmin(ctx, args.teamId, args.userId);
    const team = await ctx.db.get(args.teamId);
    if (!team) throw new Error("Team not found");

    if (team.inviteCode) {
      return team.inviteCode;
    }

    const inviteCode = createInviteCode();
    await ctx.db.patch(args.teamId, { inviteCode });
    return inviteCode;
  },
});

export const acceptInviteByCode = mutation({
  args: { userId: v.string(), code: v.string() },
  handler: async (ctx, args) => {
    const code = args.code.toUpperCase();

    // Check generic team invite code
    const team = await ctx.db
      .query("teams")
      .withIndex("by_inviteCode", (q) => q.eq("inviteCode", code))
      .first();

    if (team) {
      const existing = await ctx.db
        .query("teamMembers")
        .withIndex("by_teamId_userId", (q) => q.eq("teamId", team._id).eq("userId", args.userId))
        .first();

      if (!existing) {
        await ctx.db.insert("teamMembers", {
          teamId: team._id,
          userId: args.userId,
          role: "member", // Default role for code join
          joinedAt: new Date().toISOString(),
        });
      }
      return team._id;
    }

    // Check specific invite
    const invite = await ctx.db
      .query("teamInvites")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();

    if (!invite || invite.status !== "pending" || isExpired(invite.expiresAt)) {
      throw new Error("Invite not valid");
    }

    const existing = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_userId", (q) => q.eq("teamId", invite.teamId).eq("userId", args.userId))
      .first();

    if (!existing) {
      await ctx.db.insert("teamMembers", {
        teamId: invite.teamId,
        userId: args.userId,
        role: invite.role,
        joinedAt: new Date().toISOString(),
      });
    }

    await ctx.db.patch(invite._id, { status: "accepted" });

    return invite.teamId;
  },
});

export const revokeInvite = mutation({
  args: { userId: v.string(), inviteId: v.id("teamInvites") },
  handler: async (ctx, args) => {
    const invite = await ctx.db.get(args.inviteId);
    if (!invite) throw new Error("Invite not found");
    await ensureAdmin(ctx, invite.teamId, args.userId);
    await ctx.db.patch(invite._id, { status: "revoked" });
    return invite._id;
  },
});

export const updateMemberRole = mutation({
  args: {
    userId: v.string(),
    teamId: v.id("teams"),
    memberId: v.id("teamMembers"),
    role: v.union(v.literal("admin"), v.literal("member"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    await ensureAdmin(ctx, args.teamId, args.userId);
    const member = await ctx.db.get(args.memberId);
    if (!member || member.teamId !== args.teamId) throw new Error("Member not found");
    await ctx.db.patch(args.memberId, { role: args.role });
    return args.memberId;
  },
});

export const removeMember = mutation({
  args: { userId: v.string(), teamId: v.id("teams"), memberId: v.id("teamMembers") },
  handler: async (ctx, args) => {
    await ensureAdmin(ctx, args.teamId, args.userId);
    const member = await ctx.db.get(args.memberId);
    if (!member || member.teamId !== args.teamId) throw new Error("Member not found");
    await ctx.db.delete(args.memberId);
    return args.memberId;
  },
});

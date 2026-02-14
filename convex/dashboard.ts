import { v } from "convex/values";
import { query } from "./_generated/server";

export const getRecentItems = query({
    args: {
        userId: v.string(),
        teamId: v.optional(v.id("teams")),
        limit: v.optional(v.number())
    },
    handler: async (ctx, args) => {
        const limit = args.limit || 5;
        let items;

        if (args.teamId) {
            const team = await ctx.db.get(args.teamId);

            // Fetch team items
            const teamItems = await ctx.db
                .query("items")
                .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId!))
                .order("desc")
                .take(limit);

            if (team?.isPersonal) {
                // Also fetch personal items not assigned to a team (legacy)
                const legacyItems = await ctx.db
                    .query("items")
                    .withIndex("by_userId", (q) => q.eq("userId", args.userId))
                    .filter((q) => q.eq(q.field("teamId"), undefined))
                    .order("desc")
                    .take(limit);

                items = [...teamItems, ...legacyItems]
                    .sort((a, b) => b._creationTime - a._creationTime)
                    .slice(0, limit);
            } else {
                items = teamItems;
            }
        } else {
            // Fetch personal items only
            items = await ctx.db
                .query("items")
                .withIndex("by_userId", (q) => q.eq("userId", args.userId))
                .filter((q) => q.eq(q.field("teamId"), undefined))
                .order("desc")
                .take(limit);
        }

        // Optimize: map to essential fields only and exclude heavy content
        return items.map(item => ({
            _id: item._id,
            _creationTime: item._creationTime,
            title: item.title,
            type: item.type,
            // Exclude content, fileUrl, etc. unless needed for list view
        }));
    },
});

export const getChartData = query({
    args: {
        userId: v.string(),
        teamId: v.optional(v.id("teams")),
        timePeriod: v.union(
            v.literal("7days"),
            v.literal("30days"),
            v.literal("3months"),
            v.literal("6months"),
            v.literal("1year")
        )
    },
    handler: async (ctx, args) => {
        const now = new Date();
        const startDates = {
            "7days": new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            "30days": new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            "3months": new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
            "6months": new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
            "1year": new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
        };
        const startDate = startDates[args.timePeriod];
        const startTime = startDate.getTime();

        // 1. Fetch relevant items (optimized by filtering creation time if possible, but Convex doesn't index creation time directly for range queries easily without custom index)
        // However, we can use the 'by_teamId' index and filter, or just fetch all and filter in memory if the dataset isn't huge.
        // Better: Use a custom index on `teamId` + `_creationTime` if we had one.
        // For now, let's fetch essential metadata for items created after startDate.

        let itemsQuery;
        if (args.teamId) {
            itemsQuery = ctx.db
                .query("items")
                .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId!));
        } else {
            itemsQuery = ctx.db
                .query("items")
                .withIndex("by_userId", (q) => q.eq("userId", args.userId))
                .filter((q) => q.eq(q.field("teamId"), undefined));
        }

        // We can't range query _creationTime easily without an index. 
        // We'll fetch everything for the user/team (which is what the client did anyway) 
        // BUT we only return the aggregates, saving bandwidth.
        const allItems = await itemsQuery.collect();
        const relevantItems = allItems.filter(i => i._creationTime >= startTime);

        // 2. Fetch projects
        let projectsQuery;
        if (args.teamId) {
            projectsQuery = ctx.db
                .query("projects")
                .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId!));
        } else {
            projectsQuery = ctx.db
                .query("projects")
                .withIndex("by_userId", (q) => q.eq("userId", args.userId))
                .filter((q) => q.eq(q.field("teamId"), undefined));
        }
        const allProjects = await projectsQuery.collect();
        const relevantProjects = allProjects.filter(p => p._creationTime >= startTime);

        // 3. Aggregate Data
        const dataPoints: { name: string; items: number; projects: number }[] = [];
        let points = 6;
        let interval: 'day' | 'month' = 'month';

        switch (args.timePeriod) {
            case "7days": points = 7; interval = 'day'; break;
            case "30days": points = 30; interval = 'day'; break;
            case "3months": points = 3; interval = 'month'; break;
            case "6months": points = 6; interval = 'month'; break;
            case "1year": points = 12; interval = 'month'; break;
        }

        for (let i = points - 1; i >= 0; i--) {
            const date = new Date();
            let label = '';
            let filterFn: (date: Date) => boolean;

            if (interval === 'month') {
                date.setMonth(now.getMonth() - i);
                label = date.toLocaleString('default', { month: 'short' });
                const monthIndex = date.getMonth();
                const year = date.getFullYear();
                filterFn = (d) => d.getMonth() === monthIndex && d.getFullYear() === year;
            } else {
                date.setDate(now.getDate() - i);
                label = date.toLocaleString('default', { weekday: 'short', day: 'numeric' });
                if (args.timePeriod === "7days") label = date.toLocaleString('default', { weekday: 'short' });
                const day = date.getDate();
                const month = date.getMonth();
                const year = date.getFullYear();
                filterFn = (d) => d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
            }

            const itemsCount = relevantItems.filter(item => filterFn(new Date(item._creationTime))).length;
            const projectsCount = relevantProjects.filter(project => filterFn(new Date(project._creationTime))).length;

            dataPoints.push({ name: label, items: itemsCount, projects: projectsCount });
        }

        return dataPoints;
    },
});

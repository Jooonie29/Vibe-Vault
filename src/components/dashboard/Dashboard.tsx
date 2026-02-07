import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Code2,
  MessageSquare,
  FolderOpen,
  Kanban,
  ArrowUpRight,
  Star,
  Activity,
  Users,
  MoreHorizontal,
  ChevronDown,
  X,
  Info,
  Zap,
  Crown,
  Check,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from "lucide-react";
import { useStats, useItems } from "@/hooks/useItems";
import { useProjects } from "@/hooks/useProjects";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useUIStore } from "@/store/uiStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { format, subDays, isSameDay } from "date-fns";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectAnalytics } from "./ProjectAnalytics";


const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - (v / max) * 100,
  }));
  const path = `M ${points.map((p) => `${p.x},${p.y}`).join(" L ")}`;

  return (
    <svg className="w-12 h-6" viewBox="0 0 100 100" preserveAspectRatio="none">
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const statCards = [
  {
    key: "snippets",
    label: "Code Snippets",
    icon: Code2,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    key: "prompts",
    label: "AI Prompts",
    icon: MessageSquare,
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    key: "files",
    label: "File Assets",
    icon: FolderOpen,
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    key: "projects",
    label: "Projects",
    icon: Kanban,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
];

type TimePeriod = "7days" | "30days" | "3months" | "6months" | "1year";

interface TimeOption {
  value: TimePeriod;
  label: string;
  days: number;
}

const timeOptions: TimeOption[] = [
  { value: "7days", label: "Last 7 days", days: 7 },
  { value: "30days", label: "This month", days: 30 },
  { value: "3months", label: "Last 3 months", days: 90 },
  { value: "6months", label: "Last 6 months", days: 180 },
  { value: "1year", label: "This year", days: 365 },
];

export function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: snippets } = useItems("code");
  const { data: prompts } = useItems("prompt");
  const { data: files } = useItems("file");
  const { data: projects } = useProjects();
  const { data: teamMembers, isLoading: teamMembersLoading } = useTeamMembers();
  const { openModal, initializedViews, markViewInitialized, setCurrentView } =
    useUIStore();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("30days");

  // Logic for recent activity and performance data
  const recentItems = useMemo(() => {
    const all = [...(snippets || []), ...(prompts || []), ...(files || [])];
    return all.sort(
      (a, b) => (b as any)._creationTime - (a as any)._creationTime,
    );
  }, [snippets, prompts, files]);

  const itemsLoading = !snippets || !prompts || !files;

  const hasInitialized = initializedViews.has("dashboard");

  React.useEffect(() => {
    if (!hasInitialized) {
      markViewInitialized("dashboard");
    }
  }, [hasInitialized, markViewInitialized]);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [showLearnMore, setShowLearnMore] = useState(false);

  const inProgressProjects =
    projects?.filter((p) => p.status === "in_progress") || [];
  const selectedTimeOption =
    timeOptions.find((opt) => opt.value === timePeriod) || timeOptions[1];

  // Generate graph data based on selected time period
  const { chartData, trend, totalActivity, maxValue, analyticsData } = useMemo(() => {
    if (!recentItems)
      return { chartData: [], trend: 0, totalActivity: 0, maxValue: 0, analyticsData: [] };

    const days = selectedTimeOption.days;
    // Limit to 7 days for the chart to make it cleaner
    const points = Math.min(days, 7);
    const chartData = Array.from({ length: points }, (_, i) => {
      const date = subDays(new Date(), points - 1 - i);
      const count = recentItems.filter((item) =>
        isSameDay(new Date((item as any)._creationTime), date),
      ).length;
      return { date, count, label: format(date, "MMM d") };
    });

    // Format data for ProjectAnalytics component
    const analyticsData = chartData.map(d => ({
      day: format(d.date, "EEE").charAt(0), // First letter of day name
      fullDate: d.date.toISOString(),
      value: d.count,
      label: d.label
    }));

    // Calculate trend (compare last 7 days vs previous 7 days)
    const lastWeek = chartData.slice(-7).reduce((sum, d) => sum + d.count, 0);
    const prevWeek = chartData
      .slice(-14, -7)
      .reduce((sum, d) => sum + d.count, 0);
    const trendValue =
      prevWeek === 0
        ? lastWeek > 0
          ? 100
          : 0
        : Math.round(((lastWeek - prevWeek) / prevWeek) * 100);

    const totalActivity = chartData.reduce((sum, d) => sum + d.count, 0);
    const maxValue = Math.max(...chartData.map((d) => d.count), 1);

    return { chartData, trend: trendValue, totalActivity, maxValue, analyticsData };
  }, [recentItems, selectedTimeOption]);

  const handleViewAllActivity = () => {
    setShowAllActivity(true);
  };

  const handlePeriodChange = (period: TimePeriod) => {
    setTimePeriod(period);
    toast.success(
      `Showing data for ${timeOptions.find((opt) => opt.value === period)?.label}`,
    );
  };

  const getMemberColor = (index: number) => {
    const colors = [
      "bg-blue-100 text-blue-600",
      "bg-pink-100 text-pink-600",
      "bg-amber-100 text-amber-600",
      "bg-emerald-100 text-emerald-600",
      "bg-violet-100 text-violet-600",
      "bg-orange-100 text-orange-600",
    ];
    return colors[index % colors.length];
  };

  const getMemberInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:h-[calc(100vh-3rem)] overflow-hidden">
      {/* Left Column - Main Content */}
      <div className="xl:col-span-2 flex flex-col gap-4 h-full min-h-0">
        {/* Performance / Overview Card */}
        <div className="flex-1 min-h-0">
          <Card
            padding="none"
            variant="glow"
            className="h-full relative overflow-hidden rounded-[1.5rem] shadow-sm"
          >
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tighter">
                    Project Analytics
                  </h2>
                  <p className="text-gray-400 dark:text-violet-300 text-[10px] mt-0.5 font-bold uppercase tracking-widest bg-violet-50 dark:bg-violet-900/30 w-fit px-2 py-0.5 rounded-full">
                    Velocity
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full px-4 py-1.5 text-xs font-semibold border-gray-200 hover:bg-gray-50"
                    >
                      {selectedTimeOption.label}{" "}
                      <ChevronDown className="ml-2 w-3 h-3 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    {timeOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => handlePeriodChange(option.value)}
                        className="text-xs cursor-pointer"
                      >
                        {option.label}
                        {timePeriod === option.value && (
                          <Check className="ml-auto w-3 h-3" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Professional Performance Chart */}
              <div className="flex-1 min-h-0 overflow-hidden">
                {itemsLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="w-full h-32 bg-gray-100 rounded-2xl animate-pulse" />
                  </div>
                ) : (
                  <ProjectAnalytics 
                    data={analyticsData} 
                    maxValue={maxValue} 
                    timePeriod={selectedTimeOption.label}
                  />
                )}
              </div>

              {/* Stats Grid at Bottom of Card */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-gray-100 mt-auto">
                {statsLoading
                  ? [1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-16 bg-gray-50 rounded-2xl animate-pulse"
                      />
                    ))
                  : statCards.map((stat, idx) => {
                      const value =
                        stats?.[stat.key as keyof typeof stats] || 0;
                      // Mock trend data for sparklines
                      const trends = [
                        [10, 20, 15, 30, 25, 40, 35],
                        [5, 15, 10, 25, 20, 35, 30],
                        [8, 12, 10, 20, 15, 25, 22],
                        [12, 10, 15, 12, 18, 14, 20],
                      ];

                      return (
                        <div
                          key={stat.key}
                          className="flex items-center justify-between group p-2 rounded-2xl hover:bg-violet-50/50 transition-all duration-300 border border-transparent hover:border-violet-100 cursor-default"
                        >
                          <div className="flex flex-col">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-2xl font-extrabold text-gray-900 tracking-tighter group-hover:text-violet-600 transition-colors uppercase">
                                {value}
                              </span>
                              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                {stat.label.split(" ")[0]}
                              </span>
                            </div>
                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">
                              {stat.label}
                            </p>
                          </div>
                          <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                            <Sparkline
                              data={trends[idx]}
                              color={
                                idx === 0
                                  ? "#3b82f6"
                                  : idx === 1
                                    ? "#a855f7"
                                    : idx === 2
                                      ? "#f59e0b"
                                      : "#10b981"
                              }
                            />
                          </div>
                        </div>
                      );
                    })}
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions (Moved to main column) */}
        <div className="flex-1 min-h-0">
          <Card
            padding="sm"
            variant="glass"
            className="h-full flex flex-col rounded-[1.5rem]"
          >
            <div className="flex items-center justify-between mb-2 shrink-0">
              <h3 className="font-bold text-gray-900 text-base tracking-tight">
                Quick Actions
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2 flex-1">
              {[
                {
                  label: "Snippet",
                  action: () => openModal("item", { type: "code" }),
                  color: "indigo",
                  icon: Code2,
                },
                {
                  label: "Prompt",
                  action: () => openModal("item", { type: "prompt" }),
                  color: "violet",
                  icon: MessageSquare,
                },
                {
                  label: "Upload",
                  action: () => openModal("item", { type: "file" }),
                  color: "amber",
                  icon: FolderOpen,
                },
                {
                  label: "Project",
                  action: () => openModal("project"),
                  color: "emerald",
                  icon: BarChart3,
                },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={action.action}
                  className={`relative overflow-hidden p-4 rounded-[1.25rem] flex flex-col items-center justify-center gap-2 transition-all duration-300 border border-${action.color}-100/50 bg-${action.color}-50/30 hover:bg-${action.color}-50/60 group`}
                >
                  <div
                    className={`p-2.5 rounded-2xl bg-white shadow-md shadow-${action.color}-500/10 text-${action.color}-600 group-hover:scale-110 transition-transform duration-500`}
                  >
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest text-${action.color}-700/70`}
                  >
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Right Column */}
      <div className="flex flex-col gap-4 h-full min-h-0">
        {/* Recent Activity */}
        <div className="flex-[1.2] min-h-0">
          <Card
            padding="sm"
            variant="glass"
            className="h-full flex flex-col rounded-[1.5rem] pb-2"
          >
            <div className="flex items-center justify-between mb-2 shrink-0">
              <h3 className="font-bold text-gray-900 text-base tracking-tight">
                Recent Activity
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-medium text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-full px-3"
                onClick={handleViewAllActivity}
              >
                View All
              </Button>
            </div>

            <div className="space-y-2 overflow-y-auto overflow-x-hidden p-1">
              {itemsLoading ? (
                <div className="text-center py-8 text-gray-400 font-medium">
                  Loading...
                </div>
              ) : (
                recentItems?.slice(0, 5).map((item) => {
                  const Icon =
                    item.type === "code"
                      ? Code2
                      : item.type === "prompt"
                        ? MessageSquare
                        : FolderOpen;
                  const color =
                    item.type === "code"
                      ? "text-blue-500 bg-blue-50/50 group-hover:bg-blue-100"
                      : item.type === "prompt"
                        ? "text-purple-500 bg-purple-50/50 group-hover:bg-purple-100"
                        : "text-amber-500 bg-amber-50/50 group-hover:bg-amber-100";
                  return (
                    <div
                      key={(item as any)._id}
                      className="flex items-center gap-3 group cursor-pointer p-1.5 rounded-xl hover:bg-white/50 transition-all border border-transparent hover:border-gray-100/50"
                      onClick={() => openModal("item", item)}
                    >
                      <div
                        className={`p-2 rounded-lg ${color} transition-all duration-300 group-hover:scale-110 shadow-sm shadow-black/[0.02]`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-violet-600 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                          {format(
                            new Date((item as any)._creationTime),
                            "MMM d, yyyy",
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* In Progress (Moved to sidebar) */}
        <div className="flex-1 min-h-0">
          <Card
            padding="sm"
            variant="glass"
            className="h-full flex flex-col rounded-[1.5rem]"
          >
            <div className="flex items-center justify-between mb-2 shrink-0">
              <h3 className="font-bold text-gray-900 text-base tracking-tight">
                In Progress
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] h-6 font-medium text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-full px-2"
                onClick={() => setCurrentView("projects")}
              >
                View All
              </Button>
            </div>

            <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
              {inProgressProjects.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[10px] text-gray-400 font-medium bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                  No active sessions
                </div>
              ) : (
                inProgressProjects.slice(0, 3).map((project, i) => (
                  <div
                    key={project.id}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/50 transition-all cursor-pointer group"
                    onClick={() => openModal("project-view", project)}
                  >
                    <div className="relative shrink-0">
                      <div className="w-7 h-7 rounded-full border-[1.5px] border-violet-100 flex items-center justify-center text-[8px] font-bold text-violet-600 bg-white shadow-sm">
                        {project.progress}%
                      </div>
                      <svg className="absolute inset-0 w-7 h-7 -rotate-90 pointer-events-none">
                        <circle
                          cx="14"
                          cy="14"
                          r="12.5"
                          fill="none"
                          stroke="#8B5CF6"
                          strokeWidth="1.5"
                          strokeDasharray="78"
                          strokeDashoffset={
                            78 - (78 * (project.progress || 0)) / 100
                          }
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[11px] font-bold text-gray-900 truncate group-hover:text-violet-600 transition-colors uppercase tracking-tight">
                        {project.title}
                      </h4>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-violet-400"></span>
                        <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Visual Summary (Compact) */}
            <div className="mt-2 flex justify-between items-center p-2 rounded-xl bg-violet-50/30 border border-violet-100/50 shrink-0">
              <div className="text-center flex-1">
                <span className="block text-xs font-black text-gray-900">
                  {inProgressProjects.length}
                </span>
                <span className="text-[7px] text-gray-400 font-bold uppercase tracking-tighter">
                  Live
                </span>
              </div>
              <div className="w-px h-4 bg-violet-100"></div>
              <div className="text-center flex-1">
                <span className="block text-xs font-black text-gray-900">
                  {projects?.filter((p) => p.status === "completed").length ||
                    0}
                </span>
                <span className="text-[7px] text-gray-400 font-bold uppercase tracking-tighter">
                  Done
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Team Section */}
        <div className="flex-1 min-h-0">
          <Card
            padding="sm"
            variant="glass"
            className="h-full flex flex-col rounded-[1.5rem]"
          >
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h3 className="font-bold text-gray-900 text-lg tracking-tight">
                Team Members
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 rounded-full p-0 flex items-center justify-center text-gray-400 hover:text-violet-600 hover:bg-violet-50"
                onClick={() => setCurrentView("settings")}
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {teamMembersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-2">
                      <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-100 rounded animate-pulse mb-1 w-24" />
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : teamMembers && teamMembers.length > 0 ? (
                teamMembers.slice(0, 5).map((member, i) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <div
                      className={`w-10 h-10 rounded-full ${getMemberColor(i)} flex items-center justify-center text-sm font-bold relative shrink-0`}
                    >
                      {member.profile?.avatarUrl ? (
                        <img
                          src={member.profile.avatarUrl}
                          alt={
                            member.profile.fullName || member.profile.username
                          }
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getMemberInitials(
                          member.profile?.fullName ||
                            member.profile?.username ||
                            "User",
                        )
                      )}
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 truncate">
                        {member.profile?.fullName ||
                          member.profile?.username ||
                          "Team Member"}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium capitalize">
                        {member.role}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-violet-600 h-8 w-8 p-0 rounded-full"
                      onClick={() => toast.info("Messaging coming soon!")}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-400 text-xs">
                  No team members yet
                </div>
              )}

              <button
                onClick={() => openModal("invite-member")}
                className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all border border-dashed border-gray-200 hover:border-violet-200 mt-2"
              >
                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-violet-100">
                  <span className="text-lg leading-none mb-0.5">+</span>
                </div>
                Add Member
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* View All Activity Dialog */}
      <Dialog open={showAllActivity} onOpenChange={setShowAllActivity}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>All Recent Activity</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => setShowAllActivity(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[60vh] space-y-2 pr-2">
            {recentItems?.map((item) => {
              const Icon =
                item.type === "code"
                  ? Code2
                  : item.type === "prompt"
                    ? MessageSquare
                    : FolderOpen;
              const color =
                item.type === "code"
                  ? "text-blue-500 bg-blue-50"
                  : item.type === "prompt"
                    ? "text-purple-500 bg-purple-50"
                    : "text-amber-500 bg-amber-50";

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-3 rounded-xl transition-all duration-200"
                  onClick={() => {
                    setShowAllActivity(false);
                    openModal("item", item);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center transition-colors shadow-sm`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-violet-700 transition-colors">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500 capitalize">
                          {item.type}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-400">
                          {format(
                            new Date((item as any)._creationTime),
                            "MMM d, yyyy",
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-violet-600"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Learn More Dialog */}
      <Dialog open={showLearnMore} onOpenChange={setShowLearnMore}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-violet-600" />
              Free Plan Limits
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              You're currently on the Free plan. Here are your current usage and
              limits:
            </p>

            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Workspaces
                  </span>
                  <span className="text-sm font-bold text-gray-900">2/3</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-300 to-orange-400 w-[66%] rounded-full" />
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Storage
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    45MB / 200MB
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-300 to-teal-400 w-[22%] rounded-full" />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500" />
                Upgrade to Pro for:
              </h4>
              <ul className="space-y-2">
                {[
                  "Unlimited workspaces",
                  "10GB storage",
                  "Advanced analytics",
                  "Priority support",
                  "Team collaboration",
                ].map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <Check className="w-4 h-4 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              onClick={() => {
                setShowLearnMore(false);
                toast.success("Redirecting to pricing...");
              }}
            >
              <Zap className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

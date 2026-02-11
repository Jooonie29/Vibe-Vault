import React, { useMemo, useState } from "react";
import {
  Code2,
  MessageSquare,
  FolderOpen,
  Kanban,
  Star,
  Users,
  MoreHorizontal,
  ChevronDown,
  Check,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Search,
  Bell,
  CheckCircle2,
  RefreshCw,
  ArrowUpRight,
  Info,
  Crown,
  X,
  Plus,
  ChevronRight,
  ArrowUpCircle,
  ArrowDownCircle,
  Layout,
  Zap
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useStats, useItems } from "@/hooks/useItems";
import { useProjects } from "@/hooks/useProjects";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
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
import { NotificationsPanel } from "@/components/notifications/NotificationsPanel";
import { PricingModal } from "@/components/pricing/PricingModal";
import { CheckoutDrawer } from "@/components/pricing/CheckoutDrawer";
import { CheckoutProvider } from "@clerk/clerk-react/experimental";
import { ClerkLoaded, SignedIn } from "@clerk/clerk-react";
import { DashboardStatCard } from "./DashboardStatCard";
import { ProductivityChart, ProductivityData } from "./ProductivityChart";

export type TimePeriod = "7days" | "30days" | "3months" | "6months" | "1year";

interface TimeOption {
  value: TimePeriod;
  label: string;
  days: number;
}

export const timeOptions: TimeOption[] = [
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
  const { user: storeUser } = useAuthStore();
  const { openModal, initializedViews, markViewInitialized, openFloatingChatWithUser, activeTeamId } =
    useUIStore();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("30days");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationButtonRef = React.useRef<HTMLButtonElement>(null);

  const teams = useQuery(api.teams.getTeamsForUser, storeUser ? { userId: storeUser.id } : "skip");
  const activeTeam = teams?.find(t => t._id === activeTeamId);
  const workspaceName = activeTeam?.name || "Personal Space";

  const notifications = useQuery(
    api.notifications.getNotifications,
    storeUser?.id ? { userId: storeUser.id } : "skip"
  );
  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  const recentItems = useMemo(() => {
    const all = [...(snippets || []), ...(prompts || []), ...(files || [])];
    return all.sort(
      (a, b) => (b as any)._creationTime - (a as any)._creationTime,
    );
  }, [snippets, prompts, files]);

  const itemsLoading = !snippets || !prompts || !files;
  const hasInitialized = initializedViews.has("dashboard");

  // Calculate chart data based on selected time period
  const chartData = useMemo<ProductivityData[]>(() => {
    if (!snippets || !prompts || !files || !projects) return [];

    const allItems = [...snippets, ...prompts, ...files];
    const dataPoints: ProductivityData[] = [];
    const now = new Date();
    
    // Determine number of points and interval based on timePeriod
    let points = 6;
    let interval: 'day' | 'month' = 'month';
    
    switch (timePeriod) {
      case "7days":
        points = 7;
        interval = 'day';
        break;
      case "30days":
        points = 30;
        interval = 'day';
        break;
      case "3months":
        points = 3;
        interval = 'month';
        break;
      case "6months":
        points = 6;
        interval = 'month';
        break;
      case "1year":
        points = 12;
        interval = 'month';
        break;
    }

    // Generate data points
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
        // For "Last 7 days" specifically, use just the day name if it fits better
        if (timePeriod === "7days") {
          label = date.toLocaleString('default', { weekday: 'short' });
        }
        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();
        filterFn = (d) => d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
      }

      // Count items for this period
      const itemsCount = allItems.filter(item => {
        const itemDate = new Date((item as any)._creationTime);
        return filterFn(itemDate);
      }).length;

      // Count projects for this period
      const projectsCount = projects.filter(project => {
        const projectDate = new Date((project as any)._creationTime);
        return filterFn(projectDate);
      }).length;

      dataPoints.push({
        name: label,
        items: itemsCount,
        projects: projectsCount
      });
    }

    return dataPoints;
  }, [snippets, prompts, files, projects, timePeriod]);

  React.useEffect(() => {
    if (!hasInitialized) {
      markViewInitialized("dashboard");
    }
  }, [hasInitialized, markViewInitialized]);

  const [showAllActivity, setShowAllActivity] = useState(false);
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const selectedTimeOption = timeOptions.find((opt) => opt.value === timePeriod) || timeOptions[1];

  const handlePeriodChange = (period: TimePeriod) => {
    setTimePeriod(period);
    const option = timeOptions.find((opt) => opt.value === period);
    toast.success(`Showing data for ${option?.label || ""}`);
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

  // Mocked trends for stat cards
  const mockedHistory = [
    [10, 20, 15, 25, 22, 30, 28],
    [20, 15, 25, 20, 35, 25, 38],
    [30, 25, 20, 15, 20, 10, 15],
    [10, 15, 12, 20, 18, 25, 22],
  ];

  return (
    <div className="space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Workspace</p>
            <h1 className="text-2xl font-bold text-foreground">{workspaceName}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative" onClick={() => openModal('command')}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                className="pl-10 pr-4 py-2 bg-card border border-border rounded-full text-sm w-56 focus:outline-none focus:ring-2 focus:ring-violet-500/20 placeholder-muted-foreground text-foreground cursor-pointer"
                placeholder="Search..."
                type="text"
                readOnly
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center px-4 py-2 bg-card border border-border text-sm text-foreground rounded-full hover:bg-muted/50 transition-colors">
                  {selectedTimeOption.label}
                  <ChevronDown className="ml-2 w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-xl p-1 border-border bg-card">
                {timeOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handlePeriodChange(option.value)}
                    className="text-sm rounded-lg cursor-pointer focus:bg-muted focus:text-foreground"
                  >
                    {option.label}
                    {timePeriod === option.value && <Check className="ml-auto w-4 h-4 text-violet-600" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="relative">
              <button
                ref={notificationButtonRef}
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 bg-card border border-border rounded-full text-muted-foreground hover:text-foreground transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 min-w-[16px] h-[16px] bg-red-500 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-bold text-white transform translate-x-1 -translate-y-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <NotificationsPanel
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                anchorRef={notificationButtonRef}
              />
            </div>
          </div>
        </header>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <DashboardStatCard
            label="Code Snippets"
            value={statsLoading ? "..." : (stats?.snippets || 0).toLocaleString()}
            trend={12}
            icon={Code2}
            color="bg-blue-500"
            history={mockedHistory[0]}
          />
          <DashboardStatCard
            label="AI Prompts"
            value={statsLoading ? "..." : (stats?.prompts || 0).toLocaleString()}
            trend={24}
            icon={MessageSquare}
            color="bg-purple-500"
            history={mockedHistory[1]}
          />
          <DashboardStatCard
            label="File Assets"
            value={statsLoading ? "..." : (stats?.files || 0).toLocaleString()}
            trend={-5}
            icon={FolderOpen}
            color="bg-orange-500"
            history={mockedHistory[2]}
          />
          <DashboardStatCard
            label="Active Projects"
            value={statsLoading ? "..." : (stats?.projects || 0).toString()}
            trend={0}
            icon={Layout}
            color="bg-emerald-500"
            history={mockedHistory[3]}
          />
        </div>

        {/* Main Content Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 space-y-8">
            {/* Productivity Chart Section */}
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground">Workspace Activity</h3>
                  <p className="text-sm text-muted-foreground mt-1">Resources vs Projects created</p>
                </div>
                <button className="text-sm text-muted-foreground hover:text-foreground">
                  {selectedTimeOption.label}
                </button>
              </div>
              <ProductivityChart data={chartData} isLoading={itemsLoading} />
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            {/* Profile Card */}
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border text-center">
              <div className="relative w-20 h-20 mx-auto mb-4">
                {storeUser?.imageUrl ? (
                  <img 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover ring-2 ring-border" 
                    src={storeUser.imageUrl} 
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                    {getMemberInitials(storeUser?.fullName || storeUser?.username || "User")}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center text-white border-2 border-card">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-card-foreground">
                {storeUser?.fullName || storeUser?.username || "User"}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">Creative Technologist</p>

              <div className="flex justify-center gap-4">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="w-4 h-4 text-orange-500" />
                  <span>{teamMembers?.length || 0}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-rose-500" />
                  <span>{stats?.projects || 0}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>12</span>
                </div>
              </div>
            </div>

            {/* Team Members List */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">Team Members</h3>
                <button
                  onClick={() => openModal("invite-member")}
                  className="w-8 h-8 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-3">
                {teamMembersLoading ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">Loading...</div>
                ) : (
                  teamMembers?.slice(0, 4).map((member, i) => (
                    <div key={member.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        {member.profile?.avatarUrl ? (
                          <img
                            alt={member.profile.fullName}
                            className="w-10 h-10 rounded-xl object-cover"
                            src={member.profile.avatarUrl}
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-xl ${getMemberColor(i)} flex items-center justify-center text-sm font-semibold`}>
                            {getMemberInitials(member.profile?.fullName || "User")}
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-medium text-foreground">{member.profile?.fullName || "Team Member"}</h4>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      {member.userId !== storeUser?.id && (
                        <button
                          onClick={() => openFloatingChatWithUser(member.userId)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
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
              let Icon: typeof Code2;
              let color: string;

              if (item.type === "code") {
                Icon = Code2;
                color = "text-blue-500 bg-blue-50";
              } else if (item.type === "prompt") {
                Icon = MessageSquare;
                color = "text-purple-500 bg-purple-50";
              } else {
                Icon = FolderOpen;
                color = "text-amber-500 bg-amber-50";
              }

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
                  "Unlimited Workspaces",
                  "10GB Storage",
                  "Cloud Backup & Sync",
                  "Advanced Search & Filtering",
                  "Unlimited AI Prompts",
                  "Unlimited Code Snippets",
                  "Priority Support",
                  "Shareable Links"
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
                setCheckoutOpen(true);
              }}
            >
              <Zap className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ClerkLoaded>
        <SignedIn>
          <CheckoutProvider
            for="user"
            planId="cplan_39IDnSQQbze6jNELLRKP4tXpcLT"
            planPeriod="month"
          >
            <CheckoutDrawer
              isOpen={checkoutOpen}
              onClose={() => setCheckoutOpen(false)}
              planId="cplan_39IDnSQQbze6jNELLRKP4tXpcLT"
              planPeriod="month"
              planName="Pro"
              planPrice="$5.00/month"
              planDescription="Unlock unlimited potential for growing teams."
              monthlyPrice={5}
              isAnnual={false}
            />
          </CheckoutProvider>
        </SignedIn>
      </ClerkLoaded>
    </div>
  );
}

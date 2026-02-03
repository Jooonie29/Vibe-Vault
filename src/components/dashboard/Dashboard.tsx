import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
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
  BarChart3
} from 'lucide-react';
import { useStats, useItems } from '@/hooks/useItems';
import { useProjects } from '@/hooks/useProjects';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useUIStore } from '@/store/uiStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { format, subDays, isSameDay } from 'date-fns';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const statCards = [
  { key: 'snippets', label: 'Code Snippets', icon: Code2, color: 'text-blue-500', bg: 'bg-blue-50' },
  { key: 'prompts', label: 'AI Prompts', icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-50' },
  { key: 'files', label: 'File Assets', icon: FolderOpen, color: 'text-amber-500', bg: 'bg-amber-50' },
  { key: 'projects', label: 'Projects', icon: Kanban, color: 'text-emerald-500', bg: 'bg-emerald-50' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

type TimePeriod = '7days' | '30days' | '3months' | '6months' | '1year';

interface TimeOption {
  value: TimePeriod;
  label: string;
  days: number;
}

const timeOptions: TimeOption[] = [
  { value: '7days', label: 'Last 7 days', days: 7 },
  { value: '30days', label: 'This month', days: 30 },
  { value: '3months', label: 'Last 3 months', days: 90 },
  { value: '6months', label: 'Last 6 months', days: 180 },
  { value: '1year', label: 'This year', days: 365 },
];

export function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: recentItems, isLoading: itemsLoading } = useItems();
  const { data: projects } = useProjects();
  const { data: teamMembers, isLoading: teamMembersLoading } = useTeamMembers();
  const { openModal, setCurrentView } = useUIStore();
  
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('30days');
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [showLearnMore, setShowLearnMore] = useState(false);

  const inProgressProjects = projects?.filter(p => p.status === 'in_progress') || [];
  const selectedTimeOption = timeOptions.find(opt => opt.value === selectedPeriod) || timeOptions[1];

  // Generate graph data based on selected time period
  const { chartData, trend, totalActivity, maxValue } = useMemo(() => {
    if (!recentItems) return { chartData: [], trend: 0, totalActivity: 0, maxValue: 0 };

    const days = selectedTimeOption.days;
    const points = Math.min(days, 30);
    const chartData = Array.from({ length: points }, (_, i) => {
      const date = subDays(new Date(), points - 1 - i);
      const count = recentItems.filter(item => 
        isSameDay(new Date((item as any)._creationTime), date)
      ).length;
      return { date, count, label: format(date, 'MMM d') };
    });

    // Calculate trend (compare last 7 days vs previous 7 days)
    const lastWeek = chartData.slice(-7).reduce((sum, d) => sum + d.count, 0);
    const prevWeek = chartData.slice(-14, -7).reduce((sum, d) => sum + d.count, 0);
    const trendValue = prevWeek === 0 ? (lastWeek > 0 ? 100 : 0) : Math.round(((lastWeek - prevWeek) / prevWeek) * 100);

    const totalActivity = chartData.reduce((sum, d) => sum + d.count, 0);
    const maxValue = Math.max(...chartData.map(d => d.count), 1);

    return { chartData, trend: trendValue, totalActivity, maxValue };
  }, [recentItems, selectedTimeOption]);

  const handleViewAllActivity = () => {
    setShowAllActivity(true);
  };

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    toast.success(`Showing data for ${timeOptions.find(opt => opt.value === period)?.label}`);
  };

  const getMemberColor = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-pink-100 text-pink-600',
      'bg-amber-100 text-amber-600',
      'bg-emerald-100 text-emerald-600',
      'bg-violet-100 text-violet-600',
      'bg-orange-100 text-orange-600',
    ];
    return colors[index % colors.length];
  };

  const getMemberInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:h-[calc(100vh-3rem)]"
    >
      {/* Left Column - Main Content */}
      <div className="xl:col-span-2 flex flex-col gap-4 h-full">
        {/* Performance / Overview Card */}
        <motion.div variants={item} className="flex-[1.5] min-h-0">
          <Card padding="none" className="h-full flex flex-col relative overflow-hidden bg-white border-0 shadow-xl shadow-gray-200/40 rounded-[32px]">
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Performance Chart</h2>
                  <p className="text-gray-500 text-sm mt-1 font-medium">Your vault activity overview</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full px-4 py-1.5 text-xs font-semibold border-gray-200 hover:bg-gray-50"
                    >
                      {selectedTimeOption.label} <ChevronDown className="ml-2 w-3 h-3 text-gray-400" />
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
                        {selectedPeriod === option.value && <Check className="ml-auto w-3 h-3" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Professional Performance Chart */}
              <div className="flex-1 relative w-full rounded-[24px] bg-white border border-gray-100 mb-3 overflow-hidden">
                {/* Chart Header with Trend */}
                <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${trend >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{trend > 0 ? '+' : ''}{trend}%</span>
                  </div>
                </div>

                {/* Activity Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <div className="flex items-center gap-2 bg-white border border-gray-100 px-3 py-1.5 rounded-full shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                    <span className="text-xs font-semibold text-gray-600">Activity</span>
                  </div>
                </div>

                {/* Chart Content */}
                <div className="h-full flex flex-col pt-14 pb-4 px-4">
                  {/* Main Chart Area */}
                  <div className="flex-1 relative">
                    {/* Y-axis Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center">
                          <span className="text-[10px] text-gray-300 w-6 text-right mr-2">
                            {Math.round(maxValue * (1 - i / 4))}
                          </span>
                          <div className="flex-1 h-px bg-gray-100" />
                        </div>
                      ))}
                    </div>

                    {/* Chart Bars */}
                    <div className="absolute inset-0 pl-8 flex items-end justify-between gap-1">
                      {chartData.map((point, index) => {
                        const height = maxValue > 0 ? (point.count / maxValue) * 100 : 0;
                        const isHighlighted = index === chartData.length - 1;
                        
                        return (
                          <div 
                            key={index} 
                            className="flex-1 flex flex-col items-center justify-end group cursor-pointer"
                          >
                            {/* Tooltip */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-1 px-2 py-1 bg-gray-900 text-white text-[10px] rounded-md whitespace-nowrap z-20">
                              {point.count} items on {point.label}
                            </div>
                            
                            {/* Bar */}
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${Math.max(height, 4)}%` }}
                              transition={{ duration: 0.5, delay: index * 0.02 }}
                              className={`w-full max-w-[24px] rounded-t-md transition-all duration-300 ${
                                isHighlighted 
                                  ? 'bg-gradient-to-t from-violet-600 to-violet-400 shadow-lg shadow-violet-500/30' 
                                  : 'bg-gradient-to-t from-violet-200 to-violet-100 group-hover:from-violet-300 group-hover:to-violet-200'
                              }`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* X-axis Labels */}
                  <div className="flex justify-between pl-8 mt-2 text-[10px] text-gray-400">
                    <span>{chartData[0]?.label}</span>
                    <span className="text-gray-300">|</span>
                    <span>{chartData[Math.floor(chartData.length / 2)]?.label}</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-violet-600 font-medium">{chartData[chartData.length - 1]?.label}</span>
                  </div>
                </div>

                {/* Total Activity Badge */}
                <div className="absolute bottom-4 right-4 bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-100 px-4 py-2 rounded-xl">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-violet-600" />
                    <div>
                      <div className="text-lg font-bold text-gray-900 leading-none">{totalActivity}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wide">Total</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid at Bottom of Card */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-gray-100">
                 {statsLoading ? (
                    [1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-gray-50 rounded-2xl animate-pulse" />)
                 ) : (
                    statCards.map((stat) => {
                      const value = stats?.[stat.key as keyof typeof stats] || 0;
                      return (
                        <div key={stat.key} className="flex flex-col group p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-default">
                           <div className="flex items-end gap-2 mb-1">
                              <span className="text-2xl font-bold text-gray-900 tracking-tight group-hover:text-violet-600 transition-colors">{value}</span>
                              <span className="text-[9px] text-gray-400 mb-1.5 font-bold uppercase tracking-wider">{stat.label.split(' ')[0]}</span>
                           </div>
                           <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                        </div>
                      );
                    })
                 )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* In Progress (Moved to full width in left column) */}
        <motion.div variants={item} className="flex-1 min-h-0">
            <Card padding="md" className="h-full flex flex-col bg-white border-0 shadow-xl shadow-gray-200/40 rounded-[32px]">
                <div className="flex items-center justify-between mb-3 shrink-0">
                <h3 className="font-bold text-gray-900 text-lg tracking-tight">In Progress</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs font-medium text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-full px-3" 
                  onClick={() => setCurrentView('projects')}
                >
                  View All
                </Button>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                {inProgressProjects.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 text-xs font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-200">No active projects</div>
                ) : (
                    inProgressProjects.slice(0, 3).map((project, i) => (
                        <div key={project.id} className="flex items-center gap-4 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => openModal('project-view', project)}>
                            <div className="relative">
                            <div className="w-10 h-10 rounded-full border-[2px] border-violet-100 flex items-center justify-center text-xs font-bold text-violet-600 bg-white shadow-sm">
                                {project.progress}%
                            </div>
                            <svg className="absolute inset-0 w-10 h-10 -rotate-90 pointer-events-none">
                                <circle cx="20" cy="20" r="18.5" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="116" strokeDashoffset={116 - (116 * (project.progress || 0)) / 100} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                            </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-gray-900 truncate mb-0.5">{project.title}</h4>
                                <p className="text-[10px] text-gray-500 font-medium capitalize flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                                {project.status.replace('_', ' ')}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                </div>
                
                {/* Visual Summary */}
                <div className="mt-3 flex justify-between items-center pt-3 border-t border-gray-100 shrink-0">
                <div className="text-center px-4">
                    <span className="block text-xl font-bold text-gray-900">{inProgressProjects.length}</span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Active</span>
                </div>
                <div className="w-px h-6 bg-gray-100"></div>
                <div className="text-center px-4">
                    <span className="block text-xl font-bold text-gray-900">{projects?.filter(p => p.status === 'completed').length || 0}</span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Done</span>
                </div>
                <div className="w-px h-6 bg-gray-100"></div>
                <div className="text-center px-4">
                    <span className="block text-xl font-bold text-gray-900">{projects?.length || 0}</span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Total</span>
                </div>
                </div>
            </Card>
        </motion.div>
      </div>

      {/* Right Column - Community Rank (Recent Items) & Quick Actions & Team Section */}
      <div className="space-y-3 xl:flex xl:flex-col xl:h-full xl:gap-3 xl:space-y-0">
         {/* Recent Activity */}
         <motion.div variants={item} className="shrink-0">
            <Card padding="md" className="flex flex-col bg-white border-0 shadow-xl shadow-gray-200/40 rounded-[32px] pb-3">
               <div className="flex items-center justify-between mb-3 shrink-0">
                  <h3 className="font-bold text-gray-900 text-lg tracking-tight">Recent Activity</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs font-medium text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-full px-3" 
                    onClick={handleViewAllActivity}
                  >
                    View All
                  </Button>
               </div>

               <div className="space-y-1 overflow-y-auto overflow-x-hidden">
                  {itemsLoading ? (
                     <div className="text-center py-8 text-gray-400 font-medium">Loading...</div>
                  ) : recentItems?.slice(0, 5).map((item) => {
                     const Icon = item.type === 'code' ? Code2 : item.type === 'prompt' ? MessageSquare : FolderOpen;
                     const color = item.type === 'code' ? 'text-blue-500 bg-blue-50 group-hover:bg-blue-100' : item.type === 'prompt' ? 'text-purple-500 bg-purple-50 group-hover:bg-purple-100' : 'text-amber-500 bg-amber-50 group-hover:bg-amber-100';
                     
                      return (
                         <div key={item.id} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-all duration-200" onClick={() => openModal('item', item)}>
                           <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center transition-colors shadow-sm`}>
                                 <Icon className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                 <h4 className="text-xs font-bold text-gray-900 group-hover:text-violet-700 transition-colors truncate max-w-[120px]">{item.title}</h4>
                                 <div className="flex items-center gap-1 mt-0.5">
                                    <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                                    <span className="text-[10px] text-gray-400 font-medium">
                                       {format(new Date((item as any)._creationTime), 'MMM d')}
                                    </span>
                                 </div>
                              </div>
                           </div>
                           <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-2 text-gray-400 hover:text-violet-600 hover:bg-white shadow-sm rounded-xl h-7 w-7 p-0 flex items-center justify-center">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                           </Button>
                        </div>
                     );
                  })}
               </div>
            </Card>
         </motion.div>

         {/* Quick Actions (Replaces Schedule) */}
         <motion.div variants={item} className="shrink-0">
            <Card padding="md" className="flex flex-col bg-white border-0 shadow-xl shadow-gray-200/40 rounded-[32px]">
                <div className="flex items-center justify-between mb-3 shrink-0">
                <h3 className="font-bold text-gray-900 text-lg tracking-tight">Quick Actions</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                {[
                    { label: 'Snippet', icon: Code2, type: 'code', color: 'bg-blue-500', shadow: 'shadow-blue-500/30' },
                    { label: 'Prompt', icon: MessageSquare, type: 'prompt', color: 'bg-purple-500', shadow: 'shadow-purple-500/30' },
                    { label: 'Upload', icon: FolderOpen, type: 'file', color: 'bg-amber-500', shadow: 'shadow-amber-500/30' },
                    { label: 'Project', icon: Kanban, type: 'project', color: 'bg-emerald-500', shadow: 'shadow-emerald-500/30' },
                ].map((action) => (
                    <button
                    key={action.type}
                    onClick={() => action.type === 'project' ? openModal('project') : openModal('item', { type: action.type })}
                    className="flex flex-col items-center justify-center p-3 rounded-[20px] bg-gray-50 hover:bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group border border-transparent hover:border-gray-100 w-full"
                    >
                        <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center mb-2 shadow-md ${action.shadow} group-hover:scale-110 transition-transform duration-300`}>
                        <action.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900">{action.label}</span>
                    </button>
                ))}
                </div>
            </Card>
         </motion.div>

         {/* Team Section */}
         <motion.div variants={item} className="xl:flex-1 min-h-0">
            <Card padding="md" className="h-full flex flex-col bg-white border-0 shadow-xl shadow-gray-200/40 rounded-[32px]">
               <div className="flex items-center justify-between mb-3 shrink-0">
                  <h3 className="font-bold text-gray-900 text-lg tracking-tight">Team Members</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 rounded-full p-0 flex items-center justify-center text-gray-400 hover:text-violet-600 hover:bg-violet-50" 
                    onClick={() => setCurrentView('settings')}
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
               </div>

               <div className="space-y-3 flex-1 overflow-y-auto">
                  {teamMembersLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
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
                      <div key={member.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                        <div className={`w-10 h-10 rounded-full ${getMemberColor(i)} flex items-center justify-center text-sm font-bold relative shrink-0`}>
                          {member.profile?.avatarUrl ? (
                            <img 
                              src={member.profile.avatarUrl} 
                              alt={member.profile.fullName || member.profile.username} 
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            getMemberInitials(member.profile?.fullName || member.profile?.username || 'User')
                          )}
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 truncate">
                            {member.profile?.fullName || member.profile?.username || 'Team Member'}
                          </h4>
                          <p className="text-[11px] text-gray-500 font-medium capitalize">{member.role}</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-violet-600 h-8 w-8 p-0 rounded-full"
                          onClick={() => toast.info('Messaging coming soon!')}
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
                    onClick={() => openModal('invite-member')} 
                    className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all border border-dashed border-gray-200 hover:border-violet-200 mt-2"
                  >
                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-violet-100">
                      <span className="text-lg leading-none mb-0.5">+</span>
                    </div>
                    Add Member
                  </button>
               </div>
            </Card>
         </motion.div>
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
              const Icon = item.type === 'code' ? Code2 : item.type === 'prompt' ? MessageSquare : FolderOpen;
              const color = item.type === 'code' ? 'text-blue-500 bg-blue-50' : item.type === 'prompt' ? 'text-purple-500 bg-purple-50' : 'text-amber-500 bg-amber-50';
              
              return (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-3 rounded-xl transition-all duration-200"
                  onClick={() => {
                    setShowAllActivity(false);
                    openModal('item', item);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center transition-colors shadow-sm`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-violet-700 transition-colors">{item.title}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500 capitalize">{item.type}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-400">
                          {format(new Date((item as any)._creationTime), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-gray-400 hover:text-violet-600">
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
              You're currently on the Free plan. Here are your current usage and limits:
            </p>
            
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Workspaces</span>
                  <span className="text-sm font-bold text-gray-900">2/3</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-300 to-orange-400 w-[66%] rounded-full" />
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Storage</span>
                  <span className="text-sm font-bold text-gray-900">45MB / 200MB</span>
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
                  'Unlimited workspaces',
                  '10GB storage',
                  'Advanced analytics',
                  'Priority support',
                  'Team collaboration',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
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
                toast.success('Redirecting to pricing...');
              }}
            >
              <Zap className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

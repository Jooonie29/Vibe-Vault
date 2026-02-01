import React, { useMemo } from 'react';
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
  MoreHorizontal
} from 'lucide-react';
import { useStats, useItems } from '@/hooks/useItems';
import { useProjects } from '@/hooks/useProjects';
import { useUIStore } from '@/store/uiStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { format, subDays, isSameDay } from 'date-fns';
import { toast } from 'sonner';

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

export function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: recentItems, isLoading: itemsLoading } = useItems();
  const { data: projects } = useProjects();
  const { openModal } = useUIStore();

  const inProgressProjects = projects?.filter(p => p.status === 'in_progress') || [];

  // Generate graph data from recent activity
  const { pathData, areaPathData, trend } = useMemo(() => {
    if (!recentItems) return { pathData: "", areaPathData: "", trend: 0 };

    const days = 7;
    const dataPoints = Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      const count = recentItems.filter(item => 
        isSameDay(new Date((item as any)._creationTime), date)
      ).length;
      return count;
    });

    const max = Math.max(...dataPoints, 4); // Min max of 4 for scale
    const width = 100;
    const height = 40;
    
    const points = dataPoints.map((val, i) => {
      const x = (i / (days - 1)) * width;
      const y = height - (val / max) * height; // Invert Y
      return [x, y];
    });

    // Generate smooth path (Catmull-Rom or simple bezier)
    let d = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
        const [x0, y0] = points[i - 1];
        const [x1, y1] = points[i];
        const cpX = (x0 + x1) / 2;
        d += ` C ${cpX} ${y0}, ${cpX} ${y1}, ${x1} ${y1}`;
    }

    const areaD = `${d} L 100 40 L 0 40 Z`;

    // Calculate trend
    const currentPeriod = dataPoints.slice(Math.ceil(days/2)).reduce((a, b) => a + b, 0);
    const prevPeriod = dataPoints.slice(0, Math.ceil(days/2)).reduce((a, b) => a + b, 0);
    const trendValue = prevPeriod === 0 ? 100 : Math.round(((currentPeriod - prevPeriod) / prevPeriod) * 100);

    return { pathData: d, areaPathData: areaD, trend: trendValue };
  }, [recentItems]);

  const handleComingSoon = () => toast.info("This feature is coming soon!");

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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full px-4 py-1.5 text-xs font-semibold border-gray-200 hover:bg-gray-50"
                  onClick={handleComingSoon}
                >
                  This month <span className="ml-2 text-gray-400">▼</span>
                </Button>
              </div>

              {/* Dynamic Graph */}
              <div className="flex-1 relative w-full rounded-[24px] overflow-hidden bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 border border-violet-100/50 mb-3 group shadow-inner">
                {/* Chart Area */}
                <svg className="absolute bottom-0 left-0 right-0 w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                   <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2" />
                         <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                      </linearGradient>
                   </defs>
                   <path d={areaPathData} fill="url(#gradient)" className="transition-all duration-1000 ease-in-out" />
                   <path d={pathData} fill="none" stroke="#8B5CF6" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-1000 ease-in-out drop-shadow-sm" />
                </svg>
                
                {/* Floating Info Card */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-2xl transform transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-2">
                  <span className={`${trend >= 0 ? 'text-emerald-400' : 'text-red-400'} mr-1`}>
                    {trend > 0 ? '+' : ''}{trend}%
                  </span> 
                  {trend >= 0 ? 'More' : 'Less'} activity
                </div>

                 <div className="absolute top-4 left-4 flex items-center gap-3 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/50 shadow-sm">
                   <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-violet-500 shadow-sm shadow-violet-500/50"></span>
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">Activity</span>
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
                <Button variant="ghost" size="sm" className="text-xs font-medium text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-full px-3" onClick={handleComingSoon}>This month ▼</Button>
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
                  <Button variant="ghost" size="sm" className="text-xs font-medium text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-full px-3" onClick={handleComingSoon}>View All</Button>
               </div>

               <div className="space-y-1 overflow-y-auto overflow-x-hidden">
                  {itemsLoading ? (
                     <div className="text-center py-8 text-gray-400 font-medium">Loading...</div>
                  ) : recentItems?.slice(0, 5).map((item) => {
                     const Icon = item.type === 'code' ? Code2 : item.type === 'prompt' ? MessageSquare : FolderOpen;
                     const color = item.type === 'code' ? 'text-blue-500 bg-blue-50 group-hover:bg-blue-100' : item.type === 'prompt' ? 'text-purple-500 bg-purple-50 group-hover:bg-purple-100' : 'text-amber-500 bg-amber-50 group-hover:bg-amber-100';
                     
                     return (
                        <div key={item.id} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-xl transition-all duration-200" onClick={() => openModal('item', item)}>
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
                  <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0 flex items-center justify-center text-gray-400 hover:text-violet-600 hover:bg-violet-50" onClick={handleComingSoon}>
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
               </div>

               <div className="space-y-3 flex-1 overflow-y-auto">
                  {[
                    { name: 'Alex Johnson', role: 'Frontend Dev', online: true, color: 'bg-blue-100 text-blue-600' },
                    { name: 'Sarah Wilson', role: 'Designer', online: true, color: 'bg-pink-100 text-pink-600' },
                    { name: 'Mike Chen', role: 'Backend Dev', online: false, color: 'bg-amber-100 text-amber-600' },
                  ].map((member, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                       <div className={`w-10 h-10 rounded-full ${member.color} flex items-center justify-center text-sm font-bold relative shrink-0`}>
                          {member.name.split(' ').map(n => n[0]).join('')}
                          {member.online && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                          )}
                       </div>
                       <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 truncate">{member.name}</h4>
                          <p className="text-[11px] text-gray-500 font-medium">{member.role}</p>
                       </div>
                       <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-violet-600 h-8 w-8 p-0 rounded-full">
                          <MessageSquare className="w-4 h-4" />
                       </Button>
                    </div>
                  ))}
                  
                  <button onClick={handleComingSoon} className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all border border-dashed border-gray-200 hover:border-violet-200 mt-2">
                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-violet-100">
                      <span className="text-lg leading-none mb-0.5">+</span>
                    </div>
                    Add Member
                  </button>
               </div>
            </Card>
         </motion.div>
      </div>
    </motion.div>
  );
}

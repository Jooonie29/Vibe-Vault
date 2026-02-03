import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Code2,
  MessageSquare,
  FolderOpen,
  Kanban,
  Settings,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Plus,
  Search,
  LayoutGrid,
  Check,
  Sun,
  Moon,
  Star,
  Info,
  Zap,
  Crown,
  X,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/components/theme-provider';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { PricingModal } from '@/components/pricing/PricingModal';

const applicationItems = [
  { id: 'dashboard', label: 'All workspaces', icon: LayoutDashboard },
  { id: 'favorites', label: 'Favorites', icon: Star },
  { id: 'code', label: 'Code Library', icon: Code2 },
  { id: 'prompts', label: 'AI Prompts', icon: MessageSquare },
  { id: 'files', label: 'File Assets', icon: FolderOpen },
  { id: 'projects', label: 'Projects', icon: Kanban },
];

import { useProjects } from '@/hooks/useProjects';

export function Sidebar() {
  const { currentView, setCurrentView, sidebarCollapsed, toggleSidebar, activeTeamId, setActiveTeamId, openModal } = useUIStore();
  const { user, profile } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const teams = useQuery(api.teams.getTeamsForUser, user ? { userId: user.id } : "skip");
  const { data: projects } = useProjects();
  const [showLearnMore, setShowLearnMore] = useState(false);

  const currentTeam = teams?.find(t => t._id === activeTeamId);
  const displayName = profile?.fullName || profile?.username || user?.email?.split('@')[0] || 'User';

  const renderNavGroup = (title: string, items: typeof applicationItems) => (
    <div className="mb-4">
      {!sidebarCollapsed && (
        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-2">
          {title}
        </h3>
      )}
      <div className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => setCurrentView(item.id as any)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full flex items-center rounded-xl transition-all
                ${sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3'}
                py-2
                ${isActive
                  ? 'bg-gray-950 text-white shadow-md font-medium'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }
              `}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-muted-foreground group-hover:text-sidebar-foreground'}`} />
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm"
                >
                  {item.label}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 80 : 250 }}
      className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-40 group/sidebar text-sidebar-foreground"
    >
      {/* Floating Collapse Button */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-9 z-50 w-6 h-6 bg-background border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground shadow-sm transition-colors opacity-0 group-hover/sidebar:opacity-100"
      >
        {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
      {/* User Profile / Workspace Switcher - Moved to Top */}
      <div className={`p-4 pb-2 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
        <DropdownMenu>
          <DropdownMenuTrigger className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center p-0' : 'gap-3 p-2'} rounded-xl border border-sidebar-border bg-sidebar hover:bg-sidebar-accent transition-all outline-none group shadow-sm`}>
             <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-orange-100 to-orange-50 flex items-center justify-center text-orange-600 text-xs font-bold ring-1 ring-gray-100">
                    {profile?.avatarUrl ? (
                        <img src={profile.avatarUrl} alt={displayName} className="w-full h-full rounded-lg object-cover" />
                    ) : (
                        <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${user?.id}`} alt="Avatar" className="w-full h-full rounded-lg" />
                    )}
                </div>
                {/* Small Team Badge */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-900 rounded-md flex items-center justify-center ring-2 ring-white">
                    <span className="text-[8px] font-bold text-white leading-none">
                        {currentTeam?.name?.[0]?.toUpperCase() || 'V'}
                    </span>
                </div>
            </div>
            
            {!sidebarCollapsed && (
                <>
                    <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-semibold text-sidebar-foreground truncate">{displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{currentTeam?.name || 'Personal Workspace'}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-sidebar-foreground" />
                </>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="start" sideOffset={8}>
            <DropdownMenuLabel className="text-xs font-normal text-gray-500">Switch Workspace</DropdownMenuLabel>
            {teams?.map((team) => (
                <DropdownMenuItem
                    key={team._id}
                    onClick={() => setActiveTeamId(team._id)}
                    className="gap-3 cursor-pointer p-2"
                >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                        {team.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${team._id === activeTeamId ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                            {team.name}
                        </p>
                        <p className="text-xs text-gray-500">Team Plan</p>
                    </div>
                    {team._id === activeTeamId && <Check className="w-4 h-4 text-violet-600" />}
                </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer p-2" onClick={() => setActiveTeamId(null)}>
                <div className="w-8 h-8 flex items-center justify-center rounded-lg border border-dashed border-gray-300">
                    <Plus className="w-4 h-4 text-gray-500" />
                </div>
                <span className="text-gray-600 font-medium">Create Workspace</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-normal text-gray-500">My Account</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setCurrentView('settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveTeamId(null)}>
                <LayoutGrid className="w-4 h-4 mr-2" />
                Back to menu
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search */}
      <div className={`px-4 mb-4 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
        <button
            onClick={() => openModal('command')}
            className={`
                flex items-center text-muted-foreground bg-sidebar hover:bg-sidebar-accent border border-sidebar-border transition-all rounded-xl shadow-sm
                ${sidebarCollapsed ? 'w-10 h-10 justify-center p-0' : 'w-full gap-2 px-3 py-2.5'}
            `}
        >
            <Search className="w-4 h-4" />
            {!sidebarCollapsed && (
                <>
                    <span className="text-sm font-medium">Search</span>
                    <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </>
            )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto py-2">
        {renderNavGroup('Applications', applicationItems)}
        
        {/* Divider if needed */}
        {!sidebarCollapsed && <div className="h-px bg-dashed bg-gray-200 my-4 mx-2" />}
        
        {!sidebarCollapsed && (
             <div className="px-3 py-2">
                 <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Projects</h3>
                 <div className="space-y-0.5 max-h-48 overflow-y-auto custom-scrollbar mb-1">
                   {projects?.map((project) => (
                     <button
                       key={project.id}
                       onClick={() => setCurrentView('projects')}
                       className="w-full flex items-center gap-3 px-2 py-1.5 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors group"
                     >
                       <span
                         className="w-2 h-2 rounded-full group-hover:scale-110 transition-transform flex-shrink-0"
                         style={{ backgroundColor: project.color }}
                       />
                       <span className="text-sm truncate">{project.title}</span>
                     </button>
                   ))}
                 </div>
                 <button onClick={() => openModal('project')} className="w-full flex items-center gap-3 px-2 py-1.5 text-muted-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors mt-1">
                     <Plus className="w-4 h-4" />
                     <span className="text-sm">Add New Project</span>
                 </button>
             </div>
        )}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {!sidebarCollapsed && (
          <div className="rounded-2xl bg-gradient-to-b from-violet-500 to-indigo-600 p-3 text-white shadow-lg mx-1 mb-2">
            <div className="flex flex-col items-center text-center mb-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-md mb-2 shadow-inner ring-1 ring-white/30 overflow-hidden">
                     <img src="/Vibe Vault logo-white.png" alt="Vibe Vault" className="w-full h-full object-contain p-1.5" />
                </div>
                
                <h3 className="text-xs font-bold mb-2">Free Plan Limits</h3>
                
                <div className="w-full space-y-2">
                    {/* Workspaces Limit */}
                    <div>
                        <div className="flex justify-between text-[10px] font-medium text-white/90 mb-0.5">
                            <span>Workspaces</span>
                            <span>2/3</span>
                        </div>
                        <div className="h-1 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm ring-1 ring-black/5">
                            <div className="h-full bg-gradient-to-r from-amber-300 to-orange-400 w-[66%] rounded-full shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                        </div>
                    </div>

                    {/* Storage Limit */}
                    <div>
                        <div className="flex justify-between text-[10px] font-medium text-white/90 mb-0.5">
                            <span>Storage</span>
                            <span>45MB / 200MB</span>
                        </div>
                        <div className="h-1 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm ring-1 ring-black/5">
                            <div className="h-full bg-gradient-to-r from-emerald-300 to-teal-400 w-[22%] rounded-full shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="space-y-2 mt-3">
                <button 
                  onClick={() => setShowLearnMore(true)}
                  className="w-full py-2 bg-white text-gray-900 text-[10px] font-bold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                    Learn more
                </button>
                <PricingModal>
                  <button className="w-full py-2 bg-gray-950 text-white text-[10px] font-bold rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 shadow-xl shadow-gray-900/20 group/btn">
                      Upgrade plan
                      <div className="bg-white/20 rounded-full p-0.5 group-hover/btn:bg-white/30 transition-colors">
                          <ChevronRight className="w-2.5 h-2.5" />
                      </div>
                  </button>
                </PricingModal>
            </div>
          </div>
        )}
        
        {/* Theme Toggle */}
        <div className={`pt-2 mt-1 ${!sidebarCollapsed ? '' : 'border-t border-sidebar-border/50'} flex items-center justify-center px-2`}>
             {!sidebarCollapsed && (
                <button 
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="flex items-center gap-2 bg-sidebar-accent p-1 rounded-full border border-sidebar-border cursor-pointer hover:bg-sidebar-accent/80 transition-colors"
                    type="button"
                    aria-label="Toggle theme"
                >
                    <Sun className={`w-3.5 h-3.5 ml-1 ${theme === 'light' ? 'text-amber-500' : 'text-gray-400'}`} />
                    <div 
                        className={`w-10 h-5 rounded-full relative shadow-inner transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-800' : 'bg-orange-400'}`}
                    >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${theme === 'dark' ? 'left-[22px]' : 'left-0.5'}`} />
                    </div>
                    <Moon className={`w-3.5 h-3.5 mr-1 ${theme === 'dark' ? 'text-indigo-400' : 'text-gray-400'}`} />
                </button>
             )}
         </div>
       </div>

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
              }}
            >
              <Zap className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
     </motion.aside>
   );
 }

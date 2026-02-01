import React from 'react';
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
  HelpCircle,
  LogOut,
  Check,
  Sun,
  Moon,
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
import { PricingModal } from '@/components/pricing/PricingModal';

const navItems = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'code', label: 'Code Library', icon: Code2 },
  { id: 'prompts', label: 'AI Prompts', icon: MessageSquare },
  { id: 'files', label: 'File Assets', icon: FolderOpen },
  { id: 'projects', label: 'Projects', icon: Kanban },
];

import { useProjects } from '@/hooks/useProjects';

export function Sidebar() {
  const { currentView, setCurrentView, sidebarCollapsed, toggleSidebar, activeTeamId, setActiveTeamId, openModal } = useUIStore();
  const { user, profile, signOut } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const teams = useQuery(api.teams.getTeamsForUser, user ? { userId: user.id } : "skip");
  const { data: projects } = useProjects();

  const currentTeam = teams?.find(t => t._id === activeTeamId);
  const displayName = profile?.fullName || profile?.username || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '';

  const handleSignOut = async () => {
    await signOut();
    window.location.reload();
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 80 : 250 }}
      className="h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-40 group/sidebar"
    >
      {/* Floating Collapse Button */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-9 z-50 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-sm transition-colors opacity-0 group-hover/sidebar:opacity-100"
      >
        {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
      {/* User Profile / Workspace Switcher - Moved to Top */}
      <div className={`p-4 pb-2 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
        <DropdownMenu>
          <DropdownMenuTrigger className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center p-0' : 'gap-3 p-2'} rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all outline-none group shadow-sm`}>
             <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-orange-100 to-orange-50 flex items-center justify-center text-orange-600 text-xs font-bold ring-1 ring-gray-100">
                    {profile?.avatarUrl ? (
                        <img src={profile.avatarUrl} alt={displayName} className="w-full h-full rounded-lg object-cover" />
                    ) : (
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} alt="Avatar" className="w-full h-full rounded-lg" />
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
                        <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                        <p className="text-xs text-gray-500 truncate">{currentTeam?.name || 'Personal Workspace'}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
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
            <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search */}
      <div className={`px-4 mb-4 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
        <button
            onClick={() => openModal('command')}
            className={`
                flex items-center text-gray-500 bg-white hover:bg-gray-50 border border-gray-200 transition-all rounded-xl shadow-sm
                ${sidebarCollapsed ? 'w-10 h-10 justify-center p-0' : 'w-full gap-2 px-3 py-2.5'}
            `}
        >
            <Search className="w-4 h-4" />
            {!sidebarCollapsed && (
                <>
                    <span className="text-sm font-medium">Search</span>
                    <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-gray-50 px-1.5 font-mono text-[10px] font-medium text-gray-500 opacity-100">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </>
            )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto py-2">
        {navItems.map((item) => {
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
                  ? 'bg-gray-900 text-white shadow-md font-medium'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-900'}`} />
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
        
        {/* Divider if needed */}
        {!sidebarCollapsed && <div className="h-px bg-dashed bg-gray-200 my-4 mx-2" />}
        
        {!sidebarCollapsed && (
             <div className="px-3 py-2">
                 <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Projects</h3>
                 <div className="space-y-0.5 max-h-48 overflow-y-auto custom-scrollbar mb-1">
                   {projects?.map((project) => (
                     <button
                       key={project.id}
                       onClick={() => setCurrentView('projects')}
                       className="w-full flex items-center gap-3 px-2 py-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors group"
                     >
                       <span
                         className="w-2 h-2 rounded-full group-hover:scale-110 transition-transform flex-shrink-0"
                         style={{ backgroundColor: project.color }}
                       />
                       <span className="text-sm truncate">{project.title}</span>
                     </button>
                   ))}
                 </div>
                 <button onClick={() => openModal('project')} className="w-full flex items-center gap-3 px-2 py-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors mt-1">
                     <Plus className="w-4 h-4" />
                     <span className="text-sm">Add New Project</span>
                 </button>
             </div>
        )}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-gray-100 space-y-1">
        {!sidebarCollapsed && (
          <div className="rounded-2xl bg-gradient-to-b from-violet-500 to-indigo-600 p-4 text-white shadow-lg mx-1 mb-3">
            <div className="flex flex-col items-center text-center mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md mb-3 shadow-inner ring-1 ring-white/30 overflow-hidden">
                     <img src="/Vibe Vault logo-white.png" alt="Vibe Vault" className="w-full h-full object-contain p-2" />
                </div>
                
                <h3 className="text-sm font-bold mb-3">Free Plan Limits</h3>
                
                <div className="w-full space-y-3">
                    {/* Workspaces Limit */}
                    <div>
                        <div className="flex justify-between text-[10px] font-medium text-white/90 mb-1">
                            <span>Workspaces</span>
                            <span>2/3</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm ring-1 ring-black/5">
                            <div className="h-full bg-gradient-to-r from-amber-300 to-orange-400 w-[66%] rounded-full shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                        </div>
                    </div>

                    {/* Storage Limit */}
                    <div>
                        <div className="flex justify-between text-[10px] font-medium text-white/90 mb-1">
                            <span>Storage</span>
                            <span>45MB / 200MB</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm ring-1 ring-black/5">
                            <div className="h-full bg-gradient-to-r from-emerald-300 to-teal-400 w-[22%] rounded-full shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="space-y-2.5 mt-4">
                <button className="w-full py-2.5 bg-white text-gray-900 text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                    Learn more
                </button>
                <PricingModal>
                  <button className="w-full py-2.5 bg-gray-950 text-white text-xs font-bold rounded-xl hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 shadow-xl shadow-gray-900/20 group/btn">
                      Upgrade plan
                      <div className="bg-white/20 rounded-full p-0.5 group-hover/btn:bg-white/30 transition-colors">
                          <ChevronRight className="w-3 h-3" />
                      </div>
                  </button>
                </PricingModal>
            </div>
          </div>
        )}
        
        {/* Theme Toggle */}
        <div className={`pt-2 mt-1 ${!sidebarCollapsed ? '' : 'border-t border-gray-100/50'} flex items-center justify-center px-2`}>
             {!sidebarCollapsed && (
                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-full border border-gray-100">
                    <Sun className={`w-3.5 h-3.5 ml-1 ${theme === 'light' ? 'text-amber-500' : 'text-gray-400'}`} />
                    <button 
                        className={`w-10 h-5 rounded-full relative cursor-pointer shadow-inner transition-colors duration-300 focus:outline-none ${theme === 'dark' ? 'bg-slate-800' : 'bg-orange-400'}`}
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        type="button"
                    >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${theme === 'dark' ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>
                    <Moon className={`w-3.5 h-3.5 mr-1 ${theme === 'dark' ? 'text-indigo-400' : 'text-gray-400'}`} />
                </div>
             )}
        </div>
      </div>
    </motion.aside>
  );
}

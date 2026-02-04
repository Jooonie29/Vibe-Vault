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
  const usage = useQuery(api.usage.getPlanUsage, user ? { userId: user.id } : "skip");

  const workspacesLimit = usage?.workspaces.limit || 3;
  const workspacesUsed = usage?.workspaces.used || 0;
  const workspacesPercent = Math.min((workspacesUsed / workspacesLimit) * 100, 100);

  const storageLimit = usage?.storage.limitMB || 200;
  const storageUsed = usage?.storage.usedMB || 0;
  const storagePercent = Math.min((storageUsed / storageLimit) * 100, 100);

  // ... (inside component return)

                <h3 className="text-xs font-bold mb-2">Free Plan Limits</h3>
                
                <div className="w-full space-y-2">
                    {/* Workspaces Limit */}
                    <div>
                        <div className="flex justify-between text-[10px] font-medium text-white/90 mb-0.5">
                            <span>Workspaces</span>
                            <span>{workspacesUsed}/{workspacesLimit}</span>
                        </div>
                        <div className="h-1 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm ring-1 ring-black/5">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${workspacesPercent}%` }}
                              className="h-full bg-gradient-to-r from-amber-300 to-orange-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.6)]" 
                            />
                        </div>
                    </div>

                    {/* Storage Limit */}
                    <div>
                        <div className="flex justify-between text-[10px] font-medium text-white/90 mb-0.5">
                            <span>Storage</span>
                            <span>{storageUsed}MB / {storageLimit}MB</span>
                        </div>
                        <div className="h-1 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm ring-1 ring-black/5">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${storagePercent}%` }}
                              className="h-full bg-gradient-to-r from-emerald-300 to-teal-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.6)]" 
                            />
                        </div>
                    </div>
                </div>
            </div >

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
          </div >
        )
}

{/* Theme Toggle */ }
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
       </div >

  {/* Learn More Dialog */ }
  < Dialog open = { showLearnMore } onOpenChange = { setShowLearnMore } >
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
              <span className="text-sm font-bold text-gray-900">{workspacesUsed}/{workspacesLimit}</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${workspacesPercent}%` }}
                className="h-full bg-gradient-to-r from-amber-300 to-orange-400 rounded-full"
              />
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Storage</span>
              <span className="text-sm font-bold text-gray-900">{storageUsed}MB / {storageLimit}MB</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${storagePercent}%` }}
                className="h-full bg-gradient-to-r from-emerald-300 to-teal-400 rounded-full"
              />
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
      </Dialog >
     </motion.aside >
   );
 }

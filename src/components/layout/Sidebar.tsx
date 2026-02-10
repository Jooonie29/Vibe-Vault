import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { useUser, useClerk } from "@clerk/clerk-react";
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
import { PlanUsageCard } from '@/components/pricing/PlanUsageCard';
import { useProjects } from '@/hooks/useProjects';

const applicationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'favorites', label: 'Favorites', icon: Star },
  { id: 'code', label: 'Code Library', icon: Code2 },
  { id: 'prompts', label: 'AI Prompts', icon: MessageSquare },
  { id: 'files', label: 'File Assets', icon: FolderOpen },
  { id: 'projects', label: 'Projects', icon: Kanban },
];

export function Sidebar() {
  const { currentView, setCurrentView, sidebarCollapsed, toggleSidebar, activeTeamId, setActiveTeamId, openModal } = useUIStore();
  const { profile } = useAuthStore();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { theme, setTheme } = useTheme();
  const [showLearnMore, setShowLearnMore] = useState(false);

  const teams = useQuery(api.teams.getTeamsForUser, user ? { userId: user.id } : "skip");
  const { data: projects } = useProjects();
  const usage = useQuery(api.usage.getPlanUsage, user ? { userId: user.id } : "skip");

  const workspacesLimit = usage?.workspaces.limit || 3;
  const workspacesUsed = usage?.workspaces.used || 0;
  const workspacesPercent = Math.min((workspacesUsed / workspacesLimit) * 100, 100);

  const storageLimit = usage?.storage.limitMB || 200;
  const storageUsed = usage?.storage.usedMB || 0;
  const storagePercent = Math.min((storageUsed / storageLimit) * 100, 100);

  const activeTeam = teams?.find(t => t._id === activeTeamId);

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 80 : 250 }}
      className="fixed left-0 top-0 bottom-0 z-40 bg-sidebar border-r border-sidebar-border hidden md:flex flex-col"
    >
      {/* Header */}
      <div className={`p-4 flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} border-b border-sidebar-border/50 h-16 relative`}>
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
          <img
            src="/Vault Vibe_black.png"
            alt="Vault Vibe"
            className={`${sidebarCollapsed ? 'w-8 h-8' : 'w-10 h-10'} object-contain transition-all duration-300 dark:hidden`}
          />
          <img
            src="/Vault Vibe_white.png"
            alt="Vault Vibe"
            className={`${sidebarCollapsed ? 'w-8 h-8' : 'w-10 h-10'} object-contain transition-all duration-300 hidden dark:block`}
          />
          {!sidebarCollapsed && (
            <span className="font-bold text-xl text-sidebar-foreground tracking-tight whitespace-nowrap overflow-hidden">
              Vault Vibe
            </span>
          )}
        </div>

        {/* Floating Toggle Button */}
        <button
          onClick={toggleSidebar}
          className={`
            absolute -right-3 top-5 w-6 h-6 bg-white border border-sidebar-border rounded-md 
            flex items-center justify-center text-muted-foreground hover:text-foreground 
            shadow-sm z-50 transition-all duration-200 hover:scale-110 group
          `}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          )}
        </button>
      </div>

      {/* Team Switcher */}
      <div className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={`w-full flex items-center gap-3 p-2 hover:bg-sidebar-accent rounded-xl transition-all duration-200 border border-transparent hover:border-sidebar-border group ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-sm shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                {activeTeam?.name?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase()}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-semibold text-sidebar-foreground truncate">{activeTeam?.name || 'Personal Space'}</p>
                  <p className="text-[10px] text-muted-foreground truncate font-medium">Free Plan</p>
                </div>
              )}
              {!sidebarCollapsed && <ChevronDown className="w-4 h-4 text-muted-foreground opacity-50" />}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {teams?.map((team) => (
              <DropdownMenuItem
                key={team._id}
                onClick={() => setActiveTeamId(team._id)}
                className="flex items-center gap-2"
              >
                <div className="w-6 h-6 rounded bg-violet-100 text-violet-600 flex items-center justify-center text-[10px] font-bold">
                  {team.name.charAt(0)}
                </div>
                <span className="flex-1 truncate">{team.name}</span>
                {activeTeamId === team._id && <Check className="w-3.5 h-3.5 text-violet-600" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openModal('team-onboarding')} className="text-violet-600 font-medium">
              <Plus className="w-4 h-4 mr-2" />
              Create workspace
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveTeamId(null)} className="text-muted-foreground">
              <LayoutGrid className="w-4 h-4 mr-2" />
              Back to menu
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()} className="text-red-500 font-medium">
              <X className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto mt-2 custom-scrollbar">
        {applicationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as any)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 group relative ${sidebarCollapsed ? 'justify-center' : ''} ${isActive
                ? 'bg-gray-200/50 dark:bg-white/10 text-black dark:text-white shadow-sm font-semibold'
                : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                }`}
            >
              <Icon className={`w-5 h-5 shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              {isActive && !sidebarCollapsed && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute left-0 w-1 h-5 bg-black dark:bg-white rounded-r-full"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Usage */}
      <div className="p-3 pt-2 border-t border-sidebar-border/50 bg-sidebar-accent/30">
        {!sidebarCollapsed && (
          <PlanUsageCard
            workspacesUsed={workspacesUsed}
            workspacesLimit={workspacesLimit}
            storageUsed={storageUsed}
            storageLimit={storageLimit}
            isPro={false} // This will be dynamic based on user subscription
          />
        )}

        <div className="flex flex-col gap-1">
          {/* Settings Item */}
          <button
            onClick={() => setCurrentView('settings')}
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 group ${sidebarCollapsed ? 'justify-center' : ''} ${currentView === 'settings'
              ? 'bg-gray-200/50 dark:bg-white/10 text-black dark:text-white shadow-sm font-semibold'
              : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
              }`}
          >
            <Settings className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && <span className="text-sm font-medium">Account Settings</span>}
          </button>

          {/* Theme Toggle */}
          <div className={`pt-2 flex items-center justify-center px-1 ${sidebarCollapsed ? 'mt-1' : ''}`}>
            {!sidebarCollapsed ? (
              <div className="w-full flex items-center justify-between bg-sidebar-accent/50 p-1.5 rounded-xl border border-sidebar-border/30">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 flex items-center justify-center py-1 rounded-lg transition-all ${theme === 'light' ? 'bg-background shadow-sm text-amber-500' : 'text-muted-foreground hover:text-sidebar-foreground'}`}
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 flex items-center justify-center py-1 rounded-lg transition-all ${theme === 'dark' ? 'bg-background shadow-sm text-indigo-500' : 'text-muted-foreground hover:text-sidebar-foreground'}`}
                >
                  <Moon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 transition-colors"
              >
                {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Learn More Dialog */}
      {/* Dialog code removed as it's now inside PlanUsageCard */}
    </motion.aside>
  );
}
